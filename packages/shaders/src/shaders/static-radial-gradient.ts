import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import {
  sizingVariablesDeclaration,
  sizingUniformsDeclaration,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing.js';
import { declarePI, declareRotate, declareGrainShape, colorBandingFix } from '../shader-utils.js';

export const staticRadialGradientMeta = {
  maxColorCount: 10,
} as const;

/**
 * N-colors radial gradient
 *
 * Uniforms:
 * - u_colorBack (RGBA)
 * - u_colors (vec4[]), u_colorsCount (float used as integer)
 * - u_radius - circle radius
 * - u_focalDistance, u_focalAngle (float) - gradient center offset to the circle center
 * - u_falloff (-1 .. 1, float) - color points distribution (0 for linear gradient)
 * - u_mixing (0 .. 1, float) - 0 for stepped gradient, 0.5 for smooth transitions, 1 for pronounced color points
 * - u_distortion, u_distortionShift, u_distortionFreq - radial distortion (effective with u_distortion > 0)
 * - u_grainMixer - shape distortion
 * - u_grainOverlay - post-processing blending
 *
 */

// language=GLSL
export const staticRadialGradientFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${staticRadialGradientMeta.maxColorCount}];
uniform float u_colorsCount;

uniform float u_radius;
uniform float u_focalDistance;
uniform float u_focalAngle;
uniform float u_falloff;
uniform float u_mixing;
uniform float u_distortion;
uniform float u_distortionShift;
uniform float u_distortionFreq;
uniform float u_grainMixer;
uniform float u_grainOverlay;

${sizingVariablesDeclaration}
${sizingUniformsDeclaration}

out vec4 fragColor;

${declarePI}
${declareRotate}
${declareGrainShape}

void main() {
  vec2 uv = 2. * v_objectUV;


  vec2 center = vec2(0.);
  float angleRad = radians(u_focalAngle - 90.);
  vec2 focalPoint = vec2(cos(angleRad), sin(angleRad)) * u_focalDistance;
  float radius = u_radius;
  
  vec2 c_to_uv = uv - center;
  vec2 f_to_uv = uv - focalPoint;
  vec2 f_to_c = center - focalPoint;
  float r = length(c_to_uv);
  
  float fragAngle = atan(c_to_uv.y, c_to_uv.x);
  float angleDiff = fragAngle - angleRad;
  angleDiff = mod(angleDiff + PI, TWO_PI) - PI;
  
  float halfAngle = acos(clamp(radius / u_focalDistance, 0.0, 1.0));
  float isInSector = 1.0 - smoothstep(.6 * PI, halfAngle, abs(angleDiff));
  
  float a = dot(f_to_uv, f_to_uv);
  float b = -2.0 * dot(f_to_uv, f_to_c);
  float c = dot(f_to_c, f_to_c) - radius * radius;

  float discriminant = b * b - 4.0 * a * c;
  float t = 1.0;

  if (discriminant >= 0.0) {
    float sqrtD = sqrt(discriminant);
    float t0 = (-b - sqrtD) / (2.0 * a);
    float t1 = (-b + sqrtD) / (2.0 * a);
    t = max(t0, t1);
    if (t < 0.0) t = 0.0;
  }

  float dist = length(f_to_uv);
  float normalized = dist / (length(f_to_uv * t));
  float shape = clamp(normalized, 0.0, 1.0);

  float falloffMapped = mix(.2 + .8 * max(0., u_falloff + 1.), mix(1., 15., pow(u_falloff, 2.)), step(.0, u_falloff));
  
  float falloffExp = mix(falloffMapped, 1., shape);
  shape = pow(shape, falloffExp);
  shape = 1. - clamp(shape, 0., 1.);


  float outerMask = .002;
  float outer = smoothstep(radius + outerMask, radius - outerMask, r);
  outer = mix(outer, 1., isInSector);
  
  shape = mix(0., shape, outer);
  shape *= smoothstep(radius, radius - .01, r);

  float angle = atan(f_to_uv.y, f_to_uv.x);
  shape -= pow(u_distortion, 2.) * shape * pow(sin(PI * clamp(length(f_to_uv) - .2 + u_distortionShift, 0., 1.)), 4.) * (sin(u_distortionFreq * angle) + cos(floor(.65 * u_distortionFreq) * angle));


  vec2 grainUV = rotate(v_objectUV, 2.) * 180.;
  float grain = grainShape(grainUV, vec2(100.));

  float mixerGrain = 1. * u_grainMixer * (grain - .3);
  float mixer = shape * (u_colorsCount - 0.) + mixerGrain;
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  
  float outerShape = 0.;
  for (int i = 1; i < ${staticRadialGradientMeta.maxColorCount + 1}; i++) {
    if (i > int(u_colorsCount)) break;
    float mLinear = clamp(mixer - float(i - 1), 0.0, 1.0);
    
    float m = 0.;
    float mixing = u_mixing * 3.;
    if (mixing > 2.) {
      float tt = pow(mLinear, 2.);
      m = mix(mLinear, tt, .5 * clamp((mixing - 2.), 0., 1.));
    } else if (mixing > 1.) {
      m = mix(smoothstep(0., 1., mLinear), mLinear, clamp((mixing - 1.), 0., 1.));
    } else {
      float aa = fwidth(mLinear);
      m = smoothstep(.5 - .5 * mixing - aa, .5 + .5 * mixing + aa, mLinear);
    }
    
    if (i == 1) {
      outerShape = m;
    }

    vec4 c = u_colors[i - 1];
    c.rgb *= c.a;
    gradient = mix(gradient, c, m);
  }

  vec3 color = gradient.rgb * outerShape;
  float opacity = gradient.a * outerShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u_colorBack.a * (1.0 - opacity);
  
  float rr = grainShape(grainUV, vec2(0.));
  float gg = grainShape(grainUV, vec2(-1.));
  float bb = grainShape(grainUV, vec2(2.));
  vec3 grainColor = 2. * vec3(rr, gg, bb);
  color = mix(color, grainColor, u_grainOverlay * grain);
  
  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface StaticRadialGradientUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_radius: number;
  u_focalDistance: number;
  u_focalAngle: number;
  u_falloff: number;
  u_mixing: number;
  u_distortion: number;
  u_distortionShift: number;
  u_distortionFreq: number;
  u_grainMixer: number;
  u_grainOverlay: number;
}

export interface StaticRadialGradientParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  radius?: number;
  focalDistance?: number;
  focalAngle?: number;
  falloff?: number;
  mixing?: number;
  distortion?: number;
  distortionShift?: number;
  distortionFreq?: number;
  grainMixer?: number;
  grainOverlay?: number;
}

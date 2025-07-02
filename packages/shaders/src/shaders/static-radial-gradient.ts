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
 * A composition of N color spots (one per color) with 2 types of
 * grainMixers applied to the coordinate space
 *
 * Uniforms:
 * - u_colorBack (RGBA)
 * - u_colors (vec4[]), u_colorsCount (float used as integer)
 * - u_grainMixer: warp grainMixer
 * - u_swirl: vortex grainMixer
 *
 */

// language=GLSL
export const staticRadialGradientFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec4 u_colors[${staticRadialGradientMeta.maxColorCount}];
uniform float u_colorsCount;

uniform float u_focalDistance;
uniform float u_focalAngle;
uniform bool u_focalMask;
uniform float u_falloff;
uniform float u_mixing;
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

  vec3 color = vec3(0.);
  float opacity = 0.;

  vec2 center = vec2(0.);
  float angleRad = radians(u_focalAngle - 90.);
  vec2 focalPoint = vec2(cos(angleRad), sin(angleRad)) * u_focalDistance;
  float radius = 1.;

  
  vec2 c_to_f = focalPoint - center;

  vec2 c_to_uv = uv - center;
  vec2 f_to_uv = uv - focalPoint;
  vec2 f_to_c = center - focalPoint;
  
  vec2 centerToUV = uv - center;
  float fragAngle = atan(centerToUV.y, centerToUV.x);
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


  float outerMask = .001 + .1 * u_focalDistance;
  if (u_focalMask == false) {
    outerMask = .005;
  }
  float outer = smoothstep(radius + outerMask, radius - outerMask, length(c_to_uv));
  outer = mix(outer, 1., isInSector);
  
  shape = mix(0., shape, outer);
  shape *= smoothstep(radius, radius - .01, length(c_to_uv));


  vec2 grainUV = rotate(v_objectUV, 2.) * 180.;
  float grain = grainShape(grainUV, vec2(100.));

  float mixerGrain = 1. * u_grainMixer * (grain - .3);
  float mixer = shape * u_colorsCount + mixerGrain;
  vec3 gradient = u_colors[0].rgb;
  for (int i = 1; i < ${staticRadialGradientMeta.maxColorCount}; i++) { 
    if (i >= int(u_colorsCount)) break;
    float mLinear = clamp(mixer - float(i - 1), 0.0, 1.0);
    float mSmooth = smoothstep(0., 1., mLinear);
    float m = mix(mLinear, mSmooth, u_mixing);
    gradient = mix(gradient, u_colors[i].rgb, m);
  }

  color = gradient.rgb;

  float rr = grainShape(grainUV, vec2(0.));
  float gg = grainShape(grainUV, vec2(-1.));
  float bb = grainShape(grainUV, vec2(2.));
  vec3 grainColor = 2. * vec3(rr, gg, bb);
  color = mix(color, grainColor, u_grainOverlay * grain);

  opacity = 1.;

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface StaticRadialGradientUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_focalDistance: number;
  u_focalAngle: number;
  u_focalMask: boolean;
  u_falloff: number;
  u_mixing: number;
  u_grainMixer: number;
  u_grainOverlay: number;
}

export interface StaticRadialGradientParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  focalDistance?: number;
  focalAngle?: number;
  focalMask?: boolean;
  falloff?: number;
  mixing?: number;
  grainMixer?: number;
  grainOverlay?: number;
}

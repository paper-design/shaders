import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, declareRotate, colorBandingFix } from '../shader-utils.js';

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

out vec4 fragColor;

${declarePI}
${declareRotate}

vec2 randomGradient(vec2 p) {
  float angle = fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  angle *= 6.2831853;
  return vec2(cos(angle), sin(angle));
}

float perlinNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float n00 = dot(randomGradient(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
  float n10 = dot(randomGradient(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float n01 = dot(randomGradient(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float n11 = dot(randomGradient(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));

  float nx0 = mix(n00, n10, u.x);
  float nx1 = mix(n01, n11, u.x);
  return mix(nx0, nx1, u.y);
}

float fractalNoise(vec2 uv, float baseFreq, int octaves, vec2 seedOffset) {
  float total = 0.0;
  float amplitude = 0.5;
  float frequency = baseFreq;

  for (int i = 0; i < octaves; i++) {
    total += amplitude * perlinNoise(uv * frequency + seedOffset);
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return 0.5 + 0.5 * total;// normalize to [0,1]
}


void main() {
  vec2 shape_uv = 2. * v_objectUV;

  vec3 color = vec3(0.);
  float opacity = 0.;

  vec2 center = vec2(0.);
  float angleRad = radians(u_focalAngle - 90.);
  vec2 focalPoint = vec2(cos(angleRad), sin(angleRad)) * u_focalDistance;
  float radius = 1.;

  
  vec2 c_to_f = focalPoint - center;

  vec2 c_to_uv = shape_uv - center;
  vec2 f_to_uv = shape_uv - focalPoint;
  vec2 f_to_c = center - focalPoint;

  
  vec2 centerToUV = shape_uv - center;
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
  
  float falloffExp = mix(u_falloff, 1., shape);
  shape = pow(shape, falloffExp);

  shape = 1. - clamp(shape, 0., 1.);


  vec2 grainUV = .7 * v_patternUV;
  float grain = fractalNoise(grainUV, .6, 6, vec2(100.));
  grain = length(vec2(dFdx(grain), dFdy(grain)));
  
  float outerMask = .001 + .1 * u_focalDistance;
  if (u_focalMask == false) {
    outerMask = .005;
  }
  float outer = smoothstep(radius + outerMask, radius - outerMask, length(c_to_uv));
  outer = mix(outer, 1., isInSector);
  
  shape = mix(0., shape, outer);
  shape *= smoothstep(radius, radius - .01, length(c_to_uv));

  float mixerGrain = 6. * u_grainMixer * (grain - .05);
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

  float rr = fractalNoise(grainUV, .6, 3, vec2(0.));
  float gg = fractalNoise(grainUV, .6, 3, vec2(-1.));
  float bb = fractalNoise(grainUV, .6, 3, vec2(2.));
  rr = length(vec2(dFdx(rr), dFdy(rr)));
  gg = length(vec2(dFdx(gg), dFdy(gg)));
  bb = length(vec2(dFdx(bb), dFdy(bb)));

  vec3 grainColor = 10. * vec3(rr, gg, bb);
  float grainOverlay = 6. * u_grainOverlay * grain;
  color = mix(color, grainColor, grainOverlay);
  
  opacity = 1.;

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface StaticRadialGradientUniforms extends ShaderSizingUniforms {
  // u_colorBack: [number, number, number, number];
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

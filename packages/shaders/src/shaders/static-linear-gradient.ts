import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, declareRotate, colorBandingFix } from '../shader-utils.js';

export const staticLinearGradientMeta = {
  maxColorCount: 10,
} as const;

/**
 * A composition of N color spots (one per color) with 2 types of
 * distortions applied to the coordinate space
 *
 * Uniforms:
 * - u_colors (vec4[]), u_colorsCount (float used as integer)
 * - u_distortion: warp distortion
 * - u_swirl: vortex distortion
 *
 */

// language=GLSL
export const staticLinearGradientFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec4 u_colors[${staticLinearGradientMeta.maxColorCount}];
uniform float u_colorsCount;

uniform float u_distortion;
uniform float u_swirl;
uniform float u_mixing;
uniform bool u_repeatY;
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

float symmetricSmooth(float x, float gammaIn, float gammaOut) {
  x = clamp(x, 0.0, 1.0);

  float inSide = 0.5 * pow(2.0 * x, gammaIn);
  float outSide = 1.0 - 0.5 * pow(2.0 * (1.0 - x), gammaOut);

  float t = smoothstep(.45, .55, x);

  // Mix the two sides
  return mix(inSide, outSide, t);
}

void main() {
  vec2 shape_uv = v_objectUV + .5;

  vec3 color = vec3(0.);
  float opacity = 0.;
  
  float shape = shape_uv.y;
  
  if (u_repeatY == true) {
    shape = mod(shape, 1.0);
  }
  
  shape = symmetricSmooth(shape, u_distortion, u_swirl);

  vec2 grainUV = .7 * v_patternUV;
  float grain = fractalNoise(grainUV, .6, 6, vec2(100.));
  grain = length(vec2(dFdx(grain), dFdy(grain)));


  float mixerGrain = 6. * u_grainMixer * (grain - .05);
  float mixer = shape * (u_colorsCount - 1.) + mixerGrain;
  vec3 gradient = u_colors[0].rgb;
  for (int i = 1; i < ${staticLinearGradientMeta.maxColorCount}; i++) {
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

export interface StaticLinearGradientUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_distortion: number;
  u_swirl: number;
  u_mixing: number;
  u_repeatY: boolean;
  u_grainMixer: number;
  u_grainOverlay: number;
}

export interface StaticLinearGradientParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  distortion?: number;
  swirl?: number;
  mixing?: number;
  repeatY?: boolean;
  grainMixer?: number;
  grainOverlay?: number;
}

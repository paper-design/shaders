import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, declareRotate, colorBandingFix } from '../shader-utils.js';

export const staticMeshGradientMeta = {
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
export const staticMeshGradientFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec4 u_colors[${staticMeshGradientMeta.maxColorCount}];
uniform float u_colorsCount;

uniform float u_swirl;
uniform float u_waveX;
uniform float u_waveXShift;
uniform float u_waveY;
uniform float u_waveYShift;
uniform float u_grainMixer;
uniform float u_grainOverlay;
uniform float u_mixing;

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

// grid option?
vec2 getPosition(float i) {

  float x = sin(i * TWO_PI);
  float y = cos(i * TWO_PI);

  return .5 + .5 * vec2(x, y);
}

void main() {
  vec2 shape_uv = v_objectUV;
  shape_uv += .5;

  vec2 st = .7 * v_patternUV;
  float grain = fractalNoise(st, .6, 6, vec2(100.));
  grain = length(vec2(dFdx(grain), dFdy(grain)));

  float radius = smoothstep(0., 1., length(shape_uv - .5));
  float center = 1. - radius;
  for (float i = 1.; i <= 2.; i++) {
    shape_uv.x += u_waveX * center / i * cos(TWO_PI * u_waveXShift + i * 2. * smoothstep(.0, 1., shape_uv.y));
    shape_uv.y += u_waveY * center / i * cos(TWO_PI * u_waveYShift + i * 2. * smoothstep(.0, 1., shape_uv.x));
  }

  float mixerGrain = 3. * u_grainMixer * (grain - .05);

  vec2 uvRotated = shape_uv;
  uvRotated -= vec2(.5);
  float angle = 3. * u_swirl * radius;
  uvRotated = rotate(uvRotated, -angle);
  uvRotated += vec2(.5);

  vec3 color = vec3(0.);
  float opacity = 0.;
  float totalWeight = 0.;


  for (int i = 0; i < ${staticMeshGradientMeta.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;

    vec2 pos = getPosition(float(i) / u_colorsCount) + mixerGrain;
    vec3 colorFraction = u_colors[i].rgb * u_colors[i].a;
    float opacityFraction = u_colors[i].a;

    float dist = length(uvRotated - pos);
    
    dist = pow(dist, 2. + 4. * u_mixing);
    float weight = 1. / (dist + 1e-3);
    color += colorFraction * weight;
    opacity += opacityFraction * weight;
    totalWeight += weight;
  }

  color /= totalWeight;
  opacity /= totalWeight;


  float rr = fractalNoise(st, .6, 3, vec2(0.));
  float gg = fractalNoise(st, .6, 3, vec2(-1.));
  float bb = fractalNoise(st, .6, 3, vec2(2.));
  rr = length(vec2(dFdx(rr), dFdy(rr)));
  gg = length(vec2(dFdx(gg), dFdy(gg)));
  bb = length(vec2(dFdx(bb), dFdy(bb)));

  vec3 grainColor = 10. * vec3(rr, gg, bb);
  float grainOverlay = 6. * u_grainOverlay * grain;
  color = mix(color, grainColor, grainOverlay);

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface StaticMeshGradientUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_swirl: number;
  u_waveX: number;
  u_waveXShift: number;
  u_waveY: number;
  u_waveYShift: number;
  u_grainMixer: number;
  u_grainOverlay: number;
  u_mixing: number;
}

export interface StaticMeshGradientParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  swirl?: number;
  waveX?: number;
  waveXShift?: number;
  waveY?: number;
  waveYShift?: number;
  grainMixer?: number;
  grainOverlay?: number;
  mixing?: number;
}

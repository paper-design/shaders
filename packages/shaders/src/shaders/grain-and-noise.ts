import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declareRotate, declarePI, declareValueNoise, declareSimplexNoise } from '../shader-utils.js';

// language=GLSL
export const grainAndNoiseFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorGrain;
uniform vec4 u_colorFiber;
uniform vec4 u_colorDrops;

uniform float u_grain;
uniform float u_fiber;
uniform float u_drops;
uniform float u_dropsSeed;

uniform sampler2D u_noiseTexture;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareRotate}
${declareSimplexNoise}

float random(vec2 p) {
  vec2 uv = floor(p) / 100.;
  return texture(u_noiseTexture, fract(uv)).b;
}

vec2 random2(vec2 p) {
  vec2 uv = floor(p) / 50. + .5;
  return texture(u_noiseTexture, fract(uv)).gb;
}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}
float fbm(in vec2 n) {
  float total = 0.0, amplitude = 1.;
  for (int i = 0; i < 3; i++) {
    n = rotate(n, .4);
    total += valueNoise(n) * amplitude;
    n *= 2.;
    amplitude *= 0.5;
  }
  return total;
}

float fiber(vec2 uv) {
  float epsilon = 0.01;
  float n1 = fbm(uv + vec2(epsilon, 0.0));
  float n2 = fbm(uv - vec2(epsilon, 0.0));
  float n3 = fbm(uv + vec2(0.0, epsilon));
  float n4 = fbm(uv - vec2(0.0, epsilon));
  return length(vec2(n1 - n2, n3 - n4)) / (2.0 * epsilon);
}

void main() {

  float t = u_time;
  vec2 patternUV = v_patternUV;

  vec2 fiberUV = -10. + 10. * v_patternUV;
  float fiber = fiber(fiberUV);

  vec2 grainUV = 40. * v_patternUV;
  float grain = 4. * random(grainUV + 20.) * random(1.2 * grainUV - 20.) * random(1.5 * grainUV);

  vec2 dropsUV = 1. * patternUV;
  vec2 dropsUVi = floor(dropsUV);
  vec2 dropsUVf = fract(dropsUV);
  float dropsMinDist = 1.;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 neighbor = vec2(float(i), float(j));
      vec2 offset = random2(dropsUVi + neighbor);
      offset = .5 + .5 * sin(10. * u_dropsSeed + TWO_PI * offset);
      vec2 pos = neighbor + offset - dropsUVf;
      float dist = length(pos);
      dropsMinDist = min(dropsMinDist, dropsMinDist * dist);
    }
  }
  float dropSize = .25 * u_drops;
  float drops = 1. - smoothstep(dropSize, dropSize + .02, pow(dropsMinDist, .5));

  fiber *= u_fiber;
  grain *= u_grain;

  vec3 grainColor = u_colorGrain.rgb * u_colorGrain.a;
  vec3 fiberColor = u_colorFiber.rgb * u_colorFiber.a;
  vec3 dropsColor = u_colorDrops.rgb * u_colorDrops.a;

  vec4 colFiber = u_colorFiber * fiber;
  vec4 colDrops = u_colorDrops * drops;

  vec3 color = vec3(0.);
  float opacity = 0.;

  color += grainColor * grain;
  color += fiberColor * fiber;
  color += dropsColor * drops;

  opacity += u_colorGrain.a * grain;
  opacity += u_colorFiber.a * fiber;
  opacity += u_colorDrops.a * drops;
  
  opacity = min(opacity, 1.0);

  fragColor = vec4(color, opacity);
}

`;

export interface GrainAndNoiseUniforms extends ShaderSizingUniforms {
  u_noiseTexture?: HTMLImageElement;
  u_colorGrain: [number, number, number, number];
  u_colorFiber: [number, number, number, number];
  u_colorDrops: [number, number, number, number];
  u_grain: number;
  u_fiber: number;
  u_drops: number;
  u_dropsSeed: number;
}

export interface GrainAndNoiseParams extends ShaderSizingParams, ShaderMotionParams {
  colorGrain?: string;
  colorFiber?: string;
  colorDrops?: string;
  grain?: number;
  fiber?: number;
  drops?: number;
  dropsSeed?: number;
}

import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declareRotate, declarePI, declareValueNoise, declareSimplexNoise } from '../shader-utils.js';

// language=GLSL
export const grainAndNoiseFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorGrain;
uniform vec4 u_colorFiber;
uniform vec4 u_colorFiberScd;

uniform float u_grain;
uniform float u_fiber;
uniform float u_drops;
uniform float u_seed;

uniform sampler2D u_noiseTexture;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareRotate}
${declareSimplexNoise}

vec3 random(vec2 p) {
  vec2 uv = floor(p) / 100.;
  return texture(u_noiseTexture, fract(uv + .003 * u_time)).rgb;
}

vec3 valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  vec3 a = random(i);
  vec3 b = random(i + vec2(1.0, 0.0));
  vec3 c = random(i + vec2(0.0, 1.0));
  vec3 d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  vec3 x1 = mix(a, b, u.x);
  vec3 x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}
vec3 fbm(vec2 n) {
  vec3 total = vec3(0.);
  float amplitude = 1.;
  for (int i = 0; i < 5; i++) {
    n = rotate(n, .4);
    total += valueNoise(n) * amplitude;
    n *= 2.;
    amplitude *= 0.5;
  }
  return total;
}

vec3 fiberShape(vec2 uv) {
  float epsilon = 0.01;
  vec3 n1 = fbm(uv + vec2(epsilon, 0.0));
  vec3 n2 = fbm(uv - vec2(epsilon, 0.0));
  vec3 n3 = fbm(uv + vec2(0.0, epsilon));
  vec3 n4 = fbm(uv - vec2(0.0, epsilon));
  vec3 n12 = n1 - n2;
  vec3 n34 = n3 - n4;
  float epsilon2 = 2.0 * epsilon;
  return vec3(
    length(vec2(n12.x, n34.x)) / epsilon2,
    length(vec2(n12.y, n34.y)) / epsilon2,
    length(vec2(n12.z, n34.z)) / epsilon2
  );
}


float getNoise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}


void main() {

  float t = u_time;
  vec2 patternUV = v_patternUV;

  vec2 fiberUV = -10. + 10. * v_patternUV;
  vec3 fiber = .5 * fiberShape(fiberUV);
  fiber *= u_fiber;
  
  vec3 grainColor = u_colorGrain.rgb * u_colorGrain.a;
  vec3 fiberColor = u_colorFiber.rgb * u_colorFiber.a;
  vec3 fiberColorScd = u_colorFiberScd.rgb * u_colorFiberScd.a;
  
  vec3 color = vec3(0.);
  float opacity = 0.;


  vec2 uv = 40. * v_patternUV;
  float grain1 = -1. + 1.5 * u_grain + snoise(uv + vec2(0., -.3 * u_time));
  float grain2 = -1. + 1.5 * u_grain + snoise(2. * uv + vec2(0., .32 * u_time));
  float grain3 = -1. + 1.5 * u_grain + snoise(1.5 * uv + vec2(-.4 * u_time, .1 * u_time));
  grain1 = clamp(grain1, 0., 1.);
  grain2 = clamp(grain2, 0., 1.);
  grain3 = clamp(grain3, 0., 1.);

  color += fiberColor * fiber.x;
  color += fiberColorScd * fiber.y;
  color += grainColor * fiber.z;
  
  color += fiberColor * grain1;
  color += fiberColorScd * grain2;
  color += grainColor * grain3;

  opacity += u_colorFiber.a * fiber.x;
  opacity += u_colorFiberScd.a * fiber.y;
  opacity += u_colorGrain.a * fiber.z;
  
  opacity += u_colorFiber.a * grain1;
  opacity += u_colorFiberScd.a * grain2;
  opacity += u_colorGrain.a * grain3;
  
  opacity = min(opacity, 1.0);

  fragColor = vec4(color, opacity);
}

`;

export interface GrainAndNoiseUniforms extends ShaderSizingUniforms {
  u_noiseTexture?: HTMLImageElement;
  u_colorGrain: [number, number, number, number];
  u_colorFiber: [number, number, number, number];
  u_colorFiberScd: [number, number, number, number];
  u_grain: number;
  u_fiber: number;
  u_seed: number;
}

export interface GrainAndNoiseParams extends ShaderSizingParams, ShaderMotionParams {
  colorGrain?: string;
  colorFiber?: string;
  colorFiberScd?: string;
  grain?: number;
  fiber?: number;
  seed?: number;
}

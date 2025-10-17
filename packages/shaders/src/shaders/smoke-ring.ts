import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, textureRandomizerR, colorBandingFix } from '../shader-utils.js';

export const smokeRingMeta = {
  maxColorCount: 10,
  maxNoiseIterations: 8,
} as const;

/**
 * Radial gradient with layered FBM displacement, masked with ring shape
 *
 * Uniforms:
 * - u_colorBack (RGBA)
 * - u_colors (vec4[]), u_colorsCount (float used as integer)
 * - u_thickness, u_radius, u_innerShape: ring mask settings
 * - u_noiseIterations, u_noiseScale: how detailed is the noise (number of fbm layers & noise frequency)
 *
 * - u_noiseTexture (sampler2D): pre-computed randomizer source
 */

// language=GLSL
export const smokeRingFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${smokeRingMeta.maxColorCount}];
uniform float u_colorsCount;

uniform float u_thickness;
uniform float u_radius;
uniform float u_innerShape;
uniform float u_noiseScale;
uniform float u_noiseIterations;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${textureRandomizerR}
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}
float fbm(in vec2 n) {
  float total = 0.0, amplitude = .4;
  for (int i = 0; i < ${smokeRingMeta.maxNoiseIterations}; i++) {
    if (i >= int(u_noiseIterations)) break;
    total += valueNoise(n) * amplitude;
    n *= 1.99;
    amplitude *= 0.65;
  }
  return total;
}

float getNoise(vec2 uv, vec2 pUv, float t) {
  float noiseLeft = fbm(pUv + .03 * t);
  float period = max(abs(u_noiseScale * TWO_PI), 1e-6);
  pUv.x = fract(pUv.x / period) * period;
  float noiseRight = fbm(pUv + .03 * t);
  return mix(noiseRight, noiseLeft, smoothstep(-.25, .25, uv.x));
}

float getRingShape(vec2 uv) {
  float radius = u_radius;
  float thickness = u_thickness;

  float distance = length(uv);
  float ringValue = 1. - smoothstep(radius, radius + thickness, distance);
  ringValue *= smoothstep(radius - pow(u_innerShape, 3.) * thickness, radius, distance);

  return ringValue;
}

void main() {
  vec2 shape_uv = v_objectUV;

  float t = u_time;

  float cycleDuration = 3.;
  float period2 = 2.0 * cycleDuration;
  float localTime1 = fract((0.1 * t + cycleDuration) / period2) * period2;
  float localTime2 = fract((0.1 * t) / period2) * period2;
  float timeBlend = .5 + .5 * sin(.1 * t * PI / cycleDuration - .5 * PI);

  float atg = atan(shape_uv.y, shape_uv.x) + .001;
  float l = length(shape_uv);
  vec2 polar_uv1 = vec2(atg, localTime1 - (.5 * l) + 1. / pow(max(1e-4, l), .5));
  polar_uv1 *= u_noiseScale;
  float noise1 = getNoise(shape_uv, polar_uv1, t);

  vec2 polar_uv2 = vec2(atg, localTime2 - (.5 * l) + 1. / pow(max(1e-4, l), .5));
  polar_uv2 *= u_noiseScale;
  float noise2 = getNoise(shape_uv, polar_uv2, t);

  float noise = mix(noise1, noise2, timeBlend);

  shape_uv *= (.8 + 1.2 * noise);

  float ringShape = getRingShape(shape_uv);

  float mixer = ringShape * ringShape * (u_colorsCount - 1.);
  vec4 gradient = u_colors[int(u_colorsCount) - 1];
  gradient.rgb *= gradient.a;
  for (int i = ${smokeRingMeta.maxColorCount} - 2; i >= 0; i--) {
    float localT = clamp(mixer - float(int(u_colorsCount) - 1 - i - 1), 0., 1.);
    vec4 c = u_colors[i];
    c.rgb *= c.a;
    gradient = mix(gradient, c, localT);
  }

  vec3 color = gradient.rgb * ringShape;
  float opacity = gradient.a * ringShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface SmokeRingUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_noiseScale: number;
  u_thickness: number;
  u_radius: number;
  u_innerShape: number;
  u_noiseIterations: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface SmokeRingParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  noiseScale?: number;
  thickness?: number;
  radius?: number;
  innerShape?: number;
  noiseIterations?: number;
}

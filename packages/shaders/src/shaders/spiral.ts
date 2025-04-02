import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingUniformsDeclaration,
  sizingPatternUV,
  declareSimplexNoise,
  declarePI,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';

/**
 * Spiral shape by Ksenia Kondrashova
 * Generates a dynamic spiral shape with configurable parameters
 *
 * Uniforms include:
 *
 * u_scale - controls the overall scale of the spiral (u_scale = 1 makes it fit the viewport height)
 * u_offsetX - left / right pan
 * u_offsetY - up / down pan
 * u_color1 - the first color used in the spiral (stroke)
 * u_color2 - the second color used in the spiral (back)
 * u_spiralDensity (0 .. 1) - the spacing of the spiral arms
 * u_spiralDistortion (0 .. 1) - adds a wavy distortion effect to the spiral arms
 * u_strokeWidth (0 .. 1) - defines the thickness of the spiral lines.
 * u_strokeCap (0 .. 1) - adjusts the fading of the spiral edges.
 * u_strokeTaper (0 .. 1) - controls the tapering effect along the spiral arms.
 * u_noiseFreq - frequency of the noise applied to the spiral.
 * u_noisePower (0 .. 1) - strength of the noise effect.
 * u_softness - softens the edges of the spiral for a smoother appearance.
 */
export const spiralFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

${sizingUniformsDeclaration}

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform float u_spiralDensity;
uniform float u_spiralDistortion;
uniform float u_strokeWidth;
uniform float u_strokeCap;
uniform float u_strokeTaper;

uniform float u_noiseFreq;
uniform float u_noisePower;
uniform float u_softness;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

out vec4 fragColor;

${declarePI}
${declareSimplexNoise}

void main() {
  ${sizingPatternUV}
  uv *= .02;

  float t = u_time;

  float l = length(uv);
  float angle = atan(uv.y, uv.x) - 2. * t;
  float angle_norm = angle / TWO_PI;

  angle_norm += .125 * u_noisePower * snoise(.5 * u_noiseFreq * uv);

  float offset = pow(l, 1. - clamp(u_spiralDensity, 0., 1.)) + angle_norm;

  float stripe_map = fract(offset);
  stripe_map -= .5 * u_strokeTaper * l;

  stripe_map += .25 * u_noisePower * snoise(u_noiseFreq * uv);

  float shape = 2. * abs(stripe_map - .5);

  shape *= (1. + u_spiralDistortion * sin(4. * l - t) * cos(PI + l + t));

  float stroke_width = clamp(u_strokeWidth, fwidth(l), 1. - fwidth(l));

  float edge_width = min(fwidth(l), fwidth(offset));

  float mid = 1. - smoothstep(.0, .9, l);
  mid = pow(mid, 2.);
  shape -= .5 * u_strokeCap * mid;

  shape = smoothstep(stroke_width - edge_width - u_softness, stroke_width + edge_width + u_softness, shape);

  vec3 color = mix(u_color1.rgb * u_color1.a, u_color2.rgb * u_color2.a, shape);
  float opacity = mix(u_color1.a, u_color2.a, shape);

  fragColor = vec4(color, opacity);
}
`;

export interface SpiralUniforms extends ShaderSizingUniforms {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_spiralDensity: number;
  u_spiralDistortion: number;
  u_strokeWidth: number;
  u_strokeTaper: number;
  u_strokeCap: number;
  u_noiseFreq: number;
  u_noisePower: number;
  u_softness: number;
}

export interface SpiralParams extends ShaderSizingParams, ShaderMotionParams {
  color1?: string;
  color2?: string;
  spiralDensity?: number;
  spiralDistortion?: number;
  strokeWidth?: number;
  strokeTaper?: number;
  strokeCap?: number;
  noiseFreq?: number;
  noisePower?: number;
  softness?: number;
}

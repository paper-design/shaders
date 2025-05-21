import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declareSimplexNoise, declarePI, colorBandingFix } from '../shader-utils';

/**
 * Spiral shape by Ksenia Kondrashova
 * Generates a dynamic spiral shape with configurable parameters
 *
 * Uniforms include:
 *
 * u_scale - controls the overall scale of the spiral (u_scale = 1 makes it fit the viewport height)
 * u_offsetX - left / right pan
 * u_offsetY - up / down pan
 * u_colorBack - the first color used in the spiral (stroke)
 * u_colorFront - the second color used in the spiral (back)
 * u_density (0 .. 1) - the spacing of the spiral arms
 * u_distortion (0 .. 1) - adds a wavy distortion effect to the spiral arms
 * u_strokeWidth (0 .. 1) - defines the thickness of the spiral lines.
 * u_strokeCap (0 .. 1) - adjusts the fading of the spiral edges.
 * u_strokeTaper (0 .. 1) - controls the tapering effect along the spiral arms.
 * u_noiseFrequency - frequency of the noise applied to the spiral.
 * u_noisePower (0 .. 1) - strength of the noise effect.
 * u_softness - softens the edges of the spiral for a smoother appearance.
 */
export const spiralFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorFront;
uniform float u_density;
uniform float u_distortion;
uniform float u_strokeWidth;
uniform float u_strokeCap;
uniform float u_strokeTaper;

uniform float u_noiseFrequency;
uniform float u_noisePower;
uniform float u_softness;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareSimplexNoise}

void main() {
  vec2 shape_uv = v_patternUV * .02;

  float t = u_time;

  float l = length(shape_uv);
  float angle = atan(shape_uv.y, shape_uv.x) - 2. * t;
  float angle_norm = angle / TWO_PI;

  angle_norm += .125 * u_noisePower * snoise(.5 * u_noiseFrequency * shape_uv);

  float offset = pow(l, 1. - clamp(u_density, 0., 1.)) + angle_norm;

  float stripe_map = fract(offset);
  stripe_map -= .5 * u_strokeTaper * l;

  stripe_map += .25 * u_noisePower * snoise(u_noiseFrequency * shape_uv);

  float shape = 2. * abs(stripe_map - .5);

  shape *= (1. + u_distortion * sin(4. * l - t) * cos(PI + l + t));

  float stroke_width = clamp(u_strokeWidth, fwidth(l), 1. - fwidth(l));

  float edge_width = min(fwidth(l), fwidth(offset));

  float mid = 1. - smoothstep(.0, .9, l);
  mid = pow(mid, 2.);
  shape -= .5 * u_strokeCap * mid;

  float res = smoothstep(stroke_width - edge_width - u_softness, stroke_width + edge_width + u_softness, shape);

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;
  
  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);
  
  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface SpiralUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colorFront: [number, number, number, number];
  u_density: number;
  u_distortion: number;
  u_strokeWidth: number;
  u_strokeTaper: number;
  u_strokeCap: number;
  u_noiseFrequency: number;
  u_noisePower: number;
  u_softness: number;
}

export interface SpiralParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colorFront?: string;
  density?: number;
  distortion?: number;
  strokeWidth?: number;
  strokeTaper?: number;
  strokeCap?: number;
  noiseFrequency?: number;
  noisePower?: number;
  softness?: number;
}

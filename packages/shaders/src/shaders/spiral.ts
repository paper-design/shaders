import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declareSimplexNoise, declarePI, colorBandingFix } from '../shader-utils.js';

/**
 * 2-color spiral shape
 *
 * Uniforms:
 * - u_colorBack, u_colorFront (RGBA)
 * - u_density: spacing falloff to simulate radial perspective (0 = no perspective)
 * - u_strokeWidth: thickness of stroke
 * - u_strokeTaper: stroke loosing width further from center (0 for full visibility)
 * - u_distortion: per-arch shift
 * - u_strokeCap: extra width at the center (no effect on u_strokeWidth = 0.5)
 * - u_noiseFrequency, u_noisePower: simplex noise distortion over the shape
 * - u_softness: color transition sharpness (0 = hard edge, 1 = smooth fade)
 *
 */

// language=GLSL
export const spiralFragmentShader: string = `#version 300 es
precision highp float;

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
  float test = step(.5, stripe_map);

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

  vec3 color = bgColor * res;
  float opacity = bgOpacity * res;

  color += fgColor * (1. - opacity);
  opacity += fgOpacity * (1. - opacity);

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

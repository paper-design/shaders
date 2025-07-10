import type { ShaderMotionParams } from '../shader-mount.js';
import {
  sizingUniformsDeclaration,
  sizingVariablesDeclaration,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing.js';
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
 * - u_noiseFrequency, u_noise: simplex noise distortion over the shape
 * - u_softness: color transition sharpness (0 = hard edge, 1 = smooth fade)
 *
 */

// language=GLSL
export const spiralFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform vec4 u_colorBack;
uniform vec4 u_colorFront;
uniform float u_density;
uniform float u_distortion;
uniform float u_strokeWidth;
uniform float u_strokeCap;
uniform float u_strokeTaper;
uniform float u_noise;
uniform float u_noiseFrequency;
uniform float u_softness;

${sizingUniformsDeclaration}
${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareSimplexNoise}

void main() {
  vec2 uv = v_patternUV;
  
  float t = u_time;
  float l = length(uv);
  float density = 1. - clamp(u_density, 0., 1.);
  l = pow(l, density);
  float angle = atan(uv.y, uv.x) - 2. * t;
  float angleNormalised = angle / TWO_PI;

  angleNormalised += .125 * u_noise * snoise(16. * pow(u_noiseFrequency, 3.) * uv);

  float offset = l + angleNormalised;
  offset -= u_distortion * (sin(4. * l - t) * cos(PI + l + t));
  float stripe = fract(offset);
  
  float shape = 2. * abs(stripe - .5);
  float width = clamp(u_strokeWidth, .005 * u_strokeTaper, 1.);


  float wCap = mix(width, (1. - fract(offset)) * (1. - step(.5, stripe)), (1. - clamp(l, 0., 1.)));
  width = mix(width, wCap, u_strokeCap);
  width *= (1. - clamp(u_strokeTaper, 0., 1.) * l);

  float pixelSize = 4. * fwidth(offset);
  pixelSize = mix(pixelSize, .002, u_strokeCap * (1. - clamp(l, 0., 1.)));

  float res = smoothstep(width - pixelSize - u_softness, width + pixelSize + u_softness, shape);

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
//  fragColor = vec4(wCap, wCap, wCap, opacity);
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
  u_noise: number;
  u_noiseFrequency: number;
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
  noise?: number;
  noiseFrequency?: number;
  softness?: number;
}

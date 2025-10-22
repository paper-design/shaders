import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI } from '../shader-utils.js';

/**
 * Waveform pattern
 *
 * Uniforms:
 * - u_colorBack, u_colorFront (RGBA)
 * - u_shape (float, fractional numbers allowed):
 *   ---- 0: zigzag
 *   ---- 1: sine wave
 *   ---- 2: irregular wave
 *   ---- 3: irregular wave
 * - u_amplitude, u_frequency, u_spacing: wave settings
 * - u_proportion: (0..1) blend point between 2 colors (0.5 = equal distribution)
 * - u_softness: color transition sharpness (0 = hard edge, 1 = smooth fade)
 *
 * */

// language=GLSL
export const wavesFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_shape;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_spacing;
uniform float u_proportion;
uniform float u_softness;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}

void main() {
  vec2 shape_uv = v_patternUV;
  shape_uv *= 4.;

  float wave = .5 * cos(shape_uv.x * u_frequency * TWO_PI);
  float zigzag = 2. * abs(fract(shape_uv.x * u_frequency) - .5);
  float irregular = sin(shape_uv.x * .25 * u_frequency * TWO_PI) * cos(shape_uv.x * u_frequency * TWO_PI);
  float irregular2 = .75 * (sin(shape_uv.x * u_frequency * TWO_PI) + .5 * cos(shape_uv.x * .5 * u_frequency * TWO_PI));

  float offset = mix(zigzag, wave, smoothstep(0., 1., u_shape));
  offset = mix(offset, irregular, smoothstep(1., 2., u_shape));
  offset = mix(offset, irregular2, smoothstep(2., 3., u_shape));
  offset *= 2. * u_amplitude;

  float spacing = (.001 + u_spacing);
  float shape = .5 + .5 * sin((shape_uv.y + offset) * PI / spacing);

  float aa = .0001 + fwidth(shape);
  float dc = 1. - clamp(u_proportion, 0., 1.);
  float e0 = dc - u_softness - aa;
  float e1 = dc + u_softness + aa;
  float res = smoothstep(min(e0, e1), max(e0, e1), shape);
  
  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  fragColor = vec4(color, opacity);
}
`;

export interface WavesUniforms extends ShaderSizingUniforms {
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_shape: number;
  u_frequency: number;
  u_amplitude: number;
  u_spacing: number;
  u_proportion: number;
  u_softness: number;
}

export interface WavesParams extends ShaderSizingParams {
  colorFront?: string;
  colorBack?: string;
  rotation?: number;
  shape?: number;
  frequency?: number;
  amplitude?: number;
  spacing?: number;
  proportion?: number;
  softness?: number;
}

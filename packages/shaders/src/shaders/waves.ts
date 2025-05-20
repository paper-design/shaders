import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declarePI, declareRotate } from '../shader-utils';

/**
 * Waves static pattern on the transparent background
 *
 * Uniforms include:
 * u_colorFront - the first color
 * u_colorBack - the second color
 * u_shape (0 ... 3) - the line shaping coefficient, non-integer
   values allowed and produce mixed shapes
   - u_shape = 0 is zigzag
   - u_shape = 1 is perfect sine wave
   - u_shape = 2 is irregular wave #1
   - u_shape = 3 is irregular wave #2
 * u_frequency - the wave frequency
 * u_amplitude - the wave amplitude
 * u_spacing - the density of pattern lines
 * u_proportion (0 ... 1) - the proportion of stroke width to the pattern step
 * u_softness (0 ... 1) - the blur applied to the lines edges
 */
export const wavesFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_scale;

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
${declareRotate}

void main() {
  vec2 shape_uv = v_patternUV;
  shape_uv *= .05;

  float wave = .5 * cos(shape_uv.x * u_frequency * TWO_PI);
  float zigzag = 2. * abs(fract(shape_uv.x * u_frequency) - .5);
  float irregular = sin(shape_uv.x * .25 * u_frequency * TWO_PI) * cos(shape_uv.x * u_frequency * TWO_PI);
  float irregular2 = .75 * (sin(shape_uv.x * u_frequency * TWO_PI) + .5 * cos(shape_uv.x * .5 * u_frequency * TWO_PI));

  float offset = mix(zigzag, wave, smoothstep(0., 1., u_shape));
  offset = mix(offset, irregular, smoothstep(1., 2., u_shape));
  offset = mix(offset, irregular2, smoothstep(2., 3., u_shape));
  offset *= 2. * u_amplitude;

  float spacing = .02 + .98 * u_spacing;
  float shape = .5 + .5 * sin((shape_uv.y + offset) * PI / spacing);

  float edge_width = .02 / (1. + abs(shape)) * (.001 + u_scale);
  edge_width += .5 * max(0., u_softness);
  float dc = clamp(u_proportion, 0., 1.);
  float t = smoothstep(dc - edge_width, dc + edge_width, shape);

  vec3 color = mix(u_colorFront.rgb * u_colorFront.a, u_colorBack.rgb * u_colorBack.a, t);
  float opacity = mix(u_colorFront.a, u_colorBack.a, t);

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

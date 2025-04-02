import {
  sizingUniformsDeclaration,
  declarePI,
  declareRotate,
  sizingPatternUV,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';

/**
 * Waves static pattern on the transparent background
 *
 * Uniforms include:
 * u_rotation - the rotation applied to user space
 * u_color1 - the first color
 * u_color2 - the second color
 * u_shape (0 ... 3) - the line shaping coefficient, non-integer
   values allowed and produce mixed shapes
   - u_shape = 0 is zigzag
   - u_shape = 1 is perfect sine wave
   - u_shape = 2 is irregular wave #1
   - u_shape = 3 is irregular wave #2
 * u_frequency - the wave frequency
 * u_amplitude - the wave amplitude
 * u_spacing - the density of pattern lines
 * u_dutyCycle (0 ... 1) - the proportion of stroke width to the pattern step
 * u_softness (0 ... 1) - the blur applied to the lines edges
 */
export const wavesFragmentShader: string = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;

${sizingUniformsDeclaration}

uniform float u_rotation;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform float u_shape;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_spacing;
uniform float u_dutyCycle;
uniform float u_softness;

out vec4 fragColor;

${declarePI}
${declareRotate}

void main() {

  ${sizingPatternUV}
  uv = rotate(uv, u_rotation * .5 * PI);
  uv *= .05;

  float wave = .5 * cos(uv.x * u_frequency * TWO_PI);
  float zigzag = 2. * abs(fract(uv.x * u_frequency) - .5);
  float irregular = sin(uv.x * .25 * u_frequency * TWO_PI) * cos(uv.x * u_frequency * TWO_PI);
  float irregular2 = .75 * (sin(uv.x * u_frequency * TWO_PI) + .5 * cos(uv.x * .5 * u_frequency * TWO_PI));

  float offset = mix(zigzag, wave, smoothstep(0., 1., u_shape));
  offset = mix(offset, irregular, smoothstep(1., 2., u_shape));
  offset = mix(offset, irregular2, smoothstep(2., 3., u_shape));
  offset *= 2. * u_amplitude;

  float spacing = .02 + .98 * u_spacing;
  float shape = .5 + .5 * sin((uv.y + offset) * PI / spacing);

  float edge_width = .02 / (1. + abs(shape)) * (.001 + u_scale);
  edge_width += .5 * max(0., u_softness);
  float dc = clamp(u_dutyCycle, 0., 1.);
  float t = smoothstep(dc - edge_width, dc + edge_width, shape);

  vec3 color = mix(u_color1.rgb * u_color1.a, u_color2.rgb * u_color2.a, t);
  float opacity = mix(u_color1.a, u_color2.a, t);

  fragColor = vec4(color, opacity);
}
`;

export interface WavesUniforms extends ShaderSizingUniforms {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_rotation: number;
  u_shape: number;
  u_frequency: number;
  u_amplitude: number;
  u_spacing: number;
  u_dutyCycle: number;
  u_softness: number;
}

export interface WavesParams extends ShaderSizingParams {
  color1?: string;
  color2?: string;
  rotation?: number;
  shape?: number;
  frequency?: number;
  amplitude?: number;
  spacing?: number;
  dutyCycle?: number;
  softness?: number;
}

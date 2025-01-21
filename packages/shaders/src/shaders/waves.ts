export type WavesUniforms = {
  u_scale: number;
  u_rotation: number;
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_shape: number;
  u_frequency: number;
  u_amplitude: number;
  u_spacing: number;
  u_dutyCycle: number;
  u_edgeBlur: number;
};

/**
 * Stepped Simplex Noise by Ksenia Kondrashova
 * Calculates a combination of 2 simplex noises with result rendered as a stepped gradient
 *
 * Uniforms include:
 * u_scale: The scale applied to user space
 * u_rotation: The rotation applied to user space
 * u_color1: The first color
 * u_color2: The second color
 * u_shape: The line shaping coefficient
   - u_shape = 0 is zigzag
   - u_shape = 1 is perfect sine wave
   - u_shape = 2 is irregular wave #1
   - u_shape = 3 is irregular wave #2
 * u_frequency: The wave frequency
 * u_amplitude: The wave amplitude
 * u_spacing: The density of pattern lines
 * u_dutyCycle: The proportion of stroke width to the pattern step
 * u_edgeBlur: The blur applied to the lines edges
 */

export const wavesFragmentShader = `#version 300 es
precision highp float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;
uniform float u_rotation;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform float u_shape;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_spacing;
uniform float u_dutyCycle;
uniform float u_edgeBlur;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

out vec4 fragColor;

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  uv -= .5;
  uv *= (.02 * max(0., u_scale) * u_resolution);
  uv = rotate(uv, u_rotation * .5 * PI);
  uv /= u_pixelRatio;
  uv += .5;

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
  edge_width += .5 * max(0., u_edgeBlur);
  float dc = clamp(u_dutyCycle, 0., 1.);
  float t = smoothstep(dc - edge_width, dc + edge_width, shape);

  vec3 color = mix(u_color1.rgb * u_color1.a, u_color2.rgb * u_color2.a, t);
  float opacity = mix(u_color1.a, u_color2.a, t);
  
  fragColor = vec4(color, opacity);
}
`;

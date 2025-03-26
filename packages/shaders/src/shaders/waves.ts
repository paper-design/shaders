export type WavesUniforms = {
  u_scale: number;
  u_rotation: number;
  u_color: [number, number, number, number];
  u_shape: number;
  u_frequency: number;
  u_amplitude: number;
  u_spacing: number;
  u_dutyCycle: number;
  u_softness: number;
};

/**
 * Waves static pattern on the transparent background
 *
 * Uniforms include:
 * u_scale - the scale applied to user space
 * u_rotation - the rotation applied to user space
 * u_color - the wave color
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

export const wavesFragmentShader = `#version 300 es
precision highp float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;
uniform float u_rotation;

uniform vec4 u_color;
uniform float u_shape;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_spacing;
uniform float u_dutyCycle;
uniform float u_softness;

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
  edge_width += .5 * max(0., u_softness);
  float dc = clamp(1. - u_dutyCycle, 0., 1.);
  float s = smoothstep(dc - edge_width, dc + edge_width, shape);

  vec3 color = u_color.rgb * u_color.a * s;
  float opacity = u_color.a * s;
  
  fragColor = vec4(color, opacity);
}
`;

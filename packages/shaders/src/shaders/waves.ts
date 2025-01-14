export type WavesUniforms = {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_scale: number;
  u_frequency: number;
  u_amplitude: number;
  u_dutyCycle: number;
  u_spacing: number;
};

/**
 * Stepped Simplex Noise by Ksenia Kondrashova
 * Calculates a combination of 2 simplex noises with result rendered as a stepped gradient
 *
 * Uniforms include:
 * u_color1: The first color
 * u_color2: The second color
 */

export const wavesFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_color1;
uniform vec4 u_color2;

uniform float u_frequency;
uniform float u_amplitude;
uniform float u_dutyCycle;
uniform float u_spacing;

uniform float u_scale;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  uv -= .5;
  uv *= (.01 * u_scale * u_resolution);
  uv /= u_pixelRatio;
  uv += .5;

  float wave = sin(u_frequency * uv.x * TWO_PI);
  float zigzag = abs(fract(uv.x * u_frequency) * 2.0 - 1.0);
  
  // float offset = wave;
  float offset = zigzag;
  
  offset *= u_amplitude;
  
  
  float shape = .5 + .5 * cos((uv.y + offset) * u_spacing * PI);

  float t = smoothstep(u_dutyCycle + 1e-4, u_dutyCycle - 1e-4, shape);

  vec3 color = mix(u_color1.rgb, u_color2.rgb, t);

  float opacity = 1.;

  fragColor = vec4(color, opacity);
}
`;

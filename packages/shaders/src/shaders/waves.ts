export type WavesUniforms = {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_scale: number;
  u_frequency: number;
  u_amplitude: number;
  u_dutyCycle: number;
  u_spacing: number;
  u_shape: number;
  u_rotation: number;
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
uniform float u_shape;
uniform float u_rotation;

uniform float u_scale;

uniform float u_pixelRatio;
uniform vec2 u_resolution;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

out vec4 fragColor;

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  uv -= .5;
  uv *= (.02 * u_scale * u_resolution);
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
  
  float shape = .5 + .5 * sin((uv.y + offset) * PI / (1e-2 + u_spacing));
  
  float shapeFwidth = fwidth(shape);
  float t = smoothstep(u_dutyCycle - shapeFwidth, u_dutyCycle + shapeFwidth, shape);

  vec3 color = mix(u_color1.rgb * u_color1.a, u_color2.rgb * u_color2.a, t);
  float opacity = mix(u_color1.a, u_color2.a, t);
  
  fragColor = vec4(color, opacity);
}
`;

import type { ShaderMotionParams, ShaderSizingParams, ShaderSizingUniforms } from '../shader-mount';

/**
 * Neuro Noise Pattern
 * The original artwork: https://codepen.io/ksenia-k/full/vYwgrWv by Ksenia Kondrashova
 * Renders a fractal-like structure made of several layers of since-arches
 *
 * Uniforms include:
 * u_scale - the scale applied to user space
 * u_colorFront - the front color of pattern
 * u_colorBack - the back color of pattern
 * u_brightness - the power (brightness) of pattern lines
 */
export const neuroNoiseFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;
uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_brightness;

out vec4 fragColor;

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float neuro_shape(vec2 uv, float t) {
  vec2 sine_acc = vec2(0.);
  vec2 res = vec2(0.);
  float scale = 8.;

  for (int j = 0; j < 15; j++) {
    uv = rotate(uv, 1.);
    sine_acc = rotate(sine_acc, 1.);
    vec2 layer = uv * scale + float(j) + sine_acc - t;
    sine_acc += sin(layer);
    res += (.5 + .5 * cos(layer)) / scale;
    scale *= (1.2);
  }
  return res.x + res.y;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  uv -= .5;
  float scale = .5 * u_scale + 1e-4;
  uv *= (.001 * (1. - step(1. - scale, 1.) / scale));
  uv *= u_resolution;
  uv /= u_pixelRatio;
  uv += .5;

  float t = u_time;

  float noise = neuro_shape(uv, t);

  noise = u_brightness * pow(noise, 3.);
  noise += pow(noise, 12.);
  noise = max(.0, noise - .5);

  vec3 color = mix(u_colorBack.rgb * u_colorBack.a, u_colorFront.rgb * u_colorFront.a, noise);
  float opacity = mix(u_colorBack.a, u_colorFront.a, noise);

  fragColor = vec4(color, opacity);
}
`;

export interface NeuroNoiseUniforms extends ShaderSizingUniforms {
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_brightness: number;
}

export interface NeuroNoiseParams extends ShaderSizingParams, ShaderMotionParams {
  colorFront?: string;
  colorBack?: string;
  brightness?: number;
}

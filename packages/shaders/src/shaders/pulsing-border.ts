export type PulsingBorderUniforms = {
  u_scale: number;
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_brightness: number;
};

/**
 *
 * Uniforms include:
 */

export const pulsingBorderFragmentShader = `#version 300 es
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
  vec2 uv = gl_FragCoord.xy;
  uv /= u_pixelRatio;

  float t = u_time;

  float left = uv.x;
  float right = (u_resolution.x / u_pixelRatio) - uv.x;
  float bottom = uv.y;
  float top = (u_resolution.y / u_pixelRatio) - uv.y;

  float distToEdge = min(min(left, right), min(bottom, top));

  float borderThickness = 150.;
  float border = smoothstep(0.0, borderThickness, distToEdge);

  vec2 neuro_noise_uv = uv * 0.001;
  float noise = neuro_shape(neuro_noise_uv, t);

  noise = u_brightness * pow(noise, 3.);
  noise += pow(noise, 12.);
  noise = max(.0, noise - .5);

  border = 1. - border;
  border *= noise;
  fragColor = vec4(vec3(border), 1.);
}

`;

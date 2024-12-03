export type NeuroNoiseUniforms = {
    u_colorFront: [number, number, number];
    u_colorBack: [number, number, number];
    u_scale: number;
    u_brightness: number;
    u_speed: number;
};


/**
 * Neuro Noise Pattern;
 * The original artwork: https://codepen.io/ksenia-k/full/vYwgrWv by Ksenia Kondrashova
 * Renders a fractal-like structure made of several layers of since-arches
 *
 * Uniforms include:
 * u_colorFront: The front color of pattern
 * u_colorBack: The back color of pattern
 * u_brightness: The power/brightness of pattern lines
 * u_scale: The scale applied to coordinates
 * u_speed: The speed coefficient for pattern animation
 */

export const neuroNoiseFragmentShader = `
precision mediump float;

uniform vec3 u_colorFront;
uniform vec3 u_colorBack;
uniform float u_scale;
uniform float u_brightness;
uniform float u_speed;

uniform float u_time;
uniform float u_ratio;
uniform vec2 u_resolution;

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
  float ratio = u_resolution.x / u_resolution.y;
  vec2 uv_r = uv;
  uv_r -= .5;
  uv_r *= u_scale;
  uv_r += .5;
  uv_r.x *= ratio;

  float t = u_speed * u_time;
  vec3 color = vec3(0.);

  float noise = neuro_shape(uv_r, t);

  noise = u_brightness * pow(noise, 3.);
  noise += pow(noise, 10.);
  noise = max(.0, noise - .5);
  noise *= (1. - length(uv - .5));

  color = mix(u_colorBack, u_colorFront, noise);

  gl_FragColor = vec4(color, 1.);
}
`;

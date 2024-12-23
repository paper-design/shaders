export type SteppedSimplexNoiseUniforms = {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_color4: [number, number, number, number];
  u_color5: [number, number, number, number];
  u_scale: number;
  u_steps_number: number;
};

/**
 * Stepped Simplex Noise by Ksenia Kondrashova
 * Calculates a combination of 2 simplex noises with result rendered as a stepped gradient
 *
 * Uniforms include:
 * u_color1: The first color
 * u_color2: The second color
 * u_color3: The third color
 * u_color4: The fourth color
 * u_color5: The fifth color
 * u_scale: The scale applied to coordinates
 * u_steps_number: The number of colors to show as a stepped gradient
 */

export const steppedSimplexNoiseFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform vec4 u_color4;
uniform vec4 u_color5;
uniform float u_scale;
uniform float u_steps_number;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

out vec4 fragColor;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float get_noise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

vec4 getColor(int index) {
  if (index == 0) return u_color1;
  if (index == 1) return u_color2;
  if (index == 2) return u_color3;
  if (index == 3) return u_color4;
  if (index == 4) return u_color5;
  return u_color1;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  uv -= .5;
  uv *= (.001 * u_scale * u_resolution);
  uv /= u_pixelRatio;
  uv += .5;

  float t =  u_time;

  float noise = .5 + .5 * get_noise(uv, t);
  noise = floor(noise * u_steps_number) / u_steps_number;

  vec3 color = u_color1.rgb * u_color1.a;
  float opacity = u_color1.a;
  for (int i = 0; i < 5; i++) {
      vec4 next_c = getColor(i + 1);
      float proportion = smoothstep((float(i) + .5) / 5., (float(i) + 2.) / 5., noise);
      color = mix(color, next_c.rgb * next_c.a, proportion);
      opacity = mix(opacity, next_c.a, proportion);
  }
  fragColor = vec4(color, opacity);
}
`;

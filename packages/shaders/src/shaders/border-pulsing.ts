export type BorderPulsingUniforms = {
  u_colorBack: [number, number, number, number];
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_pxSize: number;
  u_intensity: number;
  u_innerShapeIntensity: number;
  u_spotsNumber: number;
  u_grain: number;
  u_pulsing: number;
};

/**
 *
 * The artwork by Ksenia Kondrashova
 * Creates a border outline with animated sectoral patterns.
 *
 * Uniforms include:
 *
 * u_colorBack - background RGBA color
 * u_color1 - primary shape RGBA color
 * u_color2 - secondary shape RGBA color
 * u_color3 - tertiary shape RGBA color
 * u_pxSize - border size (roughly in pixels)
 * u_intensity - border color intensity
 * u_innerShapeIntensity - inner noise shape addon
 * u_spotsNumber - frequency of sectoral shapes that compose the color spots
 * u_grain - intensity of noisy texture that's applied to the shapes
 * u_pulsing - pulsation animation strength (without it you get the shapes rotating)
 */

export const borderPulsingFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform vec4 u_colorBack;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;

uniform float u_pxSize;
uniform float u_intensity;
uniform float u_innerShapeIntensity;
uniform float u_spotsNumber;
uniform float u_grain;
uniform float u_pulsing;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

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

float get_border_map(vec2 uv_normalised) {
  vec2 outer = (u_pxSize / u_resolution) * u_pixelRatio;
  outer *= 1.28;

  vec2 bl = smoothstep(vec2(0.), outer, uv_normalised);
  vec2 tr = smoothstep(vec2(0.), outer, 1. - uv_normalised);

  bl = pow(bl, vec2(.04));
  tr = pow(tr, vec2(.04));
  float s = 1. - bl.x * bl.y * tr.x * tr.y;

  return clamp(s, 0., 1.);
}

float rand(vec2 n) {
  return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
float noise(vec2 n) {
  const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
  return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}
float fbm_4(vec2 n) {
  float total = 0.0, amplitude = .2;
  for (int i = 0; i < 4; i++) {
    total += noise(n) * amplitude;
    n += n;
    amplitude *= 0.6;
  }
  return total;
}

float speech_like_pulse(float time) {
  float baseFreq = 300.0 + sin(time * 0.1) * 100.0;
  float midFreq = 600.0 + cos(time * 0.3) * 50.0;
  float highFreq = 1200.0 + sin(time * 0.6) * 150.0;

  float lowWave = sin(time * baseFreq);
  float midWave = sin(time * midFreq) * 0.5;
  float highWave = sin(time * highFreq) * 0.2;

  float s = lowWave + midWave + highWave;
  s *= 0.5 + 0.5 * sin(time * 0.05);

  return s;
}

float sector_shape(float a, float mask, float width) {
  float atg1 = mod(a, 1.);
  float s = smoothstep(.5 - width, .5, atg1) * smoothstep(.5 + width, .5, atg1);
  s *= mask;
  s = max(0., s);
  return s;
}

void main() {
  vec2 uv = gl_FragCoord.xy;
  uv /= u_pixelRatio;

  float t = u_time + 2.;

  vec2 uv_normalised = gl_FragCoord.xy / u_resolution.xy;
  vec2 uv_centered = uv_normalised - .5;;
  float angle = atan(uv_centered.y, uv_centered.x) / TWO_PI;

  float grain = .6 * snoise(uv * .5) - fbm_4(.4 * uv) - .5 * fbm_4(.01 * uv);
  grain *= u_grain;

  float border = get_border_map(uv_normalised);

  float pulse = speech_like_pulse(.02 * t);
  pulse = (1. + u_pulsing * pulse);

  border *= pulse;
  border *= (1. + u_intensity);

  float shape1 = 0.;
  float shape2 = 0.;

  for (int i = 0; i < int(u_spotsNumber); i++) {
    float fi = float(i);
    float time = (.1 + .15 * abs(sin(fi * 4.) * cos(fi * 2.))) * t + rand(vec2(fi * 10.)) * 3.;
    time *= mix(1., -1., float(i % 2 == 0));
    float mask = .2 + sin(t + fi * 6. - fi);
    float width = (.15 - .003 * u_spotsNumber) * (1. + rand(vec2(fi + 20., fi + 55.)));
    shape1 += sector_shape(angle + time, mask, width);
  }

  for (int i = 0; i < int(u_spotsNumber); i++) {
    float fi = float(i);
    float time = (.1 + .15 * abs(sin(fi * 2.) * cos(fi * 5.))) * t + rand(vec2(fi * 2. - 20.)) * 3.;
    time *= mix(-1., 1., float(i % 2 == 0));
    float mask = .2 + cos(t + fi * 5. - 2. * fi);
    float width = (.15 - .003 * u_spotsNumber) * (1. + rand(vec2(fi + 4., fi - 55.)));
    shape2 += sector_shape(angle + time, mask, width);
  }

  shape2 *= 1. - shape1;
  shape2 = max(0., shape2);

  float shape3 = 1. - max(shape1, shape2);
  shape3 *= sector_shape(angle + .2 * t, 1., .6);

  shape1 *= border;
  shape2 *= border;
  shape3 *= border;

  float noise_scale = (.0005 + .0001 * u_spotsNumber);
  float inner_noise = snoise(noise_scale * uv + vec2(.05, .1) * t);
  float inner1 = smoothstep(0., 1., inner_noise);
  float inner2 = smoothstep(-1., 0., inner_noise);
  shape3 += .2 * u_innerShapeIntensity * inner1 * pulse;
  shape2 += .15 * u_innerShapeIntensity * inner2 * pulse;

  shape1 *= (1. + grain);
  shape2 *= (1. + grain);
  shape3 *= (1. + grain);

  float shape_total = shape1 + shape2 + shape3;

  float opacity = shape1 * u_color1.a;
  opacity += shape2 * u_color2.a;
  opacity += shape3 * u_color3.a;
  opacity += u_colorBack.a * (1. - shape1 * u_color1.a - shape2 * u_color2.a - shape3 * u_color3.a);

  vec3 color = u_colorBack.rgb * (1. - shape_total) * u_colorBack.a;
  color += u_color1.rgb * shape1 * u_color1.a;
  color += u_color2.rgb * shape2 * u_color2.a;
  color += u_color3.rgb * shape3 * u_color3.a;

  color += u_colorBack.rgb * shape1 * (1. - u_color1.a) * u_colorBack.a;
  color += u_colorBack.rgb * shape2 * (1. - u_color2.a) * u_colorBack.a;
  color += u_colorBack.rgb * shape3 * (1. - u_color3.a) * u_colorBack.a;

  fragColor = vec4(color, opacity);
}
`;

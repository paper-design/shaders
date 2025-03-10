export type BorderPatternUniforms = {
  u_colorBack: [number, number, number, number];
  u_color: [number, number, number, number];
  u_pxSize: number;
  u_scale: number;
  u_dotSizeRand: number;
  u_dotSize: number;
  u_noise: number;
  u_blur: number;
  u_overlayX: number;
  u_overlayY: number;
  u_overlayScale: number;
};

/**
 *
 * Gooey dot pattern masked with viewport border
 *
 * Uniforms include:
 *
 * u_colorBack - background RGBA color
 * u_color - pattern RGBA color
 * u_pxSize - border size (roughly in pixels)
 * u_scale - pattern scale factor
 * u_dotSizeRand - degree of randomness in pattern dots size
 */

export const borderPatternFragmentShader = `#version 300 es
precision highp float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform vec4 u_colorBack;
uniform vec4 u_color;
uniform float u_pxSize;
uniform float u_scale;
uniform float u_dotSizeRand;
uniform float u_dotSize;
uniform float u_noise;
uniform float u_blur;
uniform float u_overlayX;
uniform float u_overlayY;
uniform float u_overlayScale;

out vec4 fragColor;

#define PI 3.14159265358979323846
#define TWO_PI 6.28318530718

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
  outer *= 1.3;

  vec2 bl = smoothstep(vec2(0.), outer, uv_normalised);
  vec2 tr = smoothstep(vec2(0.), outer, 1. - uv_normalised);

  float s = 1. - bl.x * bl.y * tr.x * tr.y;

  return clamp(s, 0., 1.);
}

float rand(vec2 n) {
  return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float get_ball_shape(vec2 uv, float radius) {
  float s = .5 * length(uv);
  s = 1. - clamp(s, 0., 1.);
  s = pow(s, radius);
  return s;
}

float pattern_shape(vec2 uv, float ratio, vec2 offset, float scale, float rand_offset) {
  uv -= .5;
  uv += offset;
  uv /= scale;
  uv.x *= ratio;

  vec2 pattern_iv = uv;

  uv = floor(uv);
  float randomizer = 1.3 * (rand(uv + rand_offset) - .3);
  randomizer = mix(1., randomizer, u_dotSizeRand);
  uv += .5;

  uv.x /= ratio;
  uv *= scale;
  uv += .5;

  float pattern = 0.;
  pattern_iv = fract(pattern_iv);
  pattern_iv -= .5;
  pattern = randomizer * get_ball_shape(pattern_iv, 28. - 12. * randomizer - 8. * u_dotSize);

  return pattern;
}

void main() {
  vec2 uv = gl_FragCoord.xy;
  uv /= u_pixelRatio;

  float ratio = u_resolution.x / u_resolution.y;
  vec2 uv_normalised = gl_FragCoord.xy / u_resolution.xy;

  float border = get_border_map(uv_normalised);

  vec2 pattern_uv = uv_normalised - .5;
  pattern_uv *= 10. * u_scale;
  
  vec2 noise = vec2(snoise(uv * .01), snoise(uv * .005 + vec2(4.)));
  pattern_uv += u_noise * noise;

  float pattern = 0.;
  pattern += pattern_shape(pattern_uv, ratio, vec2(.0 / ratio, .0), 1., 0.);
  pattern += pattern_shape(pattern_uv, ratio, vec2(u_overlayX / ratio, u_overlayY), 1. + u_overlayScale, 1000.);

  pattern *= border;

  pattern = smoothstep(.3 - fwidth(pattern) - .15 * u_blur, .3 + fwidth(pattern) + .5 * u_blur, pattern);

  vec4 color_mix = mix(u_colorBack * u_colorBack.a, u_color * u_color.a, pattern);

  fragColor = color_mix;
}
`;

export type BorderGradientUniforms = {};

/**
 *
 * Border borderLine with optional gradient animation. Inspired by
 *
 * Uniforms include:
 */

export const borderGradientFragmentShader = `#version 300 es
precision highp float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_offsetX;
uniform float u_offsetY;
uniform float u_scaleX;
uniform float u_scaleY;

uniform vec4 u_colorBack;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_pxSize;
uniform float u_blur;
uniform float u_grainDistortion;
uniform float u_grainAddon;

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
  outer *= (1.28 + .6 * u_blur);

  vec2 bl = smoothstep(vec2(0.), outer, uv_normalised + .5 * vec2(u_scaleX, u_scaleY));
  vec2 tr = smoothstep(vec2(0.), outer, 1. - uv_normalised + .5 * vec2(u_scaleX, u_scaleY));
 
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

void main() {
  vec2 uv = gl_FragCoord.xy;
  uv /= u_pixelRatio;

  float ratio = u_resolution.x / u_resolution.y;
  
  vec2 uv_normalised = gl_FragCoord.xy / u_resolution.xy;
  uv_normalised += vec2(-u_offsetX, u_offsetY);

  float grain = snoise(uv * .2) * snoise(uv * .5) - fbm_4(.002 * uv + 10.) - fbm_4(.003 * uv);
    
  float mixer = get_border_map(uv_normalised); 
  mixer += u_grainDistortion * .3 * (grain + .5);
  mixer += u_grainAddon * 2. * clamp(grain, 0., .5);
   
  mixer -= pow(mixer, .3) * .23;

  float edge_w = fwidth(mixer);

  vec3 colorBack = u_colorBack.rgb * u_colorBack.a;
  vec3 color1 = u_color1.rgb * u_color1.a;
  vec3 color2 = u_color2.rgb * u_color2.a;
  vec3 color3 = u_color3.rgb * u_color3.a;
  
  vec3 borders = vec3(.0, .25, .58);
  
  vec2 borders1 = vec2(borders[0], borders[0] + .9 * u_blur + edge_w);
  vec2 borders2 = vec2(borders[1] - edge_w, borders[1] + u_blur + edge_w);
  vec2 borders3 = vec2(borders[2] + .1 * u_blur - edge_w, borders[2] + .4 * u_blur + edge_w);
  
  float mixer1 = smoothstep(borders1[0], borders1[1], mixer);
  float mixer2 = smoothstep(borders2[0], borders2[1], mixer);
  float mixer3 = smoothstep(borders3[0], borders3[1], mixer);

  vec3 color = mix(colorBack, color1, mixer1);
  color = mix(color, color2, mixer2);
  color = mix(color, color3, mixer3);

  float alpha = mix(u_colorBack.a, u_color1.a, mixer1);
  alpha = mix(alpha, u_color2.a, mixer2);
  alpha = mix(alpha, u_color3.a, mixer3);
  
  fragColor = vec4(color, alpha);
}
`;

export type PulsingBorderUniforms = {};

/**
 *
 * Border borderLine with optional pulsing animation. Inspired by
 *
 * Uniforms include:
 */

export const pulsingBorderFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform vec4 u_colorBack;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform vec4 u_color4;

uniform float u_size;
uniform float u_power;
uniform float u_inner;
uniform float u_frequency;
uniform float u_borderLine;
uniform float u_grain;
uniform float u_spotty;

out vec4 fragColor;

#define PI 3.14159265358979323846


vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

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
  vec2 outer = u_size / u_resolution;
  outer *= 2.447;
      
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


vec2 get_rotated_uv(float rotation, float scale) {
    vec2 noise_uv = gl_FragCoord.xy;
    noise_uv /= u_pixelRatio;
    noise_uv -= .25 * u_resolution.xy;
    noise_uv = rotate(noise_uv, rotation);
    noise_uv += .25 * u_resolution.xy;
    noise_uv *= .0001 * scale * u_frequency;
    return noise_uv;
}

float get_shape(float t1, float t2, float border, float scale) {
  vec2 noise_uv1 = get_rotated_uv(t1, scale);
  float s = (.1 + snoise(noise_uv1));
  s *= (.2 + 1. * t2);
  s *= (1. + 2. * u_power);
  s *= border;
  return s;
}
 
void main() {
  vec2 uv = gl_FragCoord.xy;
  uv /= u_pixelRatio;

  float ratio = u_resolution.x / u_resolution.y;

  float t = u_time;
  
  vec2 uv_normalised = gl_FragCoord.xy / u_resolution.xy;
  float atg = atan(uv_normalised.y, uv_normalised.x);

  float grain = clamp(.6 * snoise(uv * .5) - fbm_4(.4 * uv) - fbm_4(.001 * uv), 0., 1.);
  
  float border_map = get_border_map(uv_normalised);
  border_map += grain * .5 * u_grain;
  
  float shape1 = get_shape(
    sin(1.3 * t), 
    cos(1.5 * t + 0.8 * PI), 
    border_map, 
    0.85);  
  shape1 += get_shape(
    -1.4 * sin(t + 0.6 * PI), 
    cos(0.9 * t + PI), 
    border_map, 
    1.15);
    
  float shape2 = get_shape(
    cos(1.2 * t + 0.7 * PI), 
    sin(1.1 * t + 1.1 * PI), 
    border_map,
    1.05);
  shape2 += get_shape(
    -1.3 * cos(t + 1.3 * PI), 
    sin(0.8 * t + 0.9 * PI), 
    border_map, 
    0.95);

  float shape3 = get_shape(
    cos(1.4 * t), 
    sin(1.7 * t + 1.2 * PI), 
    border_map,
    1.1);
  shape3 += get_shape(
    -1.2 * cos(t + 0.7 * PI), 
    sin(1.6 * t), 
    border_map, 
    1.3);

    
      
  vec3 color = u_colorBack.rgb;
  color = mix(color, u_color1.rgb, shape1);
  color = mix(color, u_color2.rgb, shape2);
  color = mix(color, u_color3.rgb, shape3);

  fragColor = vec4(color, 1.);
}

`;

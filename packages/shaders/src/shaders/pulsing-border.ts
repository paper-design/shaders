export type PulsingBorderUniforms = {
  u_colorBack: [number, number, number, number];
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_brightness: number;
  u_midOpacity: number;
  u_borderPower: number;
};

/**
 *
 * Border gradient with optional pulsing animation. Inspired by
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
uniform float u_brightness;
uniform float u_midOpacity;
uniform float u_borderPower;

uniform float u_borderBlur;
uniform float u_borderSize;

out vec4 fragColor;

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
  mat2 rot(float a) {
      float c = cos(a), s = sin(a);
      return mat2(c, -s, s, c);
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

float get_noise(vec2 uv, float offset, float rotation) {
  uv -= .5;
  uv *= (.0007 * u_resolution);
  uv = rotate(uv, rotation);
  uv /= u_pixelRatio;
  uv += .5;
  
  float noise = snoise(uv + offset);
  noise = pow(noise, 4.);
  return noise;
}

void main() {
  vec2 uv = gl_FragCoord.xy;
  uv /= u_pixelRatio;

  float t = .5 * u_time;
  
  vec2 uv_normalised = gl_FragCoord.xy / u_resolution.xy;

  vec2 border_saved_bl = smoothstep(vec2(0.), vec2(1.), uv_normalised);
  vec2 border_saved_tr = smoothstep(vec2(0.), vec2(1.), 1. - uv_normalised);
  float border_saved = border_saved_bl.x * border_saved_bl.y * border_saved_tr.x * border_saved_tr.y;

  vec2 outer = u_borderSize / u_resolution;
  vec2 bl = smoothstep(vec2(0.), outer, uv_normalised);
  vec2 tr = smoothstep(vec2(0.), outer, 1. - uv_normalised);
  float border = bl.x * bl.y * tr.x * tr.y;
  border = clamp(border, 0., 1.);  
  border = 1. - border;
  border = pow(border, 2. * u_borderBlur);
  
  
  vec2 noise_uv = gl_FragCoord.xy / u_resolution.xy;
  float shape1 = smoothstep(1. - border, 1., get_noise(noise_uv, -.5 * t + 5., .5 * t));
  float shape2 = smoothstep(1. - border, 1., get_noise(.8 * noise_uv, .2 * t + 2., -.5 * t));
  float shape3 = smoothstep(1. - border, 1., get_noise(noise_uv, -.5 * t + 10., .4 * t));
   
   
  float brightness = (1. + 5. * u_brightness);
  shape1 *= brightness;
  shape2 *= brightness;
  shape3 *= brightness;


  float middle1 = mix(1., border_saved, .5);
  middle1 *= (get_noise(noise_uv, -.5 * t + 5., .5 * t));
  middle1 *= u_midOpacity;
  shape1 += middle1;

  float middle2 = mix(1., border_saved, .5);
  middle2 *= (get_noise(.8 * noise_uv, .2 * t + 2., -.5 * t));
  middle2 *= u_midOpacity;
  shape2 += middle2;

  vec3 color = mix(u_colorBack.rgb * u_colorBack.a, u_color1.rgb * u_color1.a, shape1);
  color = mix(color, u_color2.rgb * u_color2.a, shape2);
  color = mix(color, u_color3.rgb * u_color3.a, shape3);
  
  fragColor = vec4(color, 1.);
  
  // fragColor = vec4(vec3(middle), 1.);
}

`;

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

float fbm_6(vec2 n) {
  float total = 0.0, amplitude = .2;
  for (int i = 0; i < 6; i++) {
    total += noise(n) * amplitude;
    n += n;
    amplitude *= 0.6;
  }
  return total;
}

vec2 get_noise_uv(vec2 uv_normalised, float rotation, float t) {
    vec2 noise_uv = uv_normalised;
    noise_uv -= .5;
    noise_uv = rotate(noise_uv, rotation * t);
    noise_uv += .5;
    noise_uv *= u_resolution.xy;
    noise_uv *= .0001 * u_frequency;
    return noise_uv;
}
 
void main() {
  vec2 uv = gl_FragCoord.xy;
  uv /= u_pixelRatio;

  float ratio = u_resolution.x / u_resolution.y;


  float t = 10. + .6 * u_time;
  
  vec2 uv_normalised = gl_FragCoord.xy / u_resolution.xy;
  float grain = clamp(.6 * snoise(uv * .5) - fbm_4(.4 * uv) - fbm_4(.001 * uv), 0., 1.);
  
  float border_map = get_border_map(uv_normalised);
  border_map += grain * .5 * u_grain;
//  border_map *= (1. + 4. * u_power);
  
  
    

    
//  float splats_power = .7 * u_borderLine;
//  
//  float noise1 = snoise(noise_uv + vec2(0., t));
//  float splats1 = smoothstep(0., 1., noise1) * pow(uv_normalised.y, 1.);
//  splats1 *= splats_power;
//  
//  float noise2 = snoise(noise_uv + vec2(0., -t));
//  float splats2 = smoothstep(0., 1., noise2) * pow(1. - uv_normalised.y, 1.);
//  splats2 *= splats_power;
//  
//  float noise3 = snoise(noise_uv + vec2(-t, 0.));
//  float splats3 = smoothstep(0., 1., noise3) * pow(1. - uv_normalised.x, 1.);
//  splats3 *= splats_power;
//  
//  float noise4 = snoise(noise_uv + vec2(t, 0.));
//  float splats4 = smoothstep(0., 1., noise4) * pow(uv_normalised.x, 1.);
//  splats4 *= splats_power;
  
  
//  float shape1 = border_map * (1. + 4. * noise1);
//  float shape2 = border_map * (1. + 4. * noise2);
//  float shape3 = border_map * (1. + 4. * noise3);
//  float shape4 = border_map * (1. + 4. * noise4);
  
  float pulse = (1. + 4. * u_power) * (.3 + .5 * sin(14. * t) * sin(1. * t) * cos(2. * t));
  


  
  float noise_speed = .4;
  float move_speed = 7.;
  vec2 noise_uv1 = get_noise_uv(uv_normalised, 1.1, sin(move_speed * t));
  float shape1 = border_map * pulse * snoise(noise_uv1 + vec2(0., noise_speed * t));

  vec2 noise_uv2 = get_noise_uv(uv_normalised, -.9, sin(move_speed * t));
  float shape2 = border_map * pulse * snoise(noise_uv2 + vec2(0., noise_speed * t));

  vec2 noise_uv3 = get_noise_uv(uv_normalised, -.7, sin(move_speed * t));
  float shape3 = border_map * pulse * snoise(noise_uv3 + vec2(noise_speed * t, -noise_speed * t));
  

//  shape1 += splats1;
//  shape1 *= pow(noise1, 3.);
//  shape1 *= pow(snoise(noise_uv + vec2(0., .3 * t)), 3.);
  
//  shape2 += splats2;
//  shape2 *= pow(noise2, 3.);
//  shape2 *= pow(snoise(noise_uv + vec2(0., -.3 * t)), 3.);
  
//  shape3 += splats3;
//  shape3 *= pow(noise3, 3.);
//  shape3 *= pow(snoise(noise_uv + vec2(-.3 * t, 0.)), 3.);
  
//  shape4 += splats4;
//  shape4 *= pow(noise4, 3.);
//  shape4 *= pow(snoise(noise_uv + vec2(.3 * t, 0.)), 3.);
  
  shape1 = clamp(shape1, 0., 1.);
  shape2 = clamp(shape2, 0., 1.);
  shape3 = clamp(shape3, 0., 1.);
//  shape4 = clamp(shape4, 0., 1.);
  
  vec3 color = mix(u_colorBack.rgb, u_color1.rgb, shape1);
  color = mix(color, u_color2.rgb, shape2);
  color = mix(color, u_color3.rgb, shape3);
//  
//  vec3 color = mix(u_colorBack.rgb, u_color1.rgb, shape1);
//  color += u_color2.rgb * shape2;
//  color += u_color3.rgb * shape3;
//  
  fragColor = vec4(color, 1.);
}

`;

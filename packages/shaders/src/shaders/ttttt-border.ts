export type TttttBorderUniforms = {};

/**
 *
 * Border borderLine with optional ttttt animation. Inspired by
 *
 * Uniforms include:
 */

export const tttttBorderFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
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
uniform float u_size;
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


vec2 ss(vec2 edge0, vec2 edge1, vec2 x) {
    x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * (3. - 2. * x);
}

float get_border_map(vec2 uv_normalised) {

  vec2 outer = (u_size / u_resolution) * u_pixelRatio;
  outer *= (1.28 + .6 * u_blur);  
      
  vec2 bl = ss(vec2(0.), outer, uv_normalised + vec2(u_scaleX, u_scaleY));
  vec2 tr = ss(vec2(0.), outer, 1. - uv_normalised);
 
  float s = 1. - bl.x * bl.y * tr.x * tr.y; 

  return clamp(s, 0., 1.);
//  return smoothstep(.35, .57, length(uv_normalised - .5));
}
 
void main() {
  vec2 uv = gl_FragCoord.xy;
  uv /= u_pixelRatio;

  float ratio = u_resolution.x / u_resolution.y;

  float t = u_time;
  
  vec2 uv_normalised = gl_FragCoord.xy / u_resolution.xy;
  uv_normalised += vec2(-u_offsetX, u_offsetY);

  float atg = atan((uv_normalised - .5).y, (uv_normalised - .5).x);

  float grain = (.6 * snoise(uv * .7 + 1. * t) - 1.5 * fbm_4(.4 * uv) + fbm_4(.001 * uv));
    
  float border_map = get_border_map(uv_normalised);
  border_map += u_grainDistortion * .25 * (grain + .5);
  border_map += u_grainAddon * clamp(grain, 0., 1.);
  
  float mixer = border_map;
  
  float blur = fwidth(border_map) + u_blur;

  vec3 colorBack = u_colorBack.rgb * u_colorBack.a;
  vec3 color1 = u_color1.rgb * u_color1.a;
  vec3 color2 = u_color2.rgb * u_color2.a;
  vec3 color3 = u_color3.rgb * u_color3.a;
  
  vec3 borders = vec3(.0, .25, .6);
    
//  borders.x += .05 * (1.2 + cos(atg * 8. + 2. * t) * sin(atg * 3. + 2. * t));
//  borders.y += .05 * sin(atg * 7. + t);
//  borders.y += .05 * sin(atg * 5. - t);
//  borders.z += .05 * sin(atg * 5. - t);
//  borders.z += .05 * sin(atg * 2. + t);
    
  mixer -= pow(mixer, .3) * .23;
  
  vec3 mixedColor = mix(colorBack, color1, smoothstep(borders[0], borders[0] + .9 * blur, mixer));
  mixedColor = mix(mixedColor, color2, smoothstep(borders[1] + .0 * blur, borders[1] + blur, mixer));
  mixedColor = mix(mixedColor, color3, smoothstep(borders[2] + .1 * blur, borders[2] + .4 * blur, mixer));

  vec4 color_mix = vec4(mixedColor, 1.);
  
//  float luminance = dot(color_mix.rgb, vec3(0.299, 0.587, 0.114));
//  float grainn = rand(.4 * gl_FragCoord.xy) * mix(0.3, 1.0, luminance);
//  color_mix.rgb += grainn;

  fragColor = color_mix;
//  fragColor = vec4(vec3(smoothstep(0., .1, uv_normalised.x)), 1.);
}
`;

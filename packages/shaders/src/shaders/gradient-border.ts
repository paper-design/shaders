export type GradientBorderUniforms = {};

/**
 *
 * Border borderLine with optional gradient animation. Inspired by
 *
 * Uniforms include:
 */

export const gradientBorderFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform vec4 u_colorBack;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;

uniform float u_size;
uniform float u_blur;
uniform float u_inner;
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
    
  vec2 noise_uv = gl_FragCoord.xy / u_resolution.xy;
  float noise = smoothstep(-1., 1., snoise(4. * noise_uv + .2 * u_time));
  noise *= u_borderLine;
  noise *= pow(length(uv_normalised - .5), 2.);
  
  outer += noise;
  
//  outer += .01 * u_inner;
    
  vec2 bl = smoothstep(vec2(0.), outer, uv_normalised);
  vec2 tr = smoothstep(vec2(0.), outer, 1. - uv_normalised);
  
//  vec2 border_shaper = vec2(.6718);
  vec2 border_shaper = vec2(1. - .8 * u_inner);
  
  bl = pow(bl, border_shaper);
  tr = pow(tr, border_shaper);
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
float fbm(vec2 n) {
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

  vec2 noise_uv = gl_FragCoord.xy / u_resolution.xy;

  float t = 10. + .6 * u_time;

  vec2 uv_normalised = gl_FragCoord.xy / u_resolution.xy;

  float grain = snoise(uv * .2) * snoise(uv * .5) - fbm(.002 * uv + 10.) - fbm(.003 * uv);

  float border_map = get_border_map(uv_normalised);


  float mixer = border_map;
  mixer += .4 * grain * u_grain;
  
  float blur = fwidth(border_map) + .6 * u_blur;

  vec3 colorBack = u_colorBack.rgb * u_colorBack.a;
  vec3 color1 = u_color1.rgb * u_color1.a;
  vec3 color2 = u_color2.rgb * u_color2.a;
  vec3 color3 = u_color3.rgb * u_color3.a;
  
  vec3 borders = vec3(0.05, .32, .75); // kinda equal stripes
  
  vec3 mixedColor = mix(colorBack, color1, smoothstep(max(0., borders[0] - blur), borders[0] + .75 * blur, mixer));
  mixedColor = mix(mixedColor, color2, smoothstep(borders[1] - .5 * blur, borders[1] + blur, mixer));
  mixedColor = mix(mixedColor, color3, smoothstep(borders[2] - blur, borders[2] + 2. * blur, mixer));
  
  vec4 color_mix = vec4(mixedColor, 1.);

//  fragColor = color_mix;
  fragColor = vec4(vec3(mixer), 1.);
}


`;

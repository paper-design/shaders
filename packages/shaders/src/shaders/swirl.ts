export type SwirlUniforms = {
  u_offsetX: number;
  u_offsetY: number;
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_bandCount: number;
  u_twist: number;
  u_depth: number;
  u_noiseFreq: number;
  u_noise: number;
  u_blur: number;
};

/**
 * Swirl pattern
 * Renders a swirling pattern with smooth color transitions, adjustable twisting, and noise distortion
 *
 * Uniforms include:
 *
 * Colors:
 * - u_color1: The first color used in the swirl pattern (RGBA)
 * - u_color2: The second color used in the swirl pattern (RGBA)
 * - u_color3: The third color used in the swirl pattern (RGBA)
 *
 * Positioning:
 * - u_offsetX: Horizontal offset of the swirl center
 * - u_offsetY: Vertical offset of the swirl center
 *
 * Swirl Properties:
 * - u_bandCount: The number of color bands in the swirl
 * - u_twist: The amount of twist applied to the swirl pattern
 * - u_depth: Controls how much the swirl pattern falls off towards the center
 *
 * Noise:
 * - u_noiseFreq: Frequency of the applied noise
 * - u_noise: Intensity of the noise effect
 *
 * Blur:
 * - u_blur: Softness of the band transitions, affecting blending between colors
 */

export const swirlFragmentShader = `#version 300 es
precision highp float;

uniform float u_offsetX;
uniform float u_offsetY;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_bandCount;
uniform float u_twist;
uniform float u_depth;
uniform float u_noiseFreq;
uniform float u_noise;
uniform float u_blur;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

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

float remap(float t, float blur) {
  float b = .5 * blur;
  return smoothstep(b, 1. - b, t);
}

vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer, float blur) {
    vec4 colors[3] = vec4[](c1, c2, c3);
    
    float step = 1. / 6.;
    float index = floor(mixer / step);
    float t = fract(mixer / step);
    t = remap(t, blur);

    vec4 colorA = colors[int(mod(index, 3.))];
    vec4 colorB = colors[int(mod(index + 1., 3.))];

    return mix(colorA, colorB, t);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;

  uv -= .5;
  uv += vec2(-u_offsetX, u_offsetY);

  uv *= 1.5;
  uv /= u_pixelRatio;
  uv.x *= ratio;

  float t = u_time;

  float l = length(uv);
  float angle = ceil(u_bandCount) * atan(uv.y, uv.x) + 2. * t;
  float angle_norm = angle / TWO_PI;  

  angle_norm += .2 * u_noise * snoise(7. * u_noiseFreq * uv);
  
  float twist = clamp(2. * u_twist, .3, 2.);
  float offset = twist / l + angle_norm;
  
  float stripe_map = fract(offset);
  
  float center_falloff = clamp(.2 + .5 * abs(twist), .0, 1.);
  float center_factor = smoothstep(0., center_falloff, l * (1. + .5 * abs(u_depth)));
  stripe_map = mix(.5, stripe_map, center_factor);
  
  float shape = stripe_map;
  
  float blur = 1. - u_blur - .1 * (1. - center_factor);
  vec4 color = blend_colors(u_color1, u_color2, u_color3, shape, blur);

  fragColor = vec4(color);
}
`;

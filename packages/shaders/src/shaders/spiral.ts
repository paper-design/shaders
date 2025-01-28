export type SpiralUniforms = {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_scale: number;
  u_offsetX: number;
  u_offsetY: number;
  u_noiseFreq: number;
  u_noisePower: number;
  u_focus: number;
  u_strokeWidth: number;
  u_midShape: number;
  u_decrease: number;
  u_irregular: number;
  u_blur: number;
};

/**
 * Spiral pattern
 * The artwork by Ksenia Kondrashova
 * Renders a number of circular shapes with gooey effect applied
 *
 * Uniforms include:
 * u_colorBack: The mataball base color #1
 * u_colorStripe1: The mataball base color #2
 * u_colorStripe2: The mataball base color #3
 * u_scale: The scale of uv coordinates: with scale = 1 spiral fit the screen height
 */

export const spiralFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform float u_scale;
uniform float u_offsetX;
uniform float u_offsetY;
uniform float u_focus;
uniform float u_noiseFreq;
uniform float u_noisePower;
uniform float u_strokeWidth;
uniform float u_midShape;
uniform float u_decrease;
uniform float u_irregular;
uniform float u_blur;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

out vec4 fragColor;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;

  uv -= .5;
  uv += vec2(-u_offsetX, u_offsetY);
  float radius_original = length(uv);

  uv *= (.3 + 40. * u_scale);
  uv /= u_pixelRatio;
  uv.x *= ratio;

  float t = u_time;

  float l = length(uv);
  float angle = atan(uv.y, uv.x) - 2. * t;
  float angle_norm = angle / TWO_PI;

  float offset = pow(l, 1. - u_focus) + angle_norm;  
  
  float n1 = noise(uv * .7 * u_noiseFreq + .5 * t);
  float n2 = noise(uv * .9 * u_noiseFreq - .5 * t);
  float a = n1 * TWO_PI;
  offset += .5 * u_noisePower * n2 * cos(a) * pow(radius_original, .5);
  offset -= .5 * u_noisePower * n1 * sin(a) * pow(radius_original, .5);

  float stripe_map = fract(offset);
  stripe_map -= u_decrease * l;
  
  stripe_map *= (1. + u_irregular * sin(4. * l - t) * cos(PI + l + t));

  float shape = 2. * abs(stripe_map - .5);
  
  // shape *= (1. - u_midShape * u_irregular / l);
  shape *= (1. - u_midShape * u_blur / l);
  
  float stroke_width = clamp(u_strokeWidth, fwidth(l), 1. - fwidth(l));
  float edge_width = min(fwidth(l), fwidth(offset));

  float mid = 1. - smoothstep(.0, .9, l);
  mid = pow(mid, 2.);

  shape -= u_midShape * (mid * (.5 - u_strokeWidth));
  shape = smoothstep(stroke_width - edge_width - u_blur, stroke_width + edge_width + u_blur, shape);

  vec3 color = mix(u_color1.rgb * u_color1.a, u_color2.rgb * u_color2.a, shape);
  float opacity = mix(u_color1.a, u_color2.a, shape);

  fragColor = vec4(color, opacity);
}
`;

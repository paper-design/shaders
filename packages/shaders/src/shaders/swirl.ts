export type SwirlUniforms = {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_scale: number;
  u_offsetX: number;
  u_offsetY: number;
  u_spiralDensity: number;
  u_spiralDistortion: number;
  u_strokeWidth: number;
  u_strokeTaper: number;
  u_strokeCap: number;
  u_noiseFreq: number;
  u_noisePower: number;
  u_blur: number;
};

/**
 * Swirl pattern
 * The artwork by Ksenia Kondrashova
 * Renders a number of circular shapes with gooey effect applied
 *
 * Uniforms include:
 * u_colorBack: The mataball base color #1
 * u_colorStripe1: The mataball base color #2
 * u_colorStripe2: The mataball base color #3
 * u_scale: The scale of uv coordinates: with scale = 1 spiral fit the screen height
 */

export const swirlFragmentShader = `#version 300 es
precision highp float;

uniform float u_scale;
uniform float u_offsetX;
uniform float u_offsetY;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_spiralDensity;
uniform float u_spiralDistortion;
uniform float u_strokeWidth;
uniform float u_strokeCap;
uniform float u_strokeTaper;

uniform float u_noiseFreq;
uniform float u_noisePower;
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

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;

  uv -= .5;
  uv += vec2(-u_offsetX, u_offsetY);

  uv *= (.4 + 30. * u_scale);
  uv /= u_pixelRatio;
  uv.x *= ratio;

  float t = u_time;

  float l = length(uv);
  float angle = atan(uv.y, uv.x) - 2. * t;
  float angle_norm = angle / TWO_PI;  

  angle_norm += .5 * u_noisePower * snoise(.5 * u_noiseFreq * uv);

  float offset = pow(l, 1. - u_spiralDensity) + angle_norm;
  
  float stripe_map = fract(offset);
  stripe_map -= u_strokeTaper * l;
  
  stripe_map += u_noisePower * snoise(u_noiseFreq * uv);

  float shape = 2. * abs(stripe_map - .5);
  
  shape *= (1. + u_spiralDistortion * sin(4. * l - t) * cos(PI + l + t));
    
  float stroke_width = clamp(u_strokeWidth, fwidth(l), 1. - fwidth(l));

  float edge_width = min(fwidth(l), fwidth(offset));

  float mid = 1. - smoothstep(.0, .9, l);
  mid = pow(mid, 2.);

  shape = smoothstep(stroke_width - edge_width - u_blur, stroke_width + edge_width + u_blur, shape);

  vec3 color = mix(u_color1.rgb * u_color1.a, u_color2.rgb * u_color2.a, shape);
  float opacity = mix(u_color1.a, u_color2.a, shape);

  fragColor = vec4(color, opacity);
}
`;

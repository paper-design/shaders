export type SwirlUniforms = {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_scale: number;
  u_offsetX: number;
  u_offsetY: number;
  u_frequency: number;
  u_twist: number;
  u_depth: number;
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
uniform float u_frequency;

uniform float u_twist;
uniform float u_depth;

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

float remap(float t) {
  float b = .495 * (1. - u_blur);
  return smoothstep(b, 1. - b, t);
}

vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer) {
  vec4 color1 = vec4(c1.rgb * c1.a, c1.a);
  vec4 color2 = vec4(c2.rgb * c2.a, c2.a);
  vec4 color3 = vec4(c3.rgb * c3.a, c3.a);

  vec4 res;
  float step = 1. / 6.;

  if (mixer < step) {
    float t = mixer / step;
    t = remap(t);
    res = mix(color1, color2, t);
  } else if (mixer < 2. * step) {
    float t = (mixer - step) / step;
    t = remap(t);
    res = mix(color2, color3, t);
  } else if (mixer < 3. * step) {
    float t = (mixer - 2. * step) / step;
    t = remap(t);
    res = mix(color3, color1, t);
  } else if (mixer < 4. * step) {
    float t = (mixer - 3. * step) / step;
    t = remap(t);
    res = mix(color1, color2, t);
  } else if (mixer < 5. * step) {
    float t = (mixer - 4. * step) / step;
    t = remap(t);
    res = mix(color2, color3, t);
  } else {
    float t = (mixer - 5. * step) / step;
    t = remap(t);
    res = mix(color3, color1, t);
  }
  return res;
}

float easeMidpoint(float x, float k) {
    return pow(x, k) / (pow(x, k) + pow(1.0 - x, k));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;

  uv -= .5;
  uv += vec2(-u_offsetX, u_offsetY);

  uv *= (.5 + 2. * u_scale);
  uv /= u_pixelRatio;
  uv.x *= ratio;

  float t = u_time;

  float l = length(uv);
  float angle = ceil(u_frequency) * atan(uv.y, uv.x) + 2. * t;
  float angle_norm = angle / TWO_PI;  

  angle_norm += .5 * u_noisePower * snoise(4. * u_noiseFreq * uv);
    
  float twisted_l = .01 + pow(1.5 * l, 5. * u_twist);

  float offset = (.5 + .5 * u_depth) / twisted_l + angle_norm;
  
  float stripe_map = fract(offset);
  
  float shape = stripe_map;
  
  shape = easeMidpoint(shape, smoothstep(.1, 1., twisted_l));
  
  vec4 color = blend_colors(u_color1, u_color2, u_color3, shape);

  fragColor = vec4(color);
}
`;

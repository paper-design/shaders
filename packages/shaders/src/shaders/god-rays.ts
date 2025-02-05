export type GodRaysUniforms = {
  u_offsetX: number;
  u_offsetY: number;
  u_colorBack: [number, number, number, number];
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_spotty: number;
  u_midShape: number;
  u_midIntensity: number;
  u_frequency: number;
  u_density: number;
  u_blending: number;
};

/**
 * GodRays pattern
 * The artwork by Ksenia Kondrashova
 * Renders a number of circular shapes with gooey effect applied
 *
 * Uniforms include:
 * u_colorBack - color #2 of mix used to fill the cell shape
 * u_color1 - color #1 of mix used to fill the cell shape
 * u_spread (0 ... 0.5) - how far the cell center can move from regular square grid
 * u_edgesSize (0 .. 1) - the size of borders
 *   (can be set to zero but the edge may get glitchy due to nature of GodRays diagram)
 * u_edgesSharpness (0 .. 1) - the blur/sharp for cell border
 * u_middleSize (0 .. 1) - the size of shape in the center of each cell
 * u_middleSharpness (0 .. 1) - the smoothness of shape in the center of each cell
 *   (vary from cell color gradient to sharp dot in the middle)
 */

export const godRaysFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform vec4 u_colorBack;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;


uniform float u_offsetX;
uniform float u_offsetY;
uniform float u_spotty;
uniform float u_midShape;
uniform float u_midIntensity;
uniform float u_frequency;
uniform float u_density;
uniform float u_blending;

out vec4 fragColor;

#define TWO_PI 6.28318530718

float random(vec2 uv) {
  return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float noise(vec2 uv) {
  vec2 i = floor(uv);
  vec2 f = fract(uv);

  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float get_noise_shape(vec2 uv, float r, float freq, float time) {
  uv = rotate(uv, .05 * time);
  float a = atan(uv.y, uv.x);
  r -= 3. * time;
  vec2 left = vec2(a * freq, r);
  vec2 right = vec2(mod(a, TWO_PI) * freq, r);
  float shape = mix(noise(right), noise(left), smoothstep(-.2, .2, uv.x));
  return shape;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;

  uv -= .5;
  uv += vec2(-u_offsetX, u_offsetY);
  uv.x *= ratio;

  float t = .2 * u_time;

  float radius = length(uv);
  float spots = 4. * u_spotty;
  float density = 1. - clamp(u_density, 0., 1.);

  float rays1 = get_noise_shape(uv, radius * spots, 5. * u_frequency, t);
  rays1 *= get_noise_shape(uv, .5 + .75 * radius * spots, 4. * u_frequency, -.5 * t);
  
  float rays2 = get_noise_shape(uv, 1.5 * radius * spots, 12. * u_frequency, t);
  rays2 *= get_noise_shape(uv, -.5 + 1.1 * radius * spots, 7. * u_frequency, .75 * t);
  
  float rays3 = get_noise_shape(uv, 2. * radius * spots, 10. * u_frequency, t);
  rays3 *= get_noise_shape(uv, 1.1 * radius * spots, 12. * u_frequency, .2 * t);
  
  vec2 uv_ray1_mask = rotate(uv, .2 * t);
  float a_ray1_mask = atan(uv_ray1_mask.y, uv_ray1_mask.x);
  rays1 -= density * abs(sin(7. * a_ray1_mask) * cos(2. * a_ray1_mask + .25 * t));
  rays1 = max(rays1, 0.);
  
  vec2 uv_ray2_mask = rotate(uv, -.4 * t);
  float a_ray2_mask = atan(uv_ray2_mask.y, uv_ray2_mask.x);
  rays2 -= density * abs(sin(4. * a_ray2_mask + .2 * t) * cos(5. * a_ray2_mask));
  rays2 = max(rays2, 0.);

  vec2 uv_ray3_mask = rotate(uv, .5 * t);
  float a_ray3_mask = atan(uv_ray3_mask.y, uv_ray3_mask.x); 
  rays3 -= density * abs(sin(7. * a_ray1_mask - .3 * t) * cos(2. * a_ray1_mask));
  rays3 = max(rays3, 0.);

  float mid_shape = smoothstep(1. * u_midShape, .1 * u_midShape, radius);  
  rays3 = mix(rays2, 1., u_midIntensity * pow(mid_shape, 7.));
  rays2 = mix(rays2, 1., u_midIntensity * pow(mid_shape, 2.));
  rays1 = mix(rays1, 1., u_midIntensity * pow(mid_shape, 5.));
  
  vec3 mixed_color = mix(u_colorBack.rgb, u_color2.rgb, rays2);
  mixed_color = mix(mixed_color, u_color3.rgb, rays3);
  mixed_color = mix(mixed_color, u_color1.rgb, rays1);

  vec3 added_color = u_colorBack.rgb;
  added_color += u_color1.rgb * rays1;
  added_color += u_color2.rgb * rays2;
  added_color += u_color3.rgb * rays3;
  
  vec3 color = mix(mixed_color, added_color, u_blending);
  
  fragColor = vec4(color, 1.);
}
`;

export type GodRaysUniforms = {
  u_offsetX: number;
  u_offsetY: number;
  u_colorBack: [number, number, number, number];
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_spotty: number;
  u_midShape: number;
  u_light: number;
  u_frequency: number;
  u_density: number;
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

uniform float u_offsetX;
uniform float u_offsetY;
uniform float u_spotty;
uniform float u_midShape;
uniform float u_light;
uniform float u_frequency;
uniform float u_density;

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

float get_noise_shape(vec2 uv, float r, float density, float time) {
  uv = rotate(uv, .05 * time);
  float a = atan(uv.y, uv.x);
  r -= 3. * time;
  vec2 left = vec2(a * density, r);
  vec2 right = vec2(mod(a, TWO_PI) * density, r);
  return mix(noise(right), noise(left), smoothstep(-.2, .2, uv.x));
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

  float rays_inner = .5 * get_noise_shape(uv, radius * spots, 3. * u_frequency, t);
  rays_inner += .2 * get_noise_shape(uv, .5 + .75 * radius * spots, 6. * u_frequency, -.3 * t);

  float rays_outer = .5 * get_noise_shape(uv, .3 + .5 * radius, 14. * u_frequency, -.5 * t);
  rays_outer += .2 * get_noise_shape(uv, .3 + 1.5 * radius, 4. * u_frequency, .75 * t);
  rays_inner += .3 * rays_outer;

  rays_inner *= (1. + .3 * u_light);
  rays_outer *= (1. + .5 * u_light);

  float mid_shape = smoothstep(1. * u_midShape, .1 * u_midShape, radius);
  rays_inner = mix(rays_inner, 1. + .05 * u_light, mid_shape);

  rays_outer -= smoothstep(.3 * u_midShape, 0., radius);

  rays_inner = pow(rays_inner, 13. - 11. * clamp(u_density, .2, .6));
  rays_outer = pow(rays_outer, 7. - 6. * clamp(u_density, .2, .6));

  rays_inner = clamp(rays_inner, 0., 1. + .5 * u_light);
  rays_outer = clamp(rays_outer, 0., 1. + .3 * u_light);

  vec3 color = mix(u_colorBack.rgb, u_color1.rgb, rays_inner);
  color = mix(color, u_color2.rgb, rays_outer);

  fragColor = vec4(color, 1.);
}
`;

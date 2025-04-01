import type { ShaderMotionParams } from '../shader-mount';
import type { ShaderSizingParams, ShaderSizingUniforms } from '../shader-sizing';

/**
 * GodRays pattern
 * The artwork by Ksenia Kondrashova
 * Renders a number of circular shapes with gooey effect applied
 *
 * Uniforms include:
 *
 * u_offsetX - left / right pan
 * u_offsetY - up / down pan
 * u_colorBack - background RGBA color
 * u_color1 - ray color #1 (also main color of middle spot)
 * u_color2 - ray color #2
 * u_color3 - ray color #3
 * u_frequency - the frequency of rays (the number of sectors)
 * u_spotty - the density of spots in the rings (higher = more spots)
 * u_midSize - the size of the central shape within the rings
 * u_midIntensity - the influence of the central shape on the rings
 * u_density (0 .. 1) - the number of visible rays
 * u_blending (0 .. 1) - blending mode (0 for color mix, 1 for additive blending)
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

uniform float u_frequency;
uniform float u_spotty;
uniform float u_midSize;
uniform float u_midIntensity;
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

float get_noise_shape(vec2 uv, float r, float freq, float density, float time) {
  uv = rotate(uv, .05 * time);
  float a = atan(uv.y, uv.x);
  r -= 3. * time;
  vec2 left = vec2(a * freq, r);
  vec2 right = vec2(mod(a, TWO_PI) * freq, r);
  float n_left = pow(noise(left), density);
  float n_right = pow(noise(right), density);
  float shape = mix(n_right, n_left, smoothstep(-.2, .2, uv.x));
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
  float spots = 4. * abs(u_spotty);
  float density = 4. - 3. * clamp(u_density, 0., 1.);

  float rays1 = get_noise_shape(uv, radius * spots, 5. * u_frequency, density, t);
  rays1 *= get_noise_shape(uv, .5 + .75 * radius * spots, 4. * u_frequency, density, -.5 * t);

  float rays2 = get_noise_shape(uv, 1.5 * radius, 12. * u_frequency, density, t);
  rays2 *= get_noise_shape(uv, -.5 + 1.1 * radius * spots, 7. * u_frequency, density, .75 * t);

  float rays3 = get_noise_shape(uv, 2. * radius * spots, 10. * u_frequency, density, t);
  rays3 *= get_noise_shape(uv, 1.1 * radius, 12. * u_frequency, density, .2 * t);

  float mid_shape = smoothstep(1. * abs(u_midSize), .05 * abs(u_midSize), radius);
  rays3 = mix(rays3, 1., (.5 + .5 * rays1) * u_midIntensity * pow(mid_shape, 7.));
  rays2 = mix(rays2, 1., (.5 + .5 * rays3) * u_midIntensity * pow(mid_shape, 3.));
  rays1 = mix(rays1, 1., u_midIntensity * pow(mid_shape, 5.));

  float opacity = rays2 * u_color2.a;
  opacity += rays3 * u_color3.a;
  opacity += rays1 * u_color1.a;
  opacity += u_colorBack.a * (1.0 - rays1 * u_color1.a - rays2 * u_color2.a - rays3 * u_color3.a);
  opacity = clamp(opacity, 0.0, 1.0);

  vec3 added_color = u_colorBack.rgb * (1. - (rays1 + rays2 + rays3)) * u_colorBack.a;
  added_color += u_color1.rgb * rays1 * u_color1.a;
  added_color += u_color2.rgb * rays2 * u_color2.a;
  added_color += u_color3.rgb * rays3 * u_color3.a;

  added_color += u_colorBack.rgb * rays1 * (1.0 - u_color1.a) * u_colorBack.a;
  added_color += u_colorBack.rgb * rays2 * (1.0 - u_color2.a) * u_colorBack.a;
  added_color += u_colorBack.rgb * rays3 * (1.0 - u_color3.a) * u_colorBack.a;

  vec3 mixed_color = mix(u_colorBack.rgb * u_colorBack.a, u_color2.rgb, rays2 * u_color2.a);
  mixed_color = mix(mixed_color, u_color3.rgb, rays3 * u_color3.a);
  mixed_color = mix(mixed_color, u_color1.rgb, rays1 * u_color1.a);

  vec3 color = mix(mixed_color, added_color, clamp(u_blending, 0., 1.));

  fragColor = vec4(color, opacity);
}
`;

export interface GodRaysUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_spotty: number;
  u_midSize: number;
  u_midIntensity: number;
  u_frequency: number;
  u_density: number;
  u_blending: number;
}

export interface GodRaysParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  spotty?: number;
  midSize?: number;
  midIntensity?: number;
  frequency?: number;
  density?: number;
  blending?: number;
}

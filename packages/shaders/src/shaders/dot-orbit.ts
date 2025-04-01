import type { ShaderMotionParams } from '../shader-mount';
import type { ShaderSizingParams, ShaderSizingUniforms } from '../shader-sizing';

/**
 * Dot Pattern with dot moving around their grid position
 * The artwork by Ksenia Kondrashova
 * Renders a dot pattern with dot placed in the center of each cell of animated Voronoi diagram
 *
 * Uniforms include:
 * u_scale - the scale applied to user space
 * u_color1 - the first color
 * u_color2 - the second color
 * u_color3 - the third color
 * u_color4 - the fourth color
 * u_dotSize (0 .. 1) - the base dot radius (relative to cell size)
 * u_dotSizeRange (0 .. 1) - the dot radius to vary between the cells
 * u_spreading (0 .. 1) - the distance each dot can move around the regular grid
 */
export const dotOrbitFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform vec4 u_color4;
uniform float u_dotSize;
uniform float u_dotSizeRange;
uniform float u_spreading;

out vec4 fragColor;

#define TWO_PI 6.28318530718

float random(in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
vec2 random2(vec2 p) {
  return vec2(random(p), random(200. * p));
}

vec3 get_voronoi_shape(vec2 _uv, float time) {
  vec2 i_uv = floor(_uv);
  vec2 f_uv = fract(_uv);

  float min_dist = 1.;
  vec2 cell_randomizer = vec2(0.);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 tile_offset = vec2(float(x), float(y));
      vec2 rand = random2(i_uv + tile_offset);
      vec2 cell_center = .5 + 1e-4 + .25 * clamp(u_spreading, 0., 1.) * sin(time + TWO_PI * rand);
      float dist = length(tile_offset + cell_center - f_uv);
      if (dist < min_dist) {
        min_dist = dist;
        cell_randomizer = rand;
      }
      min_dist = min(min_dist, dist);
    }
  }

  return vec3(min_dist, cell_randomizer);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  uv -= .5;
  float scale = .5 * u_scale + 1e-4;
  uv *= (.02 * (1. - step(1. - scale, 1.) / scale));
  uv *= u_resolution;
  uv /= u_pixelRatio;
  uv += .5;

  float t = u_time;

  vec3 voronoi = get_voronoi_shape(uv, t) + 1e-4;

  float radius = .25 * clamp(u_dotSize, 0., 1.) - .5 * clamp(u_dotSizeRange, 0., 1.) * voronoi[2];
  float dist = voronoi[0];
  float edge_width = fwidth(dist);
  float shape = smoothstep(radius + edge_width, radius - edge_width, dist);

  float color_randomizer = voronoi[1];

  float opacity =
    u_color1.a * step(0.0, color_randomizer) * step(color_randomizer, 0.25) +
    u_color2.a * step(0.25, color_randomizer) * step(color_randomizer, 0.5) +
    u_color3.a * step(0.5, color_randomizer) * step(color_randomizer, 0.75) +
    u_color4.a * step(0.75, color_randomizer) * step(color_randomizer, 1.0);

  opacity *= shape;

  vec3 color =
    u_color1.rgb * step(0.0, color_randomizer) * step(color_randomizer, 0.25) +
    u_color2.rgb * step(0.25, color_randomizer) * step(color_randomizer, 0.5) +
    u_color3.rgb * step(0.5, color_randomizer) * step(color_randomizer, 0.75) +
    u_color4.rgb * step(0.75, color_randomizer) * step(color_randomizer, 1.0);

  fragColor = vec4(color * opacity, opacity);
}
`;

export interface DotOrbitUniforms extends ShaderSizingUniforms {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_color4: [number, number, number, number];
  u_dotSize: number;
  u_dotSizeRange: number;
  u_spreading: number;
}

export interface DotOrbitParams extends ShaderSizingParams, ShaderMotionParams {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  dotSize?: number;
  dotSizeRange?: number;
  spreading?: number;
}

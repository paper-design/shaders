import type { ShaderMotionParams, ShaderSizingParams, ShaderSizingUniforms } from '../shader-mount';
/**
 * Voronoi pattern
 * The artwork by Ksenia Kondrashova
 * Renders a number of circular shapes with gooey effect applied
 *
 * Uniforms include:
 * u_scale - the scale applied to user space
 * u_colorCell1 - color #1 of mix used to fill the cell shape
 * u_colorCell2 - color #2 of mix used to fill the cell shape
 * u_colorCell3 - color #3 of mix used to fill the cell shape
 * u_colorEdges - color of borders between the cells
 * u_colorMid - color used to fill the radial shape in the center of each cell
 * u_colorGradient (0 .. 1) - if the cell color is a gradient of palette colors or one color selection
 * u_distance (0 ... 0.5) - how far the cell center can move from regular square grid
 * u_edgesSize (0 .. 1) - the size of borders
 *   (can be set to zero but the edge may get glitchy due to nature of Voronoi diagram)
 * u_edgesSoftness (0 .. 1) - the blur/sharp for cell border
 * u_middleSize (0 .. 1) - the size of shape in the center of each cell
 * u_middleSoftness (0 .. 1) - the smoothness of shape in the center of each cell
 *   (vary from cell color gradient to sharp dot in the middle)
 */
export const voronoiFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;

uniform vec4 u_colorCell1;
uniform vec4 u_colorCell2;
uniform vec4 u_colorCell3;
uniform vec4 u_colorMid;
uniform vec4 u_colorEdges;

uniform float u_colorGradient;
uniform float u_distance;
uniform float u_edgesSize;
uniform float u_edgesSoftness;
uniform float u_middleSize;
uniform float u_middleSoftness;

#define TWO_PI 6.28318530718

out vec4 fragColor;

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 18.5453);
}

float smin(float angle, float b, float k) {
  float h = clamp(.5 + .5 * (b - angle) / k, 0., 1.);
  return mix(b, angle, h) - k * h * (1. - h);
}

vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, vec2 randomizer) {
    vec3 color1 = c1.rgb * c1.a;
    vec3 color2 = c2.rgb * c2.a;
    vec3 color3 = c3.rgb * c3.a;

    float mixer = clamp(u_colorGradient, 0., 1.);
    float r1 = smoothstep(.5 - .5 * mixer, .5 + .5 * mixer, randomizer[0]);
    float r2 = smoothstep(.6 - .6 * mixer, .6 + .4 * mixer, randomizer[1]);
    vec3 blended_color_2 = mix(color1, color2, r1);
    float blended_opacity_2 = mix(c1.a, c2.a, r1);
    vec3 c = mix(blended_color_2, color3, r2);
    float o = mix(blended_opacity_2, c3.a, r2);

    return vec4(c, o);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = u_time;
  uv -= .5;
  uv *= (.01 * u_scale * u_resolution);
  uv /= u_pixelRatio;
  uv += .5;

  vec2 i_uv = floor(uv);
  vec2 f_uv = fract(uv);

  vec2 randomizer = vec2(0.);
  vec3 distance = vec3(1.);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 tile_offset = vec2(float(x), float(y));
      vec2 o = hash(i_uv + tile_offset);
      tile_offset += (.5 + clamp(u_distance, 0., .5) * sin(t + TWO_PI * o)) - f_uv;

      float dist = dot(tile_offset, tile_offset);
      float old_min_dist = distance.x;

      distance.z = max(distance.x, max(distance.y, min(distance.z, dist)));
      distance.y = max(distance.x, min(distance.y, dist));
      distance.x = min(distance.x, dist);

      if (old_min_dist > distance.x) {
        randomizer = o;
      }
    }
  }

  distance = sqrt(distance);

  distance = sqrt(distance);
  float cell_shape = min(smin(distance.z, distance.y, .1) - distance.x, 1.);

  float dot_shape = pow(distance.x, 2.) / (2. * clamp(u_middleSize, 0., 1.) + 1e-4);
  float dot_edge_width = fwidth(dot_shape);
  float dotSharp = clamp(1. - u_middleSoftness, 0., 1.);
  dot_shape = 1. - smoothstep(.5 * dotSharp - dot_edge_width, 1. - .5 * dotSharp, dot_shape);

  float cell_edge_width = fwidth(distance.x);
  float w = .7 * (clamp(u_edgesSize, 0., 1.) - .1);
  float edgeSharp = clamp(u_edgesSoftness, 0., 1.);
  cell_shape = smoothstep(w - cell_edge_width, w + edgeSharp, cell_shape);

  dot_shape *= cell_shape;

  vec4 cell_mix = blend_colors(u_colorCell1, u_colorCell2, u_colorCell3, randomizer);

  vec4 edges = vec4(u_colorEdges.rgb * u_colorEdges.a, u_colorEdges.a);

  vec3 color = mix(edges.rgb, cell_mix.rgb, cell_shape);
  float opacity = mix(edges.a, cell_mix.a, cell_shape);

  color = mix(color, u_colorMid.rgb * u_colorMid.a, dot_shape);
  opacity = mix(opacity, u_colorMid.a, dot_shape);

  fragColor = vec4(color, opacity);
}
`;

export interface VoronoiUniforms extends ShaderSizingUniforms {
  u_colorCell1: [number, number, number, number];
  u_colorCell2: [number, number, number, number];
  u_colorCell3: [number, number, number, number];
  u_colorEdges: [number, number, number, number];
  u_colorMid: [number, number, number, number];
  u_colorGradient: number;
  u_distance: number;
  u_edgesSize: number;
  u_edgesSoftness: number;
  u_middleSize: number;
  u_middleSoftness: number;
}

export interface VoronoiParams extends ShaderSizingParams, ShaderMotionParams {
  colorCell1?: string;
  colorCell2?: string;
  colorCell3?: string;
  colorEdges?: string;
  colorMid?: string;
  colorGradient?: number;
  distance?: number;
  edgesSize?: number;
  edgesSoftness?: number;
  middleSize?: number;
  middleSoftness?: number;
}

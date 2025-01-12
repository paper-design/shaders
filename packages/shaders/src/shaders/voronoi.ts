export type VoronoiUniforms = {
    u_colorEdges: [number, number, number, number];
    u_colorCell1: [number, number, number, number];
    u_colorCell2: [number, number, number, number];
    u_colorMid1: [number, number, number, number];
    u_colorMid2: [number, number, number, number];
    u_distance: number;
    u_edgesSize: number;
    u_edgesSharpness: number;
    u_middleSize: number;
    u_middleSharpness: number;
    u_scale: number;
};

/**
 * Voronoi pattern
 * The artwork by Ksenia Kondrashova
 * Renders a number of circular shapes with gooey effect applied
 *
 * Uniforms include:
 * u_colorEdges - color of borders (between the cells)
 * u_colorCell1 - color #1 of mix used to fill the cell shape
 * u_colorCell2 - color #2 of mix used to fill the cell shape
 * u_colorMid1 - color #1 of mix used to fill the radial shape in the center of each cell
 * u_colorMid2 - color #2 of mix used to fill the radial shape in the center of each cell
 * u_distance - how far the cell center can move from regular square grid
 * u_edgesSize - the size of borders (can be set to zero but the edge may get glitchy due
 *   to nature of Voronoi diagram)
 * u_edgesSharpness - the smoothness for cel border
 * u_middleSize - the size of shape in the center of each cell
 * u_middleSharpness - the smoothness of shape in the center of each cell (vary from cell
 *   color gradient to sharp dot in the middle)
 * u_scale: The scale applied to UV space
 */

export const voronoiFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_colorEdges;
uniform vec4 u_colorCell1;
uniform vec4 u_colorCell2;
uniform vec4 u_colorMid1;
uniform vec4 u_colorMid2;

uniform float u_distance;
uniform float u_edgesSize;
uniform float u_edgesSharpness;
uniform float u_middleSize;
uniform float u_middleSharpness;

uniform float u_time;
uniform float u_pixelRatio;
uniform float u_scale;
uniform vec2 u_resolution;

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
      tile_offset += (.5 + min(.5, u_distance) * sin(t + TWO_PI * o)) - f_uv;

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
  float cell_radius = distance.x;

  distance = sqrt(distance);
  float cell_shape = min(smin(distance.z, distance.y, .1) - distance.x, 1.);

  float dot_shape = cell_radius / (2. * u_middleSize + 1e-4);
  float dot_edge_width = fwidth(dot_shape);
  dot_shape = 1. - smoothstep(.5 * u_middleSharpness - dot_edge_width, 1. - .5 * u_middleSharpness, dot_shape);

  float cell_edge_width = fwidth(distance.x);
  float w = .7 * (u_edgesSize - .1);
  cell_shape = smoothstep(w - cell_edge_width, w + u_edgesSharpness, cell_shape);

  dot_shape *= cell_shape;

  vec3 dot_color = mix(u_colorMid1.rgb * u_colorMid1.a, u_colorMid2.rgb * u_colorMid2.a, randomizer[0]);
  float dot_opacity = mix(u_colorMid1.a, u_colorMid2.a, randomizer[0]);

  vec3 cell_color = mix(u_colorCell1.rgb * u_colorCell1.a, u_colorCell2.rgb * u_colorCell2.a, randomizer[1]);
  float cell_opacity = mix(u_colorCell1.a, u_colorCell2.a, randomizer[1]);
  
  vec3 edge_color = u_colorEdges.rgb;
  float edge_opacity = u_colorEdges.a;

  edge_color *= edge_opacity;

  vec3 color = edge_color;
  color = mix(color, cell_color, cell_shape);
  float opacity = mix(edge_opacity, cell_opacity, cell_shape);

  color = mix(color, dot_color, dot_shape);
  opacity = mix(opacity, dot_opacity, dot_shape);

  fragColor = vec4(color, opacity);
}
`;
export type VoronoiUniforms = {
    u_colorEdges: [number, number, number, number];
    u_colorCell1: [number, number, number, number];
    u_colorCell2: [number, number, number, number];
    u_colorMid1: [number, number, number, number];
    u_colorMid2: [number, number, number, number];
    u_scale: number;
    u_edgeWidth: number;
    u_midSize: number;
    u_dotSharpness: number;
};

/**
 * Voronoi pattern
 * The artwork by Ksenia Kondrashova
 * Renders a number of circular shapes with gooey effect applied
 *
 * Uniforms include:
 * u_scale: The scale applied to pattern
 */

export const voronoiFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_colorEdges;
uniform vec4 u_colorCell1;
uniform vec4 u_colorCell2;
uniform vec4 u_colorMid1;
uniform vec4 u_colorMid2;
uniform float u_scale;

uniform float u_edgeWidth;
uniform float u_midSize;
uniform float u_dotSharpness;

uniform float u_time;
uniform float u_ratio;
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
  float ratio = u_resolution.x / u_resolution.y;

  uv -= .5;
  uv *= u_scale;
  uv += .5;
  uv.x *= ratio;

  float t = u_time;

  // ======

  vec2 i_uv = floor(uv);
  vec2 f_uv = fract(uv);

  vec2 randomizer = vec2(0.);
  vec3 distance = vec3(1.);
  float angle = 0.;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 tile_offset = vec2(float(x), float(y));
      vec2 blick_tile_offset = tile_offset;
      vec2 o = hash(i_uv + tile_offset);
      tile_offset += (.5 + (.25) * sin(t + TWO_PI * o)) - f_uv;
      blick_tile_offset += (.9 - f_uv);

      float dist = dot(tile_offset, tile_offset);
      float old_min_dist = distance.x;

      distance.z = max(distance.x, max(distance.y, min(distance.z, dist)));
      distance.y = max(distance.x, min(distance.y, dist));
      distance.x = min(distance.x, dist);

      if (old_min_dist > distance.x) {
        angle = atan(tile_offset.x, tile_offset.y);
        randomizer = o;
      }
    }
  }

  distance = sqrt(distance);
  distance = sqrt(distance);
  float cell_shape = min(smin(distance.z, distance.y, .1) - distance.x, 1.);
  float cell_radius = distance.x;

  float dot_shape = cell_radius / (4. * u_midSize + 1e-4);
  float dot_edge_width = fwidth(dot_shape);
  dot_shape = smoothstep(0. + .5 * u_dotSharpness, 1. - .5 * u_dotSharpness, dot_shape);

  float cell_edge_width = fwidth(cell_shape);
  float w = .7 * (u_edgeWidth - .1);
  cell_shape = smoothstep(w - cell_edge_width, w + cell_edge_width, cell_shape);
  
  dot_shape *= cell_shape;
  
  vec3 cell_color = mix(u_colorMid1.rgb, u_colorMid2.rgb, randomizer[0]);
  vec3 dot_color = mix(u_colorCell1.rgb, u_colorCell2.rgb, randomizer[1]);

  vec3 color = u_colorEdges.rgb;
  color = mix(color, cell_color, cell_shape);
  color = mix(color, dot_color, dot_shape);

  float opacity = 1.;

  fragColor = vec4(color, opacity);
}

`;
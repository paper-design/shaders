export type DotsOrbitUniforms = {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_color4: [number, number, number, number];
  u_scale: number;
  u_dotSize: number;
  u_dotSizeRange: number;
  u_spreading: number;
};

/**
 * Dots Pattern with dots moving around their grid position
 * The artwork by Ksenia Kondrashova
 * Renders a dot pattern with dots placed in the center of each cell of animated Voronoi diagram
 *
 * Uniforms include:
 * u_color1: The first dots color
 * u_color2: The second dots color
 * u_color3: The third dots color
 * u_color4: The fourth dots color
 * u_scale: The scale applied to pattern
 * u_dotSize: The base dot radius (relative to cell size)
 * u_dotSizeRange: Dot radius to vary between the cells
 * u_spreading: How far dots are moving around the straight grid
 */

export const dotsOrbitFragmentShader = `#version 300 es
precision mediump float;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform vec4 u_color4;
uniform float u_dotSize;
uniform float u_dotSizeRange;
uniform float u_scale;
uniform float u_spreading;
uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

float random (in vec2 st) {
  return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
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
      vec2 cell_center = .50000001 + u_spreading * sin(time + PI * 2. * rand);
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
  uv *= (.001 * u_scale * u_resolution);
  uv /= u_pixelRatio;
  uv += .5;

  float t = u_time;

  vec3 voronoi = get_voronoi_shape(uv, t) + 1e-4;

  float radius = u_dotSize - u_dotSizeRange * voronoi[2];
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

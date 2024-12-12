export type DotsOrbitUniforms = {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_color4: [number, number, number, number];
  u_scale: number;
  u_dotSize: number;
  u_dotSizeRange: number;
  u_spreading: number;
  u_speed: number;
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
 * u_speed: The speed coefficient for pattern animation
 */

export const dotsOrbitFragmentShader = `
precision mediump float;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform vec4 u_color4;
uniform float u_dotSize;
uniform float u_dotSizeRange;
uniform float u_scale;
uniform float u_spreading;
uniform float u_speed;
uniform float u_time;
uniform float u_ratio;
uniform vec2 u_resolution;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec2 random2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
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
      vec2 cell_center = .5 + u_spreading * sin(time + PI * 2. * rand);
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
  uv += .5;

  float t = u_speed * u_time;

  vec3 voronoi = get_voronoi_shape(uv, t);
  float radius = u_dotSize - u_dotSizeRange * voronoi[2];

  float radius_smoother = .001 + .001 * (u_scale - 1.);
  float shape = 1. - smoothstep(radius, radius + radius_smoother, voronoi[0]);

  float color_randomizer = voronoi[1];
  vec4 color =
    u_color1 * step(0.0, color_randomizer) * step(color_randomizer, 0.25) +
    u_color2 * step(0.25, color_randomizer) * step(color_randomizer, 0.5) +
    u_color3 * step(0.5, color_randomizer) * step(color_randomizer, 0.75) +
    u_color4 * step(0.75, color_randomizer) * step(color_randomizer, 1.0);

  gl_FragColor = color * shape;
}
`;

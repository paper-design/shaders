export type DotsPatternUniforms = {
  u_hue: number;
  u_hueRange: number;
  u_saturation: number;
  u_brightness: number;
  u_scale: number;
  u_dotSize: number;
  u_dotSizeRange: number;
  u_spreading: number;
  u_speed: number;
};

/**
 * Moving Dots Pattern
 * The artwork by Ksenia Kondrashova
 * Renders a dot pattern with dots placed in the center of each cell of Voronoi diagram
 *
 * Uniforms include:
 * u_hue: HSL color => HUE base value
 * u_hueRange: HSL color => HUE range to vary between the dots
 * u_saturation: HSL color => saturation for all the dots
 * u_brightness: HSL color => brightness for all the dots
 * u_scale: The scale applied to pattern
 * u_dotSize: The base dot radius (relative to cell size)
 * u_dotSizeRange: Dot radius to vary between the cells
 * u_spreading: How far dots are moving around the straight grid
 * u_speed: The speed coefficient for pattern animation
 */

export const dotsPatternFragmentShader = `
precision mediump float;

uniform float u_hue;
uniform float u_hueRange;
uniform float u_saturation;
uniform float u_brightness;
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

float hue_to_rgb(float f1, float f2, float hue) {
  if (hue < 0.0)
    hue += 1.0;
  else if (hue > 1.0)
    hue -= 1.0;
  float res;
  if ((6.0 * hue) < 1.0)
    res = f1 + (f2 - f1) * 6.0 * hue;
  else if ((2.0 * hue) < 1.0)
    res = f2;
  else if ((3.0 * hue) < 2.0)
    res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
  else
    res = f1;
  return res;
}
vec3 hsl_to_rgb(float h, float s, float l) {
  vec3 rgb;
  if (s == 0.) {
    rgb = vec3(l);
  } else {
    float f2;
    if (l < .5)
      f2 = l * (1. + s);
    else
      f2 = l + s - s * l;

    float f1 = 2. * l - f2;

    rgb.r = hue_to_rgb(f1, f2, h + (1. / 3.));
    rgb.g = hue_to_rgb(f1, f2, h);
    rgb.b = hue_to_rgb(f1, f2, h - (1. / 3.));
  }
  return rgb;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;

  uv -= .5;
  uv *= u_scale;
  uv += .5;
  uv.x *= ratio;

  float t = u_speed * u_time;

  vec3 voronoi = get_voronoi_shape(uv, t);
  float radius = u_dotSize - u_dotSizeRange * voronoi[2];
  float shape = 1. - smoothstep(radius, radius + .01, voronoi[0]);

  vec3 color = hsl_to_rgb(fract(u_hue + u_hueRange * voronoi[1]), u_saturation, u_brightness);

  gl_FragColor = vec4(color, shape);
}
`;

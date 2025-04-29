import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declarePI, declareRandom, declareRotate, colorBandingFix } from '../shader-utils';

export const warpMeta = {
  maxColorCount: 10,
} as const;

/**
 * 3d Perlin noise with exposed parameters
 *
 * Uniforms include:
 * - u_colors (vec4[]): Input RGBA colors
 * - u_colorsCount (float): Number of active colors (`u_colors` length)
 * - u_proportion (0 .. 1): the proportion between colors (on 0.5 colors are equally distributed)
 * - u_softness (0 .. 1): the color blur (0 for pronounced edges, 1 for gradient)
 * - u_shape (0 ... 2): the color pattern to be distorted with noise & swirl
 *    - u_shape = 0 is checks
 *    - u_shape = 1 is stripes
 *    - u_shape = 2 is 2 halves of canvas (mapping the canvas height regardless of resolution)
 * - u_shapeScale: the scale of color pattern (appies over the global scaling)
 * - u_distortion: the noisy distortion over the UV coordinate (applied before the overlapping swirl)
 * - u_swirl: the power of swirly distortion
 * - u_swirlIterations: the number of swirl iterations (layering curves effect)
 *
 */
export const warpFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_scale;
uniform vec2 u_resolution;

uniform vec4 u_colors[${warpMeta.maxColorCount}];
uniform float u_colorsCount;
uniform float u_proportion;
uniform float u_softness;
uniform float u_shape;
uniform float u_shapeScale;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_swirlIterations;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareRandom}
${declareRotate}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  // Smoothstep for interpolation
  vec2 u = f * f * (3.0 - 2.0 * f);

  // Do the interpolation as two nested mix operations
  // If you try to do this in one big operation, there's enough precision loss to be off by 1px at cell boundaries
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);

}

vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer, float edgesWidth, float edge_blur) {
  vec3 color1 = c1.rgb * c1.a;
  vec3 color2 = c2.rgb * c2.a;
  vec3 color3 = c3.rgb * c3.a;

  float r1 = smoothstep(.0 + .35 * edgesWidth, .7 - .35 * edgesWidth + .5 * edge_blur, mixer);
  float r2 = smoothstep(.3 + .35 * edgesWidth, 1. - .35 * edgesWidth + edge_blur, mixer);

  vec3 blended_color_2 = mix(color1, color2, r1);
  float blended_opacity_2 = mix(c1.a, c2.a, r1);

  vec3 c = mix(blended_color_2, color3, r2);
  float o = mix(blended_opacity_2, c3.a, r2);
  return vec4(c, o);
}

void main() {
  vec2 shape_uv = v_patternUV;
  shape_uv *= .005;

  float t = .5 * u_time;

  float noise_scale = .0005 + .006 * u_scale;

  float n1 = noise(shape_uv * 1. + t);
  float n2 = noise(shape_uv * 2. - t);
  float angle = n1 * TWO_PI;
  shape_uv.x += 4. * u_distortion * n2 * cos(angle);
  shape_uv.y += 4. * u_distortion * n2 * sin(angle);

  float iterations_number = ceil(clamp(u_swirlIterations, 1., 30.));
  for (float i = 1.; i <= iterations_number; i++) {
    shape_uv.x += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.5 * shape_uv.y);
    shape_uv.y += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1. * shape_uv.x);
  }

  float proportion = clamp(u_proportion, 0., 1.);

  float shape = 0.;
  if (u_shape < .5) {
    vec2 checks_shape_uv = shape_uv * (.5 + 3.5 * u_shapeScale);
    shape = .5 + .5 * sin(checks_shape_uv.x) * cos(checks_shape_uv.y);
    shape += .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
  } else if (u_shape < 1.5) {
    vec2 stripes_shape_uv = shape_uv * (.25 + 3. * u_shapeScale);
    float f = fract(stripes_shape_uv.y);
    shape = smoothstep(.0, .55, f) * smoothstep(1., .45, f);
    shape += .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
  } else {
    float sh = 1. - shape_uv.y;
    sh -= .5;
    sh /= (noise_scale * u_resolution.y);
    sh += .5;
    float shape_scaling = .2 * (1. - u_shapeScale);
    shape = smoothstep(.45 - shape_scaling, .55 + shape_scaling, sh + .3 * (proportion - .5));
  }

  float mixer = shape * (u_colorsCount - 1.);
  mixer = (shape - .5 / u_colorsCount) * u_colorsCount;
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${warpMeta.maxColorCount}; i++) {
      if (i >= int(u_colorsCount)) break;
      float localT = clamp(mixer - float(i - 1), 0.0, 1.0);
      vec4 c = u_colors[i];
      c.rgb *= c.a;
      gradient = mix(gradient, c, localT);
  }

  vec3 color = gradient.rgb;
  float opacity = gradient.a;

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface WarpUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_proportion: number;
  u_softness: number;
  u_shape: (typeof WarpPatterns)[WarpPattern];
  u_shapeScale: number;
  u_distortion: number;
  u_swirl: number;
  u_swirlIterations: number;
}

export interface WarpParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  rotation?: number;
  proportion?: number;
  softness?: number;
  shape?: WarpPattern;
  shapeScale?: number;
  distortion?: number;
  swirl?: number;
  swirlIterations?: number;
}

export const WarpPatterns = {
  checks: 0,
  stripes: 1,
  edge: 2,
} as const;

export type WarpPattern = keyof typeof WarpPatterns;

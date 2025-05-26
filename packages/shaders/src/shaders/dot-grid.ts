import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, declareSimplexNoise } from '../shader-utils.js';

/**
 * Dot Grid Pattern
 * (the size parameters are set in pixels)
 *
 * Uniforms include:
 * u_colorBack - the background color
 * u_colorFill - the fill color
 * u_colorStroke - the stroke color
 * u_dotSize (px) - the base dot radius
 * u_strokeWidth (px) - the stroke (to be subtracted from u_dotSize)
 * u_gapX (px) - horizontal grid spacing
 * u_gapY (px) - vertical grid spacing
 * u_sizeRange (0 .. 1) - variety of dot size
 * u_opacityRange(0 .. 1) - variety of dot opacity to be applied equally to fill and stroke
 * u_shape - shape code (0 - circle, 1 - diamond, 2 - square, 3 - triangle)
 */
export const dotGridFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec4 u_colorBack;
uniform vec4 u_colorFill;
uniform vec4 u_colorStroke;
uniform float u_dotSize;
uniform float u_gapX;
uniform float u_gapY;
uniform float u_strokeWidth;
uniform float u_sizeRange;
uniform float u_opacityRange;
uniform float u_shape;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareSimplexNoise}

float polygon(vec2 p, float N, float rot) {
  float a = atan(p.x, p.y) + rot;
  float r = TWO_PI / float(N);

  return cos(floor(.5 + a / r) * r - a) * length(p);
}

void main() {

  vec2 shape_uv = v_patternUV;
  shape_uv += .5;

  vec2 grid = fract(shape_uv / vec2(u_gapX, u_gapY)) + 1e-4;
  vec2 grid_idx = floor(shape_uv / vec2(u_gapX, u_gapY));
  float sizeRandomizer = .5 + .8 * snoise(2. * vec2(grid_idx.x * 100., grid_idx.y));
  float opacity_randomizer = .5 + .7 * snoise(2. * vec2(grid_idx.y, grid_idx.x));

  vec2 center = vec2(0.5) - 1e-3;
  vec2 p = (grid - center) * vec2(u_gapX, u_gapY);

  float baseSize = u_dotSize * (1. - sizeRandomizer * u_sizeRange);
  float strokeWidth = u_strokeWidth * (1. - sizeRandomizer * u_sizeRange);

  float dist;
  if (u_shape < 0.5) {
    // Circle
    dist = length(p);
  } else if (u_shape < 1.5) {
    // Diamond
    strokeWidth *= 1.5;
    dist = polygon(1.5 * p, 4., .25 * PI);
  } else if (u_shape < 2.5) {
    // Square
    dist = polygon(1.03 * p, 4., 1e-3);
  } else {
    // Triangle
    strokeWidth *= 1.5;
    p = p * 2. - 1.;
    p *= .9;
    p.y -= .75 * baseSize;
    dist = polygon(p, 3., 1e-3);
  }

  float edgeWidth = fwidth(dist);
  float shapeOuter = smoothstep(baseSize + edgeWidth, baseSize - edgeWidth, dist - strokeWidth);
  float shapeInner = smoothstep(baseSize + edgeWidth, baseSize - edgeWidth, dist);
  float stroke = shapeOuter - shapeInner;

  float dotOpacity = max(0., 1. - opacity_randomizer * u_opacityRange);
  stroke *= dotOpacity;
  shapeInner *= dotOpacity;

  stroke *= u_colorStroke.a;
  shapeInner *= u_colorFill.a;

  vec3 color = vec3(0.);
  color += stroke * u_colorStroke.rgb;
  color += shapeInner * u_colorFill.rgb;
  color += (1. - shapeInner - stroke) * u_colorBack.rgb * u_colorBack.a;

  float opacity = 0.;
  opacity += stroke;
  opacity += shapeInner;
  opacity += (1. - opacity) * u_colorBack.a;

  fragColor = vec4(color, opacity);
}
`;

export interface DotGridUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colorFill: [number, number, number, number];
  u_colorStroke: [number, number, number, number];
  u_dotSize: number;
  u_gapX: number;
  u_gapY: number;
  u_strokeWidth: number;
  u_sizeRange: number;
  u_opacityRange: number;
  u_shape: (typeof DotGridShapes)[DotGridShape];
}

export interface DotGridParams extends ShaderSizingParams {
  colorBack?: string;
  colorFill?: string;
  colorStroke?: string;
  size?: number;
  gapX?: number;
  gapY?: number;
  strokeWidth?: number;
  sizeRange?: number;
  opacityRange?: number;
  shape?: DotGridShape;
}

export const DotGridShapes = {
  circle: 0,
  diamond: 1,
  square: 2,
  triangle: 3,
} as const;

export type DotGridShape = keyof typeof DotGridShapes;

import {
  sizingUniformsDeclaration,
  sizingPatternUV,
  worldBoxTestStroke,
  worldOriginTestPoint,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
import { declarePI, declareSimplexNoise } from '../shader-utils';

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
 * u_gridSpacingX (px) - horizontal grid spacing
 * u_gridSpacingY (px) - xertical grid spacing
 * u_sizeRange (0 .. 1) - variety of dot size
 * u_opacityRange(0 .. 1) - variety of dot opacity to be applied equally to fill and stroke
 * u_shape - shape code (0 - circle, 1 - diamond, 2 - square, 3 - triangle)
 */
export const dotGridFragmentShader: string = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;

${sizingUniformsDeclaration}

uniform vec4 u_colorBack;
uniform vec4 u_colorFill;
uniform vec4 u_colorStroke;
uniform float u_dotSize;
uniform float u_gridSpacingX;
uniform float u_gridSpacingY;
uniform float u_strokeWidth;
uniform float u_sizeRange;
uniform float u_opacityRange;
uniform float u_shape;

out vec4 fragColor;

${declarePI}
${declareSimplexNoise}

float polygon(vec2 p, float N, float rot) {
  float a = atan(p.x, p.y) + rot;
  float r = TWO_PI / float(N);

  return cos(floor(.5 + a / r) * r - a) * length(p);
}

void main() {
  ${sizingPatternUV}

  uv += .5;

  vec2 grid = fract(uv / vec2(u_gridSpacingX, u_gridSpacingY)) + 1e-4;
  vec2 grid_idx = floor(uv / vec2(u_gridSpacingX, u_gridSpacingY));
  float sizeRandomizer = .5 + .8 * snoise(2. * vec2(grid_idx.x * 100., grid_idx.y));
  float opacity_randomizer = .5 + .7 * snoise(2. * vec2(grid_idx.y, grid_idx.x));

  vec2 center = vec2(0.5) - 1e-3;
  vec2 p = (grid - center) * vec2(u_gridSpacingX, u_gridSpacingY);

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
  float shapeOuter = smoothstep(baseSize + edgeWidth + strokeWidth, baseSize - edgeWidth + strokeWidth, dist);
  float shapeInner = smoothstep(baseSize + edgeWidth, baseSize - edgeWidth, dist);
  float stroke = clamp(shapeOuter - shapeInner, 0., 1.);

  float dot_opacity = max(0., 1. - opacity_randomizer * u_opacityRange);

  vec3 color = u_colorBack.rgb * u_colorBack.a;
  color = mix(color, u_colorFill.rgb, u_colorFill.a * dot_opacity * shapeInner);
  color = mix(color, u_colorStroke.rgb, u_colorStroke.a * dot_opacity * stroke);

  float opacity = u_colorBack.a;
  opacity += u_colorFill.a * shapeInner * dot_opacity;
  opacity += u_colorStroke.a * stroke * dot_opacity;

  ${worldBoxTestStroke}
  ${worldOriginTestPoint}
    
  color.r += worldBoxTestStroke;
  color.g += worldOriginTestPoint;
  color.b += worldOriginPoint;

  fragColor = vec4(color, opacity);
}
`;

export interface DotGridUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colorFill: [number, number, number, number];
  u_colorStroke: [number, number, number, number];
  u_dotSize: number;
  u_gridSpacingX: number;
  u_gridSpacingY: number;
  u_strokeWidth: number;
  u_sizeRange: number;
  u_opacityRange: number;
  u_shape: (typeof DotGridShapes)[DotGridShape];
}

export interface DotGridParams extends ShaderSizingParams {
  colorBack?: string;
  colorFill?: string;
  colorStroke?: string;
  dotSize?: number;
  gridSpacingX?: number;
  gridSpacingY?: number;
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

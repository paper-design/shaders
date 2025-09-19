import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, simplexNoise } from '../shader-utils.js';

/**
 * Static line pattern
 *
 * Uniforms:
 * - u_colorBack, u_colorFill, u_colorStroke (vec4 RGBA)
 * - u_size (px): base line thickness
 * - u_sizeRange (0..1): randomizes the thickness of lines between 0 and u_size
 * - u_strokeWidth (px): the stroke (to be added to u_size)
 * - u_gapX, u_gapY (px): pattern spacing
 * - u_opacityRange (0..1): variety of line opacity
 * - u_shape (float used as integer):
 *   ---- 0: horizontal line
 *   ---- 1: vertical line
 *   ---- 2: diagonal line (/)
 *   ---- 3: diagonal line (\)
 *   ---- 4: cross lines (+)
 *
 */

// language=GLSL
export const lineGridFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec4 u_colorBack;
uniform vec4 u_colorFill;
uniform vec4 u_colorStroke;
uniform float u_size;
uniform float u_gapX;
uniform float u_gapY;
uniform float u_strokeWidth;
uniform float u_sizeRange;
uniform float u_opacityRange;
uniform float u_shape;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${simplexNoise}

float lineDistance(vec2 p, float lineType) {
  float dist = 1e10; // Large initial value
  
  if (lineType < 0.5) {
    // Horizontal line
    dist = abs(p.y);
  } else if (lineType < 1.5) {
    // Vertical line
    dist = abs(p.x);
  } else if (lineType < 2.5) {
    // Diagonal line (/)
    dist = abs(p.x + p.y) / sqrt(2.0);
  } else if (lineType < 3.5) {
    // Diagonal line (\)
    dist = abs(p.x - p.y) / sqrt(2.0);
  } else {
    // Cross lines (+)
    float horizontal = abs(p.y);
    float vertical = abs(p.x);
    dist = min(horizontal, vertical);
  }
  
  return dist;
}

void main() {

  // x100 is a default multiplier between vertex and fragment shaders
  // we use it to avoid UV precision issues
  vec2 shape_uv = 100. * v_patternUV;

  vec2 grid = fract(shape_uv / vec2(u_gapX, u_gapY)) + 1e-4;
  vec2 grid_idx = floor(shape_uv / vec2(u_gapX, u_gapY));
  float sizeRandomizer = .5 + .8 * snoise(2. * vec2(grid_idx.x * 100., grid_idx.y));
  float opacity_randomizer = .5 + .7 * snoise(2. * vec2(grid_idx.y, grid_idx.x));

  vec2 center = vec2(0.5) - 1e-3;
  vec2 p = (grid - center) * vec2(u_gapX, u_gapY);
 
  float sizeFactor = clamp(1.0 - sizeRandomizer * u_sizeRange, 0.0, 1.5); 
  float halfSize   = u_size * 0.5 * sizeFactor;   
  float halfStroke = u_strokeWidth * 0.5 * sizeFactor;

  float dist = lineDistance(p, u_shape);

  // stable anti-alias width (avoid 0)
  float edgeWidth = max(fwidth(dist), 1.0e-3);

  // fill mask: 1 inside the line, 0 outside (AA)
  float fillMask = 1.0 - smoothstep(halfSize - edgeWidth, halfSize + edgeWidth, dist);

  // outer mask for stroke (line+stroke area)
  float outerMask = 1.0 - smoothstep(halfSize + halfStroke - edgeWidth, halfSize + halfStroke + edgeWidth, dist);

  // stroke is the ring between outerMask and fillMask
  float stroke = outerMask - fillMask;

  // opacity randomizer & alpha application (keeps your original behaviour)
  float lineOpacity = max(0.0, 1.0 - opacity_randomizer * u_opacityRange);
  stroke *= lineOpacity;
  fillMask *= lineOpacity;

  // premultiply by input alpha channels
  stroke *= u_colorStroke.a;
  fillMask *= u_colorFill.a;

  vec3 color = vec3(0.0);
  color += stroke * u_colorStroke.rgb;
  color += fillMask * u_colorFill.rgb;
  color += (1.0 - fillMask - stroke) * u_colorBack.rgb * u_colorBack.a;

  float opacity = 0.0;
  opacity += stroke;
  opacity += fillMask;
  opacity += (1.0 - opacity) * u_colorBack.a;

  fragColor = vec4(color, opacity);
}
`;

export interface LineGridUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colorFill: [number, number, number, number];
  u_colorStroke: [number, number, number, number];
  u_size: number;  
  u_gapX: number;
  u_gapY: number;
  u_strokeWidth: number;
  u_sizeRange: number;
  u_opacityRange: number;
  u_shape: (typeof LineGridShapes)[LineGridShape];
}

export interface LineGridParams extends ShaderSizingParams {
  colorBack?: string;
  colorFill?: string;
  colorStroke?: string;
  size?: number;  
  gapX?: number;
  gapY?: number;
  strokeWidth?: number;
  sizeRange?: number;
  opacityRange?: number;
  shape?: LineGridShape;
}

export const LineGridShapes = {
  horizontal: 0,
  vertical: 1,
  diagonalForward: 2,  // /
  diagonalBack: 3,     // \
  cross: 4,            // +
} as const;

export type LineGridShape = keyof typeof LineGridShapes;
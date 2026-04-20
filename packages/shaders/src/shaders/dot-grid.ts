import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, glslMod, simplexNoise } from '../shader-utils.js';

/**
 * Static grid pattern made of circles, diamonds, squares or triangles.
 *
 * Fragment shader uniforms:
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colorFill (vec4): Shape fill color in RGBA
 * - u_colorStroke (vec4): Shape stroke color in RGBA
 * - u_dotSize (float): Base size of each shape in pixels (1 to 100)
 * - u_gapX (float): Pattern horizontal spacing in pixels (2 to 500)
 * - u_gapY (float): Pattern vertical spacing in pixels (2 to 500)
 * - u_strokeWidth (float): Outline stroke width in pixels (0 to 50)
 * - u_sizeRange (float): Random variation in shape size, 0 = uniform, higher = random up to base size (0 to 1)
 * - u_opacityRange (float): Random variation in shape opacity, 0 = opaque, higher = semi-transparent (0 to 1)
 * - u_shape (float): Shape type (0 = circle, 1 = diamond, 2 = square, 3 = triangle)
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_patternUV (vec2): UV coordinates in pixels (scaled by 0.01 for precision), with scale, rotation and offset applied
 *
 * Vertex shader uniforms:
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_originX (float): Reference point for positioning world width in the canvas (0 to 1)
 * - u_originY (float): Reference point for positioning world height in the canvas (0 to 1)
 * - u_worldWidth (float): Virtual width of the graphic before it's scaled to fit the canvas
 * - u_worldHeight (float): Virtual height of the graphic before it's scaled to fit the canvas
 * - u_fit (float): How to fit the rendered shader into the canvas dimensions (0 = none, 1 = contain, 2 = cover)
 * - u_scale (float): Overall zoom level of the graphics (0.01 to 4)
 * - u_rotation (float): Overall rotation angle of the graphics in degrees (0 to 360)
 * - u_offsetX (float): Horizontal offset of the graphics center (-1 to 1)
 * - u_offsetY (float): Vertical offset of the graphics center (-1 to 1)
 *
 */

export const dotGridFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_dotSize: f32,
  u_gapX: f32,
  u_gapY: f32,
  u_strokeWidth: f32,
  u_sizeRange: f32,
  u_opacityRange: f32,
  u_shape: f32,
  u_colorBack: vec4f,
  u_colorFill: vec4f,
  u_colorStroke: vec4f,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

${ declarePI }
${ glslMod }
${ simplexNoise }

fn polygon(p: vec2f, N: f32, rot: f32) -> f32 {
  let a = atan2(p.x, p.y) + rot;
  let r = TWO_PI / N;

  return cos(floor(0.5 + a / r) * r - a) * length(p);
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {

  // x100 is a default multiplier between vertex and fragment shaders
  // we use it to avoid UV precision issues
  let shape_uv = 100.0 * input.v_patternUV;

  let gap = max(abs(vec2f(u.u_gapX, u.u_gapY)), vec2f(1e-6));
  let grid = fract(shape_uv / gap) + vec2f(1e-4);
  let grid_idx = floor(shape_uv / gap);
  let sizeRandomizer = 0.5 + 0.8 * snoise(2.0 * vec2f(grid_idx.x * 100.0, grid_idx.y));
  let opacity_randomizer = 0.5 + 0.7 * snoise(2.0 * vec2f(grid_idx.y, grid_idx.x));

  let center = vec2f(0.5) - vec2f(1e-3);
  var p = (grid - center) * vec2f(u.u_gapX, u.u_gapY);

  let baseSize = u.u_dotSize * (1.0 - sizeRandomizer * u.u_sizeRange);
  var strokeWidth = u.u_strokeWidth * (1.0 - sizeRandomizer * u.u_sizeRange);

  var dist: f32;
  if (u.u_shape < 0.5) {
    // Circle
    dist = length(p);
  } else if (u.u_shape < 1.5) {
    // Diamond
    strokeWidth *= 1.5;
    dist = polygon(1.5 * p, 4.0, 0.25 * PI);
  } else if (u.u_shape < 2.5) {
    // Square
    dist = polygon(1.03 * p, 4.0, 1e-3);
  } else {
    // Triangle
    strokeWidth *= 1.5;
    p = p * 2.0 - vec2f(1.0);
    p *= 0.9;
    p.y = 1.0 - p.y;
    p.y -= 0.75 * baseSize;
    dist = polygon(p, 3.0, 1e-3);
  }

  let edgeWidth = fwidth(dist);
  let shapeOuter = 1.0 - smoothstep(baseSize - edgeWidth, baseSize + edgeWidth, dist - strokeWidth);
  var shapeInner = 1.0 - smoothstep(baseSize - edgeWidth, baseSize + edgeWidth, dist);
  var stroke = shapeOuter - shapeInner;

  let dotOpacity = max(0.0, 1.0 - opacity_randomizer * u.u_opacityRange);
  stroke *= dotOpacity;
  shapeInner *= dotOpacity;

  stroke *= u.u_colorStroke.a;
  shapeInner *= u.u_colorFill.a;

  var color = vec3f(0.0);
  color += stroke * u.u_colorStroke.rgb;
  color += shapeInner * u.u_colorFill.rgb;
  color += (1.0 - shapeInner - stroke) * u.u_colorBack.rgb * u.u_colorBack.a;

  var opacity: f32 = 0.0;
  opacity += stroke;
  opacity += shapeInner;
  opacity += (1.0 - opacity) * u.u_colorBack.a;

  return vec4f(color, opacity);
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

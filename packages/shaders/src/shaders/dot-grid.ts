import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2, simplexNoise } from '../shader-utils.js';

/**
 * Static grid pattern made of circles, diamonds, squares, triangles, stars, asterisks, lines, rects, crosses or plus signs.
 *
 * Fragment shader uniforms:
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colorFill (vec4): Shape fill color in RGBA
 * - u_colorStroke (vec4): Shape stroke color in RGBA
 * - u_dotSize (float): Base size of each shape (0 to 1, relative to smaller cell side)
 * - u_gapX (float): Pattern horizontal spacing in pixels (2 to 500)
 * - u_gapY (float): Pattern vertical spacing in pixels (2 to 500)
 * - u_strokeWidth (float): Outline stroke width in pixels (0 to 50)
 * - u_sizeRange (float): Random variation in shape size, 0 = uniform, higher = random up to base size (0 to 1)
 * - u_opacityRange (float): Random variation in shape opacity, 0 = opaque, higher = semi-transparent (0 to 1)
 * - u_shape (float): Shape type (0 = circle, 1 = diamond, 2 = square, 3 = triangle, 4 = star, 5 = asterisk, 6 = line, 7 = rect, 8 = cross, 9 = plus)
 * - u_angle (float): Rotation of shape within each cell in degrees (0 to 360)
 * - u_angleRange (float): Random variation in cell angle, 0 = uniform, higher = more random rotation (0 to 1)
 * - u_shiftX (float): Horizontal offset of the pattern (-1 to 1, relative to gapX)
 * - u_shiftY (float): Vertical offset of the pattern (-1 to 1, relative to gapY)
 * - u_rowShift (float): Horizontal shift for every 2nd row, brick pattern (0 to 1, relative to gapX)
 * - u_rowShiftRange (float): Randomize row shift, 0 = only 2nd row shifts, 1 = all rows shift randomly (0 to 1)
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

// language=GLSL
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
uniform float u_angle;
uniform float u_angleRange;
uniform float u_shiftX;
uniform float u_shiftY;
uniform float u_rowShift;
uniform float u_rowShiftRange;

in vec2 v_patternUV;

out vec4 fragColor;

${ declarePI }
${ rotation2 }
${ simplexNoise }

float polygon(vec2 p, float N, float rot) {
  float a = atan(p.x, p.y) + rot;
  float r = TWO_PI / float(N);

  return cos(floor(.5 + a / r) * r - a) * length(p);
}

float sdStar5(vec2 p, float r, float rf) {
  const vec2 k1 = vec2(0.809016994375, -0.587785252292);
  const vec2 k2 = vec2(-k1.x, k1.y);
  p.x = abs(p.x);
  p -= 2. * max(dot(k1, p), 0.) * k1;
  p -= 2. * max(dot(k2, p), 0.) * k2;
  p.x = abs(p.x);
  p.y -= r;
  vec2 ba = rf * vec2(-k1.y, k1.x) - vec2(0, 1);
  float h = clamp(dot(p, ba) / dot(ba, ba), 0., r);
  return length(p - ba * h) * sign(p.y * ba.x - p.x * ba.y);
}

float asterisk6(vec2 p, float size, float armCoeff) {
  float line1 = abs(p.y);
  vec2 p60 = rotate(p, -PI / 3.);
  float line2 = abs(p60.y);
  vec2 p120 = rotate(p, -2. * PI / 3.);
  float line3 = abs(p120.y);
  float armDist = min(min(line1, line2), line3);
  return max(armDist / armCoeff, length(p) / size) * size;
}

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

void main() {

  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  vec2 gap = max(abs(vec2(u_gapX, u_gapY)), vec2(1e-6));

  // Shifts are relative to gaps (0-1 range means 0-100% of gap)
  vec2 shapeUV = 100. * v_patternUV + vec2(-u_shiftX * gap.x, u_shiftY * gap.y);
  if (u_shape > 3.) {
    shapeUV -= 1e-4;
  }

  // Row shift: every 2nd row shifts by rowShift, randomized by rowShiftRange
  // rowShift is relative to gapX (0-1 range)
  float rowIndex = floor(shapeUV.y / gap.y);
  float rowShiftRandomizer = hash(rowIndex * 73.129);
  float rowShiftAmount = u_rowShift * gap.x * mix(mod(rowIndex, 2.), 3. * rowShiftRandomizer, u_rowShiftRange);
  shapeUV.x += rowShiftAmount;

  vec2 gridF = fract(shapeUV / gap) + 1e-4;
  vec2 gridI = floor(shapeUV / gap);
  float sizeRandomizer = .5 + .8 * snoise(2. * vec2(gridI.x * 100., gridI.y));
  float opacityRandomizer = .5 + .7 * snoise(2. * vec2(gridI.y, gridI.x));
  float angleRandomizer = hash(gridI.x * 37.197 + gridI.y * 91.853) * 2. - 1.;

  vec2 center = vec2(0.5) - 1e-3;
  vec2 p = (gridF - center) * vec2(u_gapX, u_gapY);

  // Size is relative to smaller cell side (0-1 range means 0-100% of min gap)
  float minGap = min(gap.x, gap.y);
  float baseSize = u_dotSize * minGap * (1. - sizeRandomizer * u_sizeRange);
  float strokeWidth = u_strokeWidth * (1. - sizeRandomizer * u_sizeRange);

  float cellAngleRad = u_angle * PI / 180. + angleRandomizer * u_angleRange * PI;

  float dist;
  float edgeW = fwidth(shapeUV.y);

  if (u_shape != 3.) {
    p = rotate(p, cellAngleRad);
  }
  baseSize *= .5;
  if (u_shape < 0.5) {
    // Circle (0)
    dist = length(p);
  } else if (u_shape < 1.5) {
    // Diamond (1)
    baseSize *= .7071;
    dist = polygon(p, 4., .25 * PI);
  } else if (u_shape < 2.5) {
    // Square (2)
    baseSize *= .7071;
    dist = polygon(p, 4., 0.);
  } else if (u_shape < 3.5) {
    // Triangle (3)
    baseSize *= .5;
    dist = polygon(p, 3., - .333333333333 * PI - cellAngleRad);
  } else if (u_shape < 4.5) {
    // Star (4) - compute outer star for non-rounded stroke
    float innerSDF = sdStar5(p, baseSize, .5);
    float scale = (baseSize + strokeWidth * 2.) / baseSize;
    float outerSDF = sdStar5(p / scale, baseSize, .5) * scale;
    float strokeInner = 1. - smoothstep(-edgeW, edgeW, innerSDF);
    float starOuter = 1. - smoothstep(-edgeW, edgeW, outerSDF);
    float stroke = starOuter - strokeInner;

    float shapeOpacity = max(0., 1. - opacityRandomizer * u_opacityRange);
    stroke *= shapeOpacity;
    strokeInner *= shapeOpacity;
    stroke *= u_colorStroke.a;
    strokeInner *= u_colorFill.a;

    vec3 color = vec3(0.);
    color += stroke * u_colorStroke.rgb;
    color += strokeInner * u_colorFill.rgb;
    color += (1. - strokeInner - stroke) * u_colorBack.rgb * u_colorBack.a;

    float opacity = stroke + strokeInner + (1. - stroke - strokeInner) * u_colorBack.a;
    fragColor = vec4(color, opacity);
    return;
  } else if (u_shape < 5.5) {
    // Asterisk (5) - expand both size and arm width for consistent stroke
    float armCoeff = baseSize * .15;
    float innerSDF = asterisk6(p, baseSize, armCoeff) - baseSize;
    float outerSDF = asterisk6(p, baseSize + strokeWidth, armCoeff + strokeWidth) - (baseSize + strokeWidth);
    float strokeInner = 1. - smoothstep(-edgeW, edgeW, innerSDF);
    float astOuter = 1. - smoothstep(-edgeW, edgeW, outerSDF);
    float stroke = astOuter - strokeInner;

    float shapeOpacity = max(0., 1. - opacityRandomizer * u_opacityRange);
    stroke *= shapeOpacity;
    strokeInner *= shapeOpacity;
    stroke *= u_colorStroke.a;
    strokeInner *= u_colorFill.a;

    vec3 color = vec3(0.);
    color += stroke * u_colorStroke.rgb;
    color += strokeInner * u_colorFill.rgb;
    color += (1. - strokeInner - stroke) * u_colorBack.rgb * u_colorBack.a;

    float opacity = stroke + strokeInner + (1. - stroke - strokeInner) * u_colorBack.a;
    fragColor = vec4(color, opacity);
    return;
  } else if (u_shape < 6.5) {
    // Line (6)
    dist = abs(p.y);
  } else if (u_shape < 7.5) {
    // Rect (7)
    float maxH = min(u_gapX / 6., u_gapY / 6.);
    baseSize = min(baseSize, maxH);
    float margin = baseSize;
    float maxWfromX = (u_gapX * .5 - margin - baseSize);
    float maxWfromY = (u_gapY * .5 - margin - baseSize);
    float halfWidth = max(baseSize, min(maxWfromX, maxWfromY));
    dist = max(abs(p.y), max(0., abs(p.x) - halfWidth));
  } else if (u_shape < 8.5) {
    // Cross (8)
    dist = min(abs(p.x), abs(p.y));
  } else {
    // Plus (9)
    float maxH = min(u_gapX / 6., u_gapY / 6.);
    baseSize = min(baseSize, maxH);
    float margin = baseSize;
    float maxLfromX = (u_gapX * .5 - margin - baseSize);
    float maxLfromY = (u_gapY * .5 - margin - baseSize);
    float armLength = max(baseSize, min(maxLfromX, maxLfromY));
    float crossDist = min(abs(p.x), abs(p.y));
    float armCrop = max(0., max(abs(p.x), abs(p.y)) - armLength);
    dist = max(crossDist, armCrop);
  }

  float shapeOuter = 1. - smoothstep(baseSize - edgeW, baseSize + edgeW, dist - strokeWidth);
  float shapeInner = 1. - smoothstep(baseSize - edgeW, baseSize + edgeW, dist);
  float stroke = shapeOuter - shapeInner;

  float shapeOpacity = max(0., 1. - opacityRandomizer * u_opacityRange);
  stroke *= shapeOpacity;
  shapeInner *= shapeOpacity;
  stroke *= u_colorStroke.a;
  shapeInner *= u_colorFill.a;

  vec3 color = vec3(0.);
  color += stroke * u_colorStroke.rgb;
  color += shapeInner * u_colorFill.rgb;
  color += (1. - shapeInner - stroke) * u_colorBack.rgb * u_colorBack.a;

  float opacity = stroke + shapeInner;
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
  u_angle: number;
  u_angleRange: number;
  u_shiftX: number;
  u_shiftY: number;
  u_rowShift: number;
  u_rowShiftRange: number;
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
  angle?: number;
  angleRange?: number;
  shiftX?: number;
  shiftY?: number;
  rowShift?: number;
  rowShiftRange?: number;
}

export const DotGridShapes = {
  circle: 0,
  diamond: 1,
  square: 2,
  triangle: 3,
  star: 4,
  asterisk: 5,
  line: 6,
  rect: 7,
  cross: 8,
  plus: 9,
} as const;

export type DotGridShape = keyof typeof DotGridShapes;

import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2, simplexNoise } from '../shader-utils.js';

/**
 * Static gridF pattern made of circles, diamonds, squares, triangles, lines, crosses, stars, asterisks, rects or plus signs.
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
 * - u_shape (float): Shape type (0 = circle, 1 = diamond, 2 = square, 3 = triangle, 4 = line, 5 = cross, 6 = star, 7 = asterisk, 8 = rect, 9 = plus)
 * - u_angle (float): Rotation of shape within each cell in degrees (0 to 360)
 * - u_angleRange (float): Random variation in cell angle, 0 = uniform, higher = more random rotation (0 to 1)
 * - u_shiftX (float): Horizontal offset of the pattern in pixels
 * - u_shiftY (float): Vertical offset of the pattern in pixels
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

void main() {

  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  vec2 shapeUV = 100. * v_patternUV + vec2(-u_shiftX, u_shiftY);
  if (u_shape > 3.) {
    shapeUV -= 1e-4;
  }

  vec2 gap = max(abs(vec2(u_gapX, u_gapY)), vec2(1e-6));
  vec2 gridF = fract(shapeUV / gap) + 1e-4;
  vec2 gridI = floor(shapeUV / gap);
  float sizeRandomizer = .5 + .8 * snoise(2. * vec2(gridI.x * 100., gridI.y));
  float opacityRandomizer = .5 + .7 * snoise(2. * vec2(gridI.y, gridI.x));
  float angleRandomizer = snoise(3. * vec2(gridI.x, gridI.y * 100.));

  vec2 center = vec2(0.5) - 1e-3;
  vec2 p = (gridF - center) * vec2(u_gapX, u_gapY);

  float baseSize = u_dotSize * (1. - sizeRandomizer * u_sizeRange);
  float strokeWidth = u_strokeWidth * (1. - sizeRandomizer * u_sizeRange);

  float cellAngleRad = u_angle * PI / 180. + angleRandomizer * u_angleRange * PI;

  float dist;
  vec2 pUnrotated = p;
  if (u_shape != 3.) {
    p = rotate(p, cellAngleRad);
  }
  baseSize *= .5;
  if (u_shape < 0.5) {
    // Circle
    dist = length(p);
  } else if (u_shape < 1.5) {
    // Diamond
    baseSize *= .7071;
    dist = polygon(p, 4., .25 * PI);
  } else if (u_shape < 2.5) {
    // Square
    dist = polygon(p, 4., 0.);
  } else if (u_shape < 3.5) {
    // Triangle
    baseSize *= .57735;
    p.y += baseSize * .75;
    dist = polygon(p, 3., - .333333333333 * PI - cellAngleRad);
  } else if (u_shape < 4.5) {
    // Line
    dist = abs(p.y);
  } else if (u_shape < 5.5) {
    // Cross
    dist = min(abs(p.x), abs(p.y));
  } else if (u_shape < 6.5) {
    // Star (5-pointed filled) - compute outer star for non-rounded stroke
    // strokeWidth * 2 compensates for thinner stroke at valleys due to uniform scaling
    float innerSDF = sdStar5(p, baseSize, .5);
    float scale = (baseSize + strokeWidth * 2.) / baseSize;
    float outerSDF = sdStar5(p / scale, baseSize, .5) * scale;
    float edgeW = fwidth(shapeUV.y);
    float starInner = 1. - smoothstep(-edgeW, edgeW, innerSDF);
    float starOuter = 1. - smoothstep(-edgeW, edgeW, outerSDF);
    float starStroke = starOuter - starInner;

    float starOpacity = max(0., 1. - opacityRandomizer * u_opacityRange);
    starStroke *= starOpacity;
    starInner *= starOpacity;
    starStroke *= u_colorStroke.a;
    starInner *= u_colorFill.a;

    vec3 starColor = vec3(0.);
    starColor += starStroke * u_colorStroke.rgb;
    starColor += starInner * u_colorFill.rgb;
    starColor += (1. - starInner - starStroke) * u_colorBack.rgb * u_colorBack.a;

    float starOpacityFinal = starStroke + starInner + (1. - starStroke - starInner) * u_colorBack.a;
    fragColor = vec4(starColor, starOpacityFinal);
    return;
  } else if (u_shape < 7.5) {
    // Asterisk (6 rectangular arms) - expand both size and arm width for consistent stroke
    float armCoeff = baseSize * .15;
    float innerSDF = asterisk6(p, baseSize, armCoeff) - baseSize;
    float outerSDF = asterisk6(p, baseSize + strokeWidth, armCoeff + strokeWidth) - (baseSize + strokeWidth);

    float edgeW = fwidth(shapeUV.y);
    float astInner = 1. - smoothstep(-edgeW, edgeW, innerSDF);
    float astOuter = 1. - smoothstep(-edgeW, edgeW, outerSDF);
    float astStroke = astOuter - astInner;

    float astOpacity = max(0., 1. - opacityRandomizer * u_opacityRange);
    astStroke *= astOpacity;
    astInner *= astOpacity;
    astStroke *= u_colorStroke.a;
    astInner *= u_colorFill.a;

    vec3 astColor = vec3(0.);
    astColor += astStroke * u_colorStroke.rgb;
    astColor += astInner * u_colorFill.rgb;
    astColor += (1. - astInner - astStroke) * u_colorBack.rgb * u_colorBack.a;

    float astOpacityFinal = astStroke + astInner + (1. - astStroke - astInner) * u_colorBack.a;
    fragColor = vec4(astColor, astOpacityFinal);
    return;
  } else if (u_shape < 8.5) {
    float eps = 1.;
    float c = abs(cos(cellAngleRad));
    float s = abs(sin(cellAngleRad));
    float margin = baseSize;
    float maxWfromX = (u_gapX * .5 - margin - baseSize * s) / max(c, eps);
    float maxWfromY = (u_gapY * .5 - margin - baseSize * c) / max(s, eps);
    float halfWidth = max(baseSize, min(maxWfromX, maxWfromY));
    dist = max(abs(p.y), max(0., abs(p.x) - halfWidth));
  } else {
    float eps = 1.;
    float c = abs(cos(cellAngleRad));
    float s = abs(sin(cellAngleRad));
    float margin = baseSize;
    float maxLfromX = (u_gapX * .5 - margin - baseSize * s) / max(c, eps);
    float maxLfromY = (u_gapY * .5 - margin - baseSize * c) / max(s, eps);
    float armLength = max(baseSize, min(maxLfromX, maxLfromY));
    float crossDist = min(abs(p.x), abs(p.y));
    float armCrop = max(0., max(abs(p.x), abs(p.y)) - armLength);
    dist = max(crossDist, armCrop);
  }

  float edgeWidth = fwidth(shapeUV.y);
  float shapeOuter = 1. - smoothstep(baseSize - edgeWidth, baseSize + edgeWidth, dist - strokeWidth);
  float shapeInner = 1. - smoothstep(baseSize - edgeWidth, baseSize + edgeWidth, dist);
  float stroke = shapeOuter - shapeInner;

  float dotOpacity = max(0., 1. - opacityRandomizer * u_opacityRange);
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
  u_angle: number;
  u_angleRange: number;
  u_shiftX: number;
  u_shiftY: number;
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
}

export const DotGridShapes = {
  circle: 0,
  diamond: 1,
  square: 2,
  triangle: 3,
  line: 4,
  cross: 5,
  star: 6,
  asterisk: 7,
  rect: 8,
  plus: 9,
} as const;

export type DotGridShape = keyof typeof DotGridShapes;

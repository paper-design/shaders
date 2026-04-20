import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, rotation2, proceduralHash21, glslMod } from '../shader-utils.js';

/**
 * A halftone-dot image filter featuring customizable grids, color palettes, and dot styles.
 *
 * Fragment shader uniforms:
 * - u_rotation (float): Overall rotation angle of the graphics in degrees (0 to 360)
 * - u_time (float): Animation time
 * - u_image (sampler2D): Source image texture
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorFront (vec4): Foreground color in RGBA
 * - u_colorBack (vec4): Background color in RGBA
 * - u_originalColors (bool): Use sampled image's original colors instead of colorFront
 * - u_type (float): Dot style (0 = classic, 1 = gooey, 2 = holes, 3 = soft)
 * - u_inverted (bool): Inverts the image luminance, doesn't affect the color scheme; not effective at zero contrast
 * - u_grid (float): Grid type (0 = square, 1 = hex)
 * - u_size (float): Grid size relative to the image box (0 to 1)
 * - u_radius (float): Maximum dot size relative to grid cell (0 to 2)
 * - u_contrast (float): Contrast applied to the sampled image (0 to 1)
 * - u_grainMixer (float): Strength of grain distortion applied to shape edges (0 to 1)
 * - u_grainOverlay (float): Post-processing black/white grain overlay (0 to 1)
 * - u_grainSize (float): Scale applied to both grain distortion and grain overlay (0 to 1)
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_imageUV (vec2): Image UV coordinates with global sizing (rotation, scale, offset, etc) applied
 *
 * Vertex shader uniforms:
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_originX (float): Reference point for positioning world width in the canvas (0 to 1)
 * - u_originY (float): Reference point for positioning world height in the canvas (0 to 1)
 * - u_fit (float): How to fit the rendered shader into the canvas dimensions (0 = none, 1 = contain, 2 = cover)
 * - u_scale (float): Overall zoom level of the graphics (0.01 to 4)
 * - u_rotation (float): Overall rotation angle of the graphics in degrees (0 to 360)
 * - u_offsetX (float): Horizontal offset of the graphics center (-1 to 1)
 * - u_offsetY (float): Vertical offset of the graphics center (-1 to 1)
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 *
 */

export const halftoneDotsFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorFront: vec4f,
  u_colorBack: vec4f,
  u_radius: f32,
  u_contrast: f32,
  u_size: f32,
  u_grainMixer: f32,
  u_grainOverlay: f32,
  u_grainSize: f32,
  u_grid: f32,
  u_originalColors: f32,
  u_inverted: f32,
  u_type: f32,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

@group(1) @binding(0) var u_image_tex: texture_2d<f32>;
@group(1) @binding(1) var u_image_samp: sampler;

${vertexOutputStruct}

${declarePI}
${rotation2}
${proceduralHash21}
${glslMod}

struct LumBallResult {
  ball: f32,
  ballColor: vec4f,
}

fn valueNoise(st: vec2f) -> f32 {
  let i = floor(st);
  let f = fract(st);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  let u_val = f * f * (vec2f(3.0) - 2.0 * f);
  let x1 = mix(a, b, u_val.x);
  let x2 = mix(c, d, u_val.x);
  return mix(x1, x2, u_val.y);
}

fn lst(edge0: f32, edge1: f32, x: f32) -> f32 {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

fn sst(edge0: f32, edge1: f32, x: f32) -> f32 {
  return smoothstep(edge0, edge1, x);
}

fn fwidth_f32(v: f32) -> f32 {
  return abs(dpdx(v)) + abs(dpdy(v));
}

fn getCircle(uv: vec2f, r_in: f32, baseR: f32) -> f32 {
  let r = mix(0.25 * baseR, 0.0, r_in);
  let d = length(uv - vec2f(0.5));
  let aa = fwidth_f32(d);
  return 1.0 - smoothstep(r - aa, r + aa, d);
}

fn getCell(uv: vec2f) -> f32 {
  let insideX = step(0.0, uv.x) * (1.0 - step(1.0, uv.x));
  let insideY = step(0.0, uv.y) * (1.0 - step(1.0, uv.y));
  return insideX * insideY;
}

fn getCircleWithHole(uv: vec2f, r_in: f32, baseR: f32) -> f32 {
  let cell = getCell(uv);

  let r = mix(0.75 * baseR, 0.0, r_in);
  let rMod = glsl_mod_f32(r, 0.5);

  let d = length(uv - vec2f(0.5));
  let aa = fwidth_f32(d);
  let circle = 1.0 - smoothstep(rMod - aa, rMod + aa, d);
  if (r < 0.5) {
    return circle;
  } else {
    return cell - circle;
  }
}

fn getGooeyBall(uv: vec2f, r: f32, baseR: f32) -> f32 {
  var d = length(uv - vec2f(0.5));
  var sizeRadius = 0.3;
  if (u.u_grid == 1.0) {
    sizeRadius = 0.42;
  }
  sizeRadius = mix(sizeRadius * baseR, 0.0, r);
  d = 1.0 - sst(0.0, sizeRadius, d);

  d = pow(d, 2.0 + baseR);
  return d;
}

fn getSoftBall(uv: vec2f, r: f32, baseR: f32) -> f32 {
  var d = length(uv - vec2f(0.5));
  let sizeRadius_raw = clamp(baseR, 0.0, 1.0);
  let sizeRadius = mix(0.5 * sizeRadius_raw, 0.0, r);
  d = 1.0 - lst(0.0, sizeRadius, d);
  let powRadius = 1.0 - lst(0.0, 2.0, baseR);
  d = pow(d, 4.0 + 3.0 * powRadius);
  return d;
}

fn getUvFrame(uv: vec2f, pad: vec2f) -> f32 {
  let aa: f32 = 0.0001;

  let left   = smoothstep(-pad.x, -pad.x + aa, uv.x);
  let right  = smoothstep(1.0 + pad.x, 1.0 + pad.x - aa, uv.x);
  let bottom = smoothstep(-pad.y, -pad.y + aa, uv.y);
  let top    = smoothstep(1.0 + pad.y, 1.0 + pad.y - aa, uv.y);

  return left * right * bottom * top;
}

fn sigmoid(x: f32, k: f32) -> f32 {
  return 1.0 / (1.0 + exp(-k * (x - 0.5)));
}

fn getLumAtPx(uv: vec2f, contrast: f32) -> f32 {
  let tex = textureSampleLevel(u_image_tex, u_image_samp, uv, 0.0);
  let color = vec3f(
    sigmoid(tex.r, contrast),
    sigmoid(tex.g, contrast),
    sigmoid(tex.b, contrast)
  );
  var lum = dot(vec3f(0.2126, 0.7152, 0.0722), color);
  lum = mix(1.0, lum, tex.a);
  lum = select(lum, 1.0 - lum, u.u_inverted > 0.5);
  return lum;
}

fn getLumBall(p_in: vec2f, pad: vec2f, inCellOffset: vec2f, contrast: f32, baseR: f32, stepSize: f32) -> LumBallResult {
  let p = p_in + inCellOffset;
  let uv_i = floor(p);
  let uv_f = fract(p);
  let samplingUV = (uv_i + vec2f(0.5) - inCellOffset) * pad + vec2f(0.5);
  let outOfFrame = getUvFrame(samplingUV, pad * stepSize);

  let lum = getLumAtPx(samplingUV, contrast);
  var ballColor = textureSampleLevel(u_image_tex, u_image_samp, samplingUV, 0.0);
  ballColor = vec4f(ballColor.rgb * ballColor.a, ballColor.a);
  ballColor *= outOfFrame;

  var ball: f32 = 0.0;
  if (u.u_type == 0.0) {
    // classic
    ball = getCircle(uv_f, lum, baseR);
  } else if (u.u_type == 1.0) {
    // gooey
    ball = getGooeyBall(uv_f, lum, baseR);
  } else if (u.u_type == 2.0) {
    // holes
    ball = getCircleWithHole(uv_f, lum, baseR);
  } else if (u.u_type == 3.0) {
    // soft
    ball = getSoftBall(uv_f, lum, baseR);
  }

  return LumBallResult(ball * outOfFrame, ballColor);
}


@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {

  var stepMultiplier: f32 = 1.0;
  if (u.u_type == 0.0) {
    // classic
    stepMultiplier = 2.0;
  } else if (u.u_type == 1.0 || u.u_type == 3.0) {
    // gooey & soft
    stepMultiplier = 6.0;
  }

  var cellsPerSide = mix(300.0, 7.0, pow(u.u_size, 0.7));
  cellsPerSide /= stepMultiplier;
  let cellSizeY = 1.0 / cellsPerSide;
  var pad = cellSizeY * vec2f(1.0 / u.u_imageAspectRatio, 1.0);
  if (u.u_type == 1.0 && u.u_grid == 1.0) {
    // gooey diagonal grid works differently
    pad *= 0.7;
  }

  var uv = input.v_imageUV;
  uv -= vec2f(0.5);
  uv /= pad;

  var contrast = mix(0.0, 15.0, pow(u.u_contrast, 1.5));
  var baseRadius = u.u_radius;
  if (u.u_originalColors > 0.5) {
    contrast = mix(0.1, 4.0, pow(u.u_contrast, 2.0));
    baseRadius = 2.0 * pow(0.5 * u.u_radius, 0.3);
  }

  var totalShape: f32 = 0.0;
  var totalColor = vec3f(0.0);
  var totalOpacity: f32 = 0.0;

  let stepSize = 1.0 / stepMultiplier;
  let numSteps = i32(stepMultiplier);
  for (var xi: i32 = 0; xi < numSteps; xi++) {
    let x = f32(xi) * stepSize - 0.5;
    for (var yi: i32 = 0; yi < numSteps; yi++) {
      let y = f32(yi) * stepSize - 0.5;
      var offset = vec2f(x, y);

      var skipCell = false;
      if (u.u_grid == 1.0) {
        var rowIndex = floor((y + 0.5) / stepSize);
        var colIndex = floor((x + 0.5) / stepSize);
        if (stepSize == 1.0) {
          rowIndex = floor(uv.y + y + 1.0);
          if (u.u_type == 1.0) {
            colIndex = floor(uv.x + x + 1.0);
          }
        }
        if (u.u_type == 1.0) {
          if (glsl_mod_f32(rowIndex + colIndex, 2.0) == 1.0) {
            skipCell = true;
          }
        } else {
          if (glsl_mod_f32(rowIndex, 2.0) == 1.0) {
            offset = vec2f(offset.x + 0.5 * stepSize, offset.y);
          }
        }
      }

      let result = getLumBall(uv, pad, offset, contrast, baseRadius, stepSize);
      if (!skipCell) {
        let shape = result.ball;
        let ballColor = result.ballColor;
        totalColor   += ballColor.rgb * shape;
        totalShape   += shape;
        totalOpacity += shape;
      }
    }
  }

  let eps: f32 = 1e-4;

  totalColor /= max(totalShape, eps);
  totalOpacity /= max(totalShape, eps);

  var finalShape: f32 = 0.0;
  if (u.u_type == 0.0) {
    finalShape = min(1.0, totalShape);
  } else if (u.u_type == 1.0) {
    let aa = fwidth_f32(totalShape);
    let th = 0.5;
    finalShape = smoothstep(th - aa, th + aa, totalShape);
  } else if (u.u_type == 2.0) {
    finalShape = min(1.0, totalShape);
  } else if (u.u_type == 3.0) {
    finalShape = totalShape;
  }

  let grainSizeVal = mix(2000.0, 200.0, u.u_grainSize) * vec2f(1.0, 1.0 / u.u_imageAspectRatio);
  var grainUV = input.v_imageUV - vec2f(0.5);
  grainUV *= grainSizeVal;
  grainUV += vec2f(0.5);
  var grain = valueNoise(grainUV);
  grain = smoothstep(0.55, 0.7 + 0.2 * u.u_grainMixer, grain);
  grain *= u.u_grainMixer;
  finalShape = mix(finalShape, 0.0, grain);

  var color = vec3f(0.0);
  var opacity: f32 = 0.0;

  if (u.u_originalColors > 0.5) {
    color = totalColor * finalShape;
    opacity = totalOpacity * finalShape;

    let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
    color = color + bgColor * (1.0 - opacity);
    opacity = opacity + u.u_colorBack.a * (1.0 - opacity);
  } else {
    let fgColor = u.u_colorFront.rgb * u.u_colorFront.a;
    let fgOpacity = u.u_colorFront.a;
    let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
    let bgOpacity = u.u_colorBack.a;

    color = fgColor * finalShape;
    opacity = fgOpacity * finalShape;
    color += bgColor * (1.0 - opacity);
    opacity += bgOpacity * (1.0 - opacity);
  }

  var grainOverlay = valueNoise(rotate(grainUV, 1.0) + vec2f(3.0));
  grainOverlay = mix(grainOverlay, valueNoise(rotate(grainUV, 2.0) + vec2f(-1.0)), 0.5);
  grainOverlay = pow(grainOverlay, 1.3);

  let grainOverlayV = grainOverlay * 2.0 - 1.0;
  let grainOverlayColor = vec3f(step(0.0, grainOverlayV));
  var grainOverlayStrength = u.u_grainOverlay * abs(grainOverlayV);
  grainOverlayStrength = pow(grainOverlayStrength, 0.8);
  color = mix(color, grainOverlayColor, 0.5 * grainOverlayStrength);

  opacity += 0.5 * grainOverlayStrength;
  opacity = clamp(opacity, 0.0, 1.0);

  return vec4f(color, opacity);
}
`;

export interface HalftoneDotsUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_size: number;
  u_grid: (typeof HalftoneDotsGrids)[HalftoneDotsGrid];
  u_radius: number;
  u_contrast: number;
  u_originalColors: boolean;
  u_inverted: boolean;
  u_grainMixer: number;
  u_grainOverlay: number;
  u_grainSize: number;
  u_type: (typeof HalftoneDotsTypes)[HalftoneDotsType];
}

export interface HalftoneDotsParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorFront?: string;
  colorBack?: string;
  size?: number;
  grid?: HalftoneDotsGrid;
  radius?: number;
  contrast?: number;
  originalColors?: boolean;
  inverted?: boolean;
  grainMixer?: number;
  grainOverlay?: number;
  grainSize?: number;
  type?: HalftoneDotsType;
}

export const HalftoneDotsTypes = {
  classic: 0,
  gooey: 1,
  holes: 2,
  soft: 3,
} as const;

export type HalftoneDotsType = keyof typeof HalftoneDotsTypes;

export const HalftoneDotsGrids = {
  square: 0,
  hex: 1,
} as const;

export type HalftoneDotsGrid = keyof typeof HalftoneDotsGrids;

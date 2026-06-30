import type { ShaderMotionParams } from '../shader-mount.js';
import {
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, simplexNoise, declarePI, proceduralHash11, proceduralHash21, glslMod } from '../shader-utils.js';

/**
 * Animated 2-color dithering over multiple pattern sources (noise, warp, dots, waves, ripple, swirl, sphere).
 *
 * SIZING NOTE: This shader performs sizing in the fragment shader (not vertex shader) to keep
 * u_pxSize in consistent actual pixels. The pixel grid is computed from input.position before any
 * transforms, so scaling/rotating only affects the underlying pattern shape.
 * No vertex shader outputs (v_objectUV, v_patternUV, etc.) are used.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
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
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colorFront (vec4): Foreground (ink) color in RGBA
 * - u_shape (float): Shape pattern type (1 = simplex, 2 = warp, 3 = dots, 4 = wave, 5 = ripple, 6 = swirl, 7 = sphere)
 * - u_type (float): Dithering type (1 = random, 2 = 2x2 Bayer, 3 = 4x4 Bayer, 4 = 8x8 Bayer)
 * - u_pxSize (float): Pixel size of dithering grid (0.5 to 20)
 *
 * */

// language=WGSL
export const ditheringFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_pxSize: f32,
  u_colorBack: vec4f,
  u_colorFront: vec4f,
  u_shape: f32,
  u_type: f32,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

${glslMod}
${simplexNoise}
${declarePI}
${proceduralHash11}
${proceduralHash21}

fn getSimplexNoise(uv: vec2f, t: f32) -> f32 {
  var noiseVal = 0.5 * snoise(uv - vec2f(0.0, 0.3 * t));
  noiseVal += 0.5 * snoise(2.0 * uv + vec2f(0.0, 0.32 * t));
  return noiseVal;
}

const bayer2x2 = array<i32, 4>(0, 2, 3, 1);
const bayer4x4 = array<i32, 16>(
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5
);

const bayer8x8 = array<i32, 64>(
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
);

fn getBayerValue(uv: vec2f, size: i32) -> f32 {
  let pos = vec2i(fract(uv / f32(size)) * f32(size));
  let index = pos.y * size + pos.x;

  if (size == 2) {
    return f32(bayer2x2[index]) / 4.0;
  } else if (size == 4) {
    return f32(bayer4x4[index]) / 16.0;
  } else if (size == 8) {
    return f32(bayer8x8[index]) / 64.0;
  }
  return 0.0;
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let t = 0.5 * u.u_time;

  let pxSize = u.u_pxSize * u.u_pixelRatio;
  let fragCoord = vec2f(input.position.x, u.u_resolution.y - input.position.y);
  var pxSizeUV = fragCoord - 0.5 * u.u_resolution;
  pxSizeUV /= pxSize;
  let canvasPixelizedUV = (floor(pxSizeUV) + vec2f(0.5)) * pxSize;
  let normalizedUV = canvasPixelizedUV / u.u_resolution;

  let ditheringNoiseUV = canvasPixelizedUV;
  var shapeUV = normalizedUV;

  let boxOrigin = vec2f(0.5 - u.u_originX, u.u_originY - 0.5);
  var givenBoxSize = vec2f(u.u_worldWidth, u.u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2f(1.0)) * u.u_pixelRatio;
  let r = u.u_rotation * PI / 180.0;
  let graphicRotation = mat2x2f(cos(r), sin(r), -sin(r), cos(r));

  let patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  let boxSize = vec2f(
    select(givenBoxSize.x, u.u_resolution.x, u.u_worldWidth == 0.0),
    select(givenBoxSize.y, u.u_resolution.y, u.u_worldHeight == 0.0)
  );

  if (u.u_shape > 3.5) {
    var objectBoxSize = vec2f(0.0);
    // fit = none
    objectBoxSize.x = min(boxSize.x, boxSize.y);
    if (u.u_fit == 1.0) { // fit = contain
      objectBoxSize.x = min(u.u_resolution.x, u.u_resolution.y);
    } else if (u.u_fit == 2.0) { // fit = cover
      objectBoxSize.x = max(u.u_resolution.x, u.u_resolution.y);
    }
    objectBoxSize.y = objectBoxSize.x;
    let objectWorldScale = u.u_resolution.xy / objectBoxSize;

    shapeUV *= objectWorldScale;
    shapeUV += boxOrigin * (objectWorldScale - vec2f(1.0));
    shapeUV += vec2f(-u.u_offsetX, u.u_offsetY);
    shapeUV /= u.u_scale;
    shapeUV = graphicRotation * shapeUV;
  } else {
    var patternBoxSize = vec2f(0.0);
    // fit = none
    patternBoxSize.x = patternBoxRatio * min(boxSize.x / patternBoxRatio, boxSize.y);
    let patternWorldNoFitBoxWidth = patternBoxSize.x;
    if (u.u_fit == 1.0) { // fit = contain
      patternBoxSize.x = patternBoxRatio * min(u.u_resolution.x / patternBoxRatio, u.u_resolution.y);
    } else if (u.u_fit == 2.0) { // fit = cover
      patternBoxSize.x = patternBoxRatio * max(u.u_resolution.x / patternBoxRatio, u.u_resolution.y);
    }
    patternBoxSize.y = patternBoxSize.x / patternBoxRatio;
    let patternWorldScale = u.u_resolution.xy / patternBoxSize;

    shapeUV += vec2f(-u.u_offsetX, u.u_offsetY) / patternWorldScale;
    shapeUV += boxOrigin;
    shapeUV -= boxOrigin / patternWorldScale;
    shapeUV *= u.u_resolution.xy;
    shapeUV /= u.u_pixelRatio;
    if (u.u_fit > 0.0) {
      shapeUV *= (patternWorldNoFitBoxWidth / patternBoxSize.x);
    }
    shapeUV /= u.u_scale;
    shapeUV = graphicRotation * shapeUV;
    shapeUV += boxOrigin / patternWorldScale;
    shapeUV -= boxOrigin;
    shapeUV += vec2f(0.5);
  }

  var shape: f32 = 0.0;
  if (u.u_shape < 1.5) {
    // Simplex noise
    shapeUV *= 0.001;

    shape = 0.5 + 0.5 * getSimplexNoise(shapeUV, t);
    shape = smoothstep(0.3, 0.9, shape);

  } else if (u.u_shape < 2.5) {
    // Warp
    shapeUV *= 0.003;

    for (var i: f32 = 1.0; i < 6.0; i += 1.0) {
      shapeUV.x += 0.6 / i * cos(i * 2.5 * shapeUV.y + t);
      shapeUV.y += 0.6 / i * cos(i * 1.5 * shapeUV.x + t);
    }

    shape = 0.15 / max(0.001, abs(sin(t - shapeUV.y - shapeUV.x)));
    shape = smoothstep(0.02, 1.0, shape);

  } else if (u.u_shape < 3.5) {
    // Dots
    shapeUV *= 0.05;

    let stripeIdx = floor(2.0 * shapeUV.x / TWO_PI);
    var rand = hash11(stripeIdx * 10.0);
    rand = sign(rand - 0.5) * pow(0.1 + abs(rand), 0.4);
    shape = sin(shapeUV.x) * cos(shapeUV.y - 5.0 * rand * t);
    shape = pow(abs(shape), 6.0);

  } else if (u.u_shape < 4.5) {
    // Sine wave
    shapeUV *= 4.0;

    let wave = cos(0.5 * shapeUV.x - 2.0 * t) * sin(1.5 * shapeUV.x + t) * (0.75 + 0.25 * cos(3.0 * t));
    shape = 1.0 - smoothstep(-1.0, 1.0, shapeUV.y + wave);

  } else if (u.u_shape < 5.5) {
    // Ripple

    let dist = length(shapeUV);
    let waves = sin(pow(dist, 1.7) * 7.0 - 3.0 * t) * 0.5 + 0.5;
    shape = waves;

  } else if (u.u_shape < 6.5) {
    // Swirl

    let l = length(shapeUV);
    let angle = 6.0 * atan2(shapeUV.y, shapeUV.x) + 4.0 * t;
    let twist: f32 = 1.2;
    let offset = 1.0 / pow(max(l, 1e-6), twist) + angle / TWO_PI;
    let mid = smoothstep(0.0, 1.0, pow(l, twist));
    shape = mix(0.0, fract(offset), mid);

  } else {
    // Sphere
    shapeUV *= 2.0;

    let d = 1.0 - pow(length(shapeUV), 2.0);
    let pos = vec3f(shapeUV, sqrt(max(0.0, d)));
    let lightPos = normalize(vec3f(cos(1.5 * t), 0.8, sin(1.25 * t)));
    shape = 0.5 + 0.5 * dot(lightPos, pos);
    shape *= step(0.0, d);
  }

  let typeVal = i32(floor(u.u_type));
  var dithering: f32 = 0.0;

  if (typeVal == 1) {
    dithering = step(hash21(ditheringNoiseUV), shape);
  } else if (typeVal == 2) {
    dithering = getBayerValue(pxSizeUV, 2);
  } else if (typeVal == 3) {
    dithering = getBayerValue(pxSizeUV, 4);
  } else {
    dithering = getBayerValue(pxSizeUV, 8);
  }

  dithering -= 0.5;
  let res = step(0.5, shape + dithering);

  let fgColor = u.u_colorFront.rgb * u.u_colorFront.a;
  let fgOpacity = u.u_colorFront.a;
  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
  let bgOpacity = u.u_colorBack.a;

  var color = fgColor * res;
  var opacity = fgOpacity * res;

  color += bgColor * (1.0 - opacity);
  opacity += bgOpacity * (1.0 - opacity);

  return vec4f(color, opacity);
}
`;

export interface DitheringUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colorFront: [number, number, number, number];
  u_shape: (typeof DitheringShapes)[DitheringShape];
  u_type: (typeof DitheringTypes)[DitheringType];
  u_pxSize: number;
}

export interface DitheringParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colorFront?: string;
  shape?: DitheringShape;
  type?: DitheringType;
  size?: number;
}

export const DitheringShapes = {
  simplex: 1,
  warp: 2,
  dots: 3,
  wave: 4,
  ripple: 5,
  swirl: 6,
  sphere: 7,
} as const;

export type DitheringShape = keyof typeof DitheringShapes;

export const DitheringTypes = {
  'random': 1,
  '2x2': 2,
  '4x4': 3,
  '8x8': 4,
} as const;

export type DitheringType = keyof typeof DitheringTypes;

import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI } from '../shader-utils.js';

/**
 * CMYK halftone printing effect applied to images with customizable dot patterns
 * and ink colors for each channel (Cyan, Magenta, Yellow, Black).
 *
 * Fragment shader uniforms:
 * - u_image (sampler2D): Source image texture
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorBack (vec4): Background (paper) color in RGBA
 * - u_colorC (vec4): Cyan ink color in RGBA
 * - u_colorM (vec4): Magenta ink color in RGBA
 * - u_colorY (vec4): Yellow ink color in RGBA
 * - u_colorK (vec4): Black ink color in RGBA
 * - u_size (float): Halftone cell size (0 to 1)
 * - u_minDot (float): Minimum dot thickness (0 to 1)
 * - u_contrast (float): Image contrast adjustment (0 to 2)
 * - u_softness (float): Edge softness of dots (0 to 1)
 * - u_grainSize (float): Size of grain overlay texture (0 to 1)
 * - u_grainMixer (float): Strength of grain affecting dot size (0 to 1)
 * - u_grainOverlay (float): Strength of grain overlay on final output (0 to 1)
 * - u_gridNoise (float): Strength of smooth noise applied to both dot positions and color sampling (0 to 1)
 * - u_floodC (float): Flat cyan dot size adjustment applied uniformly (-1 to 1)
 * - u_floodM (float): Flat magenta dot size adjustment applied uniformly (-1 to 1)
 * - u_floodY (float): Flat yellow dot size adjustment applied uniformly (-1 to 1)
 * - u_floodK (float): Flat black dot size adjustment applied uniformly (-1 to 1)
 * - u_gainC (float): Proportional cyan dot size gain (enhances existing dots, -1 to 1)
 * - u_gainM (float): Proportional magenta dot size gain (enhances existing dots, -1 to 1)
 * - u_gainY (float): Proportional yellow dot size gain (enhances existing dots, -1 to 1)
 * - u_gainK (float): Proportional black dot size gain (enhances existing dots, -1 to 1)
 * - u_type (float): Dot shape style (0 = dots, 1 = ink, 2 = sharp)
 * - u_noiseTexture (sampler2D): Pre-computed randomizer source texture
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_imageUV (vec2): UV coordinates for sampling the source image, with fit, scale, rotation, and offset applied
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

// language=WGSL
export const halftoneCmykFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorBack: vec4f,
  u_colorC: vec4f,
  u_colorM: vec4f,
  u_colorY: vec4f,
  u_colorK: vec4f,
  u_size: f32,
  u_minDot: f32,
  u_contrast: f32,
  u_grainSize: f32,
  u_grainMixer: f32,
  u_grainOverlay: f32,
  u_gridNoise: f32,
  u_softness: f32,
  u_floodC: f32,
  u_floodM: f32,
  u_floodY: f32,
  u_floodK: f32,
  u_gainC: f32,
  u_gainM: f32,
  u_gainY: f32,
  u_gainK: f32,
  u_type: f32,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

@group(1) @binding(0) var u_image_tex: texture_2d<f32>;
@group(1) @binding(1) var u_image_samp: sampler;
@group(1) @binding(2) var u_noiseTexture_tex: texture_2d<f32>;
@group(1) @binding(3) var u_noiseTexture_samp: sampler;

${vertexOutputStruct}

${declarePI}

const shiftC: f32 = -0.5;
const shiftM: f32 = -0.25;
const shiftY: f32 = 0.2;
const shiftK: f32 = 0.0;

// Precomputed sin/cos for rotation angles (15deg, 75deg, 0deg, 45deg)
const cosC: f32 = 0.9659258;  const sinC: f32 = 0.2588190;   // 15deg
const cosM: f32 = 0.2588190;  const sinM: f32 = 0.9659258;   // 75deg
const cosY_c: f32 = 1.0;      const sinY_c: f32 = 0.0;       // 0deg
const cosK: f32 = 0.7071068;  const sinK: f32 = 0.7071068;   // 45deg

fn fwidth_f32(v: f32) -> f32 {
  return abs(dpdx(v)) + abs(dpdy(v));
}

fn randomRG(p: vec2f) -> vec2f {
  let uv = floor(p) / 100.0 + vec2f(0.5);
  return textureSampleLevel(u_noiseTexture_tex, u_noiseTexture_samp, fract(uv), 0.0).rg;
}

fn hash23(p: vec2f) -> vec3f {
  var p3 = fract(vec3f(p.x, p.y, p.x) * vec3f(0.3183099, 0.3678794, 0.3141592)) + vec3f(0.1);
  p3 += vec3f(dot(p3, vec3f(p3.y, p3.z, p3.x) + vec3f(19.19)));
  return fract(vec3f(p3.x * p3.y, p3.y * p3.z, p3.z * p3.x));
}

fn sst(edge0: f32, edge1: f32, x: f32) -> f32 {
  return smoothstep(edge0, edge1, x);
}

fn valueNoise3(st: vec2f) -> vec3f {
  let i = floor(st);
  let f = fract(st);
  let a = hash23(i);
  let b = hash23(i + vec2f(1.0, 0.0));
  let c = hash23(i + vec2f(0.0, 1.0));
  let d = hash23(i + vec2f(1.0, 1.0));
  let u_val = f * f * (vec2f(3.0) - 2.0 * f);
  let x1 = mix(a, b, u_val.x);
  let x2 = mix(c, d, u_val.x);
  return mix(x1, x2, u_val.y);
}

fn getUvFrame(uv: vec2f, pad: vec2f) -> f32 {
  let left   = smoothstep(-pad.x, 0.0, uv.x);
  let right  = smoothstep(1.0 + pad.x, 1.0, uv.x);
  let bottom = smoothstep(-pad.y, 0.0, uv.y);
  let top    = smoothstep(1.0 + pad.y, 1.0, uv.y);

  return left * right * bottom * top;
}

fn RGBAtoCMYK(rgba: vec4f) -> vec4f {
  let k = 1.0 - max(max(rgba.r, rgba.g), rgba.b);
  let denom = 1.0 - k;
  var cmy = vec3f(0.0);
  if (denom > 1e-5) {
    cmy = (vec3f(1.0) - rgba.rgb - vec3f(k)) / denom;
  }
  return vec4f(cmy, k) * rgba.a;
}

fn applyContrast(rgb: vec3f) -> vec3f {
  return clamp((rgb - vec3f(0.5)) * u.u_contrast + vec3f(0.5), vec3f(0.0), vec3f(1.0));
}

// Single-component CMYK extractors with contrast built-in, alpha-aware
fn getCyan(rgba: vec4f) -> f32 {
  let c = clamp((rgba.rgb - vec3f(0.5)) * u.u_contrast + vec3f(0.5), vec3f(0.0), vec3f(1.0));
  let maxRGB = max(max(c.r, c.g), c.b);
  return select(0.0, (maxRGB - c.r) / maxRGB, maxRGB > 1e-5) * rgba.a;
}
fn getMagenta(rgba: vec4f) -> f32 {
  let c = clamp((rgba.rgb - vec3f(0.5)) * u.u_contrast + vec3f(0.5), vec3f(0.0), vec3f(1.0));
  let maxRGB = max(max(c.r, c.g), c.b);
  return select(0.0, (maxRGB - c.g) / maxRGB, maxRGB > 1e-5) * rgba.a;
}
fn getYellow(rgba: vec4f) -> f32 {
  let c = clamp((rgba.rgb - vec3f(0.5)) * u.u_contrast + vec3f(0.5), vec3f(0.0), vec3f(1.0));
  let maxRGB = max(max(c.r, c.g), c.b);
  return select(0.0, (maxRGB - c.b) / maxRGB, maxRGB > 1e-5) * rgba.a;
}
fn getBlack(rgba: vec4f) -> f32 {
  let c = clamp((rgba.rgb - vec3f(0.5)) * u.u_contrast + vec3f(0.5), vec3f(0.0), vec3f(1.0));
  return (1.0 - max(max(c.r, c.g), c.b)) * rgba.a;
}

fn cellCenterPos(uv: vec2f, cellOffset: vec2f, channelIdx: f32) -> vec2f {
  let cellCenter = floor(uv) + vec2f(0.5) + cellOffset;
  return cellCenter + (randomRG(cellCenter + vec2f(channelIdx * 50.0)) - vec2f(0.5)) * u.u_gridNoise;
}

fn gridToImageUV(cellCenter: vec2f, cosA: f32, sinA: f32, shift: f32, pad: vec2f) -> vec2f {
  let uvGrid = mat2x2f(cosA, -sinA, sinA, cosA) * (cellCenter - vec2f(shift));
  return uvGrid * pad + vec2f(0.5);
}

fn colorMask(pos: vec2f, cellCenter: vec2f, rad: f32, transparency: f32, grain: f32, channelAddon: f32, channelgain: f32, generalComp: f32, isJoined: bool) -> f32 {
  let dist = length(pos - cellCenter);

  var radius = rad;
  radius *= (1.0 + generalComp);
  radius += (0.15 + channelgain * radius);
  radius = max(0.0, radius);
  radius = mix(0.0, radius, transparency);
  radius += channelAddon;
  radius *= (1.0 - grain);

  var mask = 1.0 - sst(0.0, radius, dist);
  if (isJoined) {
    // ink or sharp (joined)
    mask = pow(mask, 1.2);
  } else {
    // dots (separate)
    mask = sst(0.5 - 0.5 * u.u_softness, 0.51 + 0.49 * u.u_softness, mask);
  }

  mask *= mix(1.0, mix(0.5, 1.0, 1.5 * radius), u.u_softness);
  return mask;
}

fn applyInk(paper: vec3f, inkColor: vec3f, cov: f32) -> vec3f {
  let inkEffect = mix(vec3f(1.0), inkColor, clamp(cov, 0.0, 1.0));
  return paper * inkEffect;
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.v_imageUV;

  let cellsPerSide = mix(400.0, 7.0, pow(u.u_size, 0.7));
  let cellSizeY = 1.0 / cellsPerSide;
  let pad = cellSizeY * vec2f(1.0 / u.u_imageAspectRatio, 1.0);
  let uvGrid = (uv - vec2f(0.5)) / pad;
  var insideImageBox = getUvFrame(uv, pad);

  let generalComp = 0.1 * u.u_softness + 0.1 * u.u_gridNoise + 0.1 * (1.0 - step(0.5, u.u_type)) * (1.5 - u.u_softness);

  let uvC = mat2x2f(cosC, sinC, -sinC, cosC) * uvGrid + vec2f(shiftC);
  let uvM = mat2x2f(cosM, sinM, -sinM, cosM) * uvGrid + vec2f(shiftM);
  let uvY_val = mat2x2f(cosY_c, sinY_c, -sinY_c, cosY_c) * uvGrid + vec2f(shiftY);
  let uvK = mat2x2f(cosK, sinK, -sinK, cosK) * uvGrid + vec2f(shiftK);

  let grainSizeVal = mix(2000.0, 200.0, u.u_grainSize) * vec2f(1.0, 1.0 / u.u_imageAspectRatio);
  let grainUV = (input.v_imageUV - vec2f(0.5)) * grainSizeVal + vec2f(0.5);
  let noiseValues = valueNoise3(grainUV);
  var grain = sst(0.55, 1.0, noiseValues.r);
  grain *= u.u_grainMixer;

  var outMask = vec4f(0.0);
  let isJoined = u.u_type > 0.5;

  if (u.u_type < 1.5) {
    // dots or ink: per-cell color sampling
    for (var dy: i32 = -1; dy <= 1; dy++) {
      for (var dx: i32 = -1; dx <= 1; dx++) {
        let cellOffset = vec2f(f32(dx), f32(dy));

        let cellCenterC_val = cellCenterPos(uvC, cellOffset, 0.0);
        let texC = textureSampleLevel(u_image_tex, u_image_samp, gridToImageUV(cellCenterC_val, cosC, sinC, shiftC, pad), 0.0);
        let maskC = colorMask(uvC, cellCenterC_val, getCyan(texC), insideImageBox * texC.a, grain, u.u_floodC, u.u_gainC, generalComp, isJoined);
        outMask = vec4f(outMask.x + maskC, outMask.y, outMask.z, outMask.w);

        let cellCenterM_val = cellCenterPos(uvM, cellOffset, 1.0);
        let texM = textureSampleLevel(u_image_tex, u_image_samp, gridToImageUV(cellCenterM_val, cosM, sinM, shiftM, pad), 0.0);
        let maskM = colorMask(uvM, cellCenterM_val, getMagenta(texM), insideImageBox * texM.a, grain, u.u_floodM, u.u_gainM, generalComp, isJoined);
        outMask = vec4f(outMask.x, outMask.y + maskM, outMask.z, outMask.w);

        let cellCenterY_val = cellCenterPos(uvY_val, cellOffset, 2.0);
        let texY = textureSampleLevel(u_image_tex, u_image_samp, gridToImageUV(cellCenterY_val, cosY_c, sinY_c, shiftY, pad), 0.0);
        let maskY = colorMask(uvY_val, cellCenterY_val, getYellow(texY), insideImageBox * texY.a, grain, u.u_floodY, u.u_gainY, generalComp, isJoined);
        outMask = vec4f(outMask.x, outMask.y, outMask.z + maskY, outMask.w);

        let cellCenterK_val = cellCenterPos(uvK, cellOffset, 3.0);
        let texK = textureSampleLevel(u_image_tex, u_image_samp, gridToImageUV(cellCenterK_val, cosK, sinK, shiftK, pad), 0.0);
        let maskK = colorMask(uvK, cellCenterK_val, getBlack(texK), insideImageBox * texK.a, grain, u.u_floodK, u.u_gainK, generalComp, isJoined);
        outMask = vec4f(outMask.x, outMask.y, outMask.z, outMask.w + maskK);
      }
    }
  } else {
    // sharp: direct px color sampling
    let tex = textureSampleLevel(u_image_tex, u_image_samp, uv, 0.0);
    let texContrasted = vec4f(applyContrast(tex.rgb), tex.a);
    insideImageBox *= texContrasted.a;
    let cmykOriginal = RGBAtoCMYK(texContrasted);
    for (var dy: i32 = -1; dy <= 1; dy++) {
      for (var dx: i32 = -1; dx <= 1; dx++) {
        let cellOffset = vec2f(f32(dx), f32(dy));

        let maskC = colorMask(uvC, cellCenterPos(uvC, cellOffset, 0.0), cmykOriginal.x, insideImageBox, grain, u.u_floodC, u.u_gainC, generalComp, isJoined);
        outMask = vec4f(outMask.x + maskC, outMask.y, outMask.z, outMask.w);
        let maskM = colorMask(uvM, cellCenterPos(uvM, cellOffset, 1.0), cmykOriginal.y, insideImageBox, grain, u.u_floodM, u.u_gainM, generalComp, isJoined);
        outMask = vec4f(outMask.x, outMask.y + maskM, outMask.z, outMask.w);
        let maskY = colorMask(uvY_val, cellCenterPos(uvY_val, cellOffset, 2.0), cmykOriginal.z, insideImageBox, grain, u.u_floodY, u.u_gainY, generalComp, isJoined);
        outMask = vec4f(outMask.x, outMask.y, outMask.z + maskY, outMask.w);
        let maskK = colorMask(uvK, cellCenterPos(uvK, cellOffset, 3.0), cmykOriginal.w, insideImageBox, grain, u.u_floodK, u.u_gainK, generalComp, isJoined);
        outMask = vec4f(outMask.x, outMask.y, outMask.z, outMask.w + maskK);
      }
    }
  }

  var C_val = outMask.x;
  var M_val = outMask.y;
  var Y_val = outMask.z;
  var K_val = outMask.w;

  if (isJoined) {
    // ink or sharp: apply threshold for joined dots
    let th: f32 = 0.5;
    let sLeft = th * u.u_softness;
    let sRight = (1.0 - th) * u.u_softness + 0.01;
    C_val = smoothstep(th - sLeft - fwidth_f32(C_val), th + sRight, C_val);
    M_val = smoothstep(th - sLeft - fwidth_f32(M_val), th + sRight, M_val);
    Y_val = smoothstep(th - sLeft - fwidth_f32(Y_val), th + sRight, Y_val);
    K_val = smoothstep(th - sLeft - fwidth_f32(K_val), th + sRight, K_val);
  }

  C_val *= u.u_colorC.a;
  M_val *= u.u_colorM.a;
  Y_val *= u.u_colorY.a;
  K_val *= u.u_colorK.a;

  var ink = vec3f(1.0);
  ink = applyInk(ink, u.u_colorK.rgb, K_val);
  ink = applyInk(ink, u.u_colorC.rgb, C_val);
  ink = applyInk(ink, u.u_colorM.rgb, M_val);
  ink = applyInk(ink, u.u_colorY.rgb, Y_val);

  let shape = clamp(max(max(C_val, M_val), max(Y_val, K_val)), 0.0, 1.0);

  var color = u.u_colorBack.rgb * u.u_colorBack.a;

  var opacity = u.u_colorBack.a;
  color = mix(color, ink, shape);
  opacity += shape;
  opacity = clamp(opacity, 0.0, 1.0);

  var grainOverlay = mix(noiseValues.g, noiseValues.b, 0.5);
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

export interface HalftoneCmykUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_noiseTexture?: HTMLImageElement;
  u_colorBack: [number, number, number, number];
  u_colorC: [number, number, number, number];
  u_colorM: [number, number, number, number];
  u_colorY: [number, number, number, number];
  u_colorK: [number, number, number, number];
  u_size: number;
  u_contrast: number;
  u_softness: number;
  u_grainSize: number;
  u_grainMixer: number;
  u_grainOverlay: number;
  u_gridNoise: number;
  u_floodC: number;
  u_floodM: number;
  u_floodY: number;
  u_floodK: number;
  u_gainC: number;
  u_gainM: number;
  u_gainY: number;
  u_gainK: number;
  u_type: (typeof HalftoneCmykTypes)[HalftoneCmykType];
}

export interface HalftoneCmykParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorBack?: string;
  colorC?: string;
  colorM?: string;
  colorY?: string;
  colorK?: string;
  size?: number;
  contrast?: number;
  softness?: number;
  grainSize?: number;
  grainMixer?: number;
  grainOverlay?: number;
  gridNoise?: number;
  floodC?: number;
  floodM?: number;
  floodY?: number;
  floodK?: number;
  gainC?: number;
  gainM?: number;
  gainY?: number;
  gainK?: number;
  type?: HalftoneCmykType;
}

export const HalftoneCmykTypes = {
  dots: 0,
  ink: 1,
  sharp: 2,
} as const;

export type HalftoneCmykType = keyof typeof HalftoneCmykTypes;


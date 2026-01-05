import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2 } from '../shader-utils.js';

export const halftoneCmykMeta = {
  maxBlurRadius: 8,
} as const;

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
 * - u_rounded (bool): Use per-cell color sampling (true) or blurred sampling (false)
 * - u_grainSize (float): Size of grain overlay texture (0 to 1)
 * - u_grainMixer (float): Strength of grain affecting dot size (0 to 1)
 * - u_grainOverlay (float): Strength of grain overlay on final output (0 to 1)
 * - u_gridNoise (float): Strength of smooth noise applied to both dot positions and color sampling (0 to 1)
 * - u_addonC (float): Flat cyan dot size adjustment applied uniformly (-1 to 1)
 * - u_addonM (float): Flat magenta dot size adjustment applied uniformly (-1 to 1)
 * - u_addonY (float): Flat yellow dot size adjustment applied uniformly (-1 to 1)
 * - u_addonK (float): Flat black dot size adjustment applied uniformly (-1 to 1)
 * - u_boostC (float): Proportional cyan dot size boost (enhances existing dots, -1 to 1)
 * - u_boostM (float): Proportional magenta dot size boost (enhances existing dots, -1 to 1)
 * - u_boostY (float): Proportional yellow dot size boost (enhances existing dots, -1 to 1)
 * - u_boostK (float): Proportional black dot size boost (enhances existing dots, -1 to 1)
 * - u_shape (float): Dot shape style (0 = separate, 1 = joined)
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

// language=GLSL
export const halftoneCmykFragmentShader: string = `#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec4 u_colorBack;
uniform vec4 u_colorC;
uniform vec4 u_colorM;
uniform vec4 u_colorY;
uniform vec4 u_colorK;
uniform float u_size;
uniform float u_minDot;
uniform float u_contrast;
uniform float u_grainSize;
uniform float u_grainMixer;
uniform float u_grainOverlay;
uniform float u_gridNoise;
uniform float u_softness;
uniform bool u_rounded;
uniform float u_addonC;
uniform float u_addonM;
uniform float u_addonY;
uniform float u_addonK;
uniform float u_boostC;
uniform float u_boostM;
uniform float u_boostY;
uniform float u_boostK;
uniform float u_shape;
uniform sampler2D u_noiseTexture;

in vec2 v_imageUV;
out vec4 fragColor;

const float radC = radians(15.);
const float radM = radians(75.);
const float radY = radians(0.);
const float radK = radians(45.);
const float shiftC = -.5;
const float shiftM = -.25;
const float shiftY = .2;
const float shiftK = 0.;

${ declarePI }
${ rotation2 }

vec2 randomRG(vec2 p) {
  vec2 uv = floor(p) / 100. + .5;
  return texture(u_noiseTexture, fract(uv)).rg;
}
vec3 hash23(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.3183099, 0.3678794, 0.3141592)) + 0.1;
  p3 += dot(p3, p3.yzx + 19.19);
  return fract(vec3(p3.x * p3.y, p3.y * p3.z, p3.z * p3.x));
}

float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

vec3 valueNoise3(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  vec3 a = hash23(i);
  vec3 b = hash23(i + vec2(1.0, 0.0));
  vec3 c = hash23(i + vec2(0.0, 1.0));
  vec3 d = hash23(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  vec3 x1 = mix(a, b, u.x);
  vec3 x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float getUvFrame(vec2 uv, vec2 pad) {
  float left   = smoothstep(-pad.x, pad.x, uv.x);
  float right  = smoothstep(1. + pad.x, 1. - pad.x, uv.x);
  float bottom = smoothstep(-pad.y, pad.y, uv.y);
  float top    = smoothstep(1. + pad.y, 1. - pad.y, uv.y);

  return left * right * bottom * top;
}

vec4 RGBtoCMYK(vec3 rgb) {
  float k = 1. - max(max(rgb.r, rgb.g), rgb.b);
  float denom = 1. - k;
  vec3 cmy = vec3(0.);
  if (denom > 1e-5) {
    cmy = (1. - rgb - vec3(k)) / denom;
  }
  return vec4(cmy, k);
}

vec3 applyContrast(vec3 rgb) {
  return clamp((rgb - 0.5) * u_contrast + 0.5, 0.0, 1.0);
}

vec2 getJitter(vec2 cellPos, float channelIdx) {
  return (randomRG(cellPos + channelIdx * 50.) - .5) * u_gridNoise;
}

vec2 gridToImageUV(vec2 cellPos, vec2 jitter, float angle, float shift, vec2 pad) {
  vec2 cellCenter = cellPos + jitter - shift;
  vec2 uvGrid = rotate(cellCenter, -angle);
  return uvGrid * pad + 0.5;
}

void colorMask(vec2 pos, vec2 cellPos, vec2 jitter, float rad, float outOfFrame, float grain, float channelAddon, float channelBoost, float generalComp, inout float outMask) {
  vec2 cell = cellPos + jitter;
  float dist = length(pos - cell);

  float radius = rad;
  radius *= (1. + generalComp);
  radius += channelAddon + channelBoost * radius;
  radius += .15;
  radius = max(0., radius);
  radius = mix(0., radius, outOfFrame);
  radius *= (1. - grain);

  float mask = 1. - sst(0., radius, dist);
  if (u_shape > 0.5) {
    // joined
    mask = pow(mask, 1.2);
  } else {
    // separate
    mask = sst(.5 - .5 * u_softness, .51 + .49 * u_softness, mask);
  }

  mask *= mix(1., mix(.5, 1., 1.5 * radius), u_softness);
  outMask += mask;
}

vec3 applyInk(vec3 paper, vec3 inkColor, float cov) {
  vec3 inkEffect = mix(vec3(1.0), inkColor, clamp(cov, 0.0, 1.0));
  return paper * inkEffect;
}

void main() {
  vec2 uv = v_imageUV;

  float cellsPerSide = mix(400.0, 7.0, pow(u_size, 0.7));
  float cellSizeY = 1.0 / cellsPerSide;
  vec2 pad = cellSizeY * vec2(1.0 / u_imageAspectRatio, 1.0);
  vec2 uvGrid = (uv - .5) / pad;
  float outOfFrame = getUvFrame(uv, .5 * pad);

  float generalComp = .1 * u_softness + .1 * u_gridNoise;

  vec2 uvC = rotate(uvGrid, radC) + shiftC;
  vec2 uvM = rotate(uvGrid, radM) + shiftM;
  vec2 uvY = rotate(uvGrid, radY) + shiftY;
  vec2 uvK = rotate(uvGrid, radK) + shiftK;

  vec2 grainSize = mix(2000., 200., u_grainSize) * vec2(1., 1. / u_imageAspectRatio);
  vec2 grainUV = (v_imageUV - .5) * grainSize + .5;
  vec3 noiseValues = valueNoise3(grainUV);
  float grain = sst(.55, 1., noiseValues.r);
  grain *= u_grainMixer;

  vec4 outMask = vec4(0.);

  if (u_rounded == true) {
    for (int dy = -1; dy <= 1; dy++) {
      for (int dx = -1; dx <= 1; dx++) {
        vec2 cellOffset = vec2(float(dx), float(dy));

        vec2 cellPosC = floor(uvC) + .5 + cellOffset;
        vec2 jitterC = getJitter(cellPosC, 0.);
        vec3 rgb = texture(u_image, gridToImageUV(cellPosC, jitterC, radC, shiftC, pad)).rgb;
        rgb = applyContrast(rgb);
        vec4 cmykC = RGBtoCMYK(rgb);
        colorMask(uvC, cellPosC, jitterC, cmykC.x, outOfFrame, grain, u_addonC, u_boostC, generalComp, outMask[0]);

        vec2 cellPosM = floor(uvM) + .5 + cellOffset;
        vec2 jitterM = getJitter(cellPosM, 1.);
        rgb = texture(u_image, gridToImageUV(cellPosM, jitterM, radM, shiftM, pad)).rgb;
        rgb = applyContrast(rgb);
        vec4 cmykM = RGBtoCMYK(rgb);
        colorMask(uvM, cellPosM, jitterM, cmykM.y, outOfFrame, grain, u_addonM, u_boostM, generalComp, outMask[1]);

        vec2 cellPosY = floor(uvY) + .5 + cellOffset;
        vec2 jitterY = getJitter(cellPosY, 2.);
        rgb = texture(u_image, gridToImageUV(cellPosY, jitterY, radY, shiftY, pad)).rgb;
        rgb = applyContrast(rgb);
        vec4 cmykY = RGBtoCMYK(rgb);
        colorMask(uvY, cellPosY, jitterY, cmykY.z, outOfFrame, grain, u_addonY, u_boostY, generalComp, outMask[2]);

        vec2 cellPosK = floor(uvK) + .5 + cellOffset;
        vec2 jitterK = getJitter(cellPosK, 3.);
        rgb = texture(u_image, gridToImageUV(cellPosK, jitterK, radK, shiftK, pad)).rgb;
        rgb = applyContrast(rgb);
        vec4 cmykK = RGBtoCMYK(rgb);
        colorMask(uvK, cellPosK, jitterK, cmykK.w, outOfFrame, grain, u_addonK, u_boostK, generalComp, outMask[3]);
      }
    }
  } else {
    vec3 rgb = texture(u_image, uv).rgb;
    rgb = applyContrast(rgb);
    vec4 cmykOriginal = RGBtoCMYK(rgb);
    for (int dy = -1; dy <= 1; dy++) {
      for (int dx = -1; dx <= 1; dx++) {
        vec2 cellOffset = vec2(float(dx), float(dy));

        vec2 cellPosC = floor(uvC) + .5 + cellOffset;
        vec2 jitterC = getJitter(cellPosC, 0.);
        colorMask(uvC, cellPosC, jitterC, cmykOriginal.x, outOfFrame, grain, u_addonC, u_boostC, generalComp, outMask[0]);

        vec2 cellPosM = floor(uvM) + .5 + cellOffset;
        vec2 jitterM = getJitter(cellPosM, 1.);
        colorMask(uvM, cellPosM, jitterM, cmykOriginal.y, outOfFrame, grain, u_addonM, u_boostM, generalComp, outMask[1]);

        vec2 cellPosY = floor(uvY) + .5 + cellOffset;
        vec2 jitterY = getJitter(cellPosY, 2.);
        colorMask(uvY, cellPosY, jitterY, cmykOriginal.z, outOfFrame, grain, u_addonY, u_boostY, generalComp, outMask[2]);

        vec2 cellPosK = floor(uvK) + .5 + cellOffset;
        vec2 jitterK = getJitter(cellPosK, 3.);
        colorMask(uvK, cellPosK, jitterK, cmykOriginal.w, outOfFrame, grain, u_addonK, u_boostK, generalComp, outMask[3]);
      }
    }
  }

  float shape;

  float C = outMask[0];
  float M = outMask[1];
  float Y = outMask[2];
  float K = outMask[3];

  if (u_shape > 0.5) {
    float th = .5;
    float sLeft = th * u_softness;
    float sRight = (1. - th) * u_softness + .01;
    C = smoothstep(th - sLeft - fwidth(C), th + sRight, C);
    M = smoothstep(th - sLeft - fwidth(M), th + sRight, M);
    Y = smoothstep(th - sLeft - fwidth(Y), th + sRight, Y);
    K = smoothstep(th - sLeft - fwidth(K), th + sRight, K);
  }

  C *= u_colorC.a;
  M *= u_colorM.a;
  Y *= u_colorY.a;
  K *= u_colorK.a;

  vec3 ink = vec3(1.);
  ink = applyInk(ink, u_colorK.rgb, K);
  ink = applyInk(ink, u_colorC.rgb, C);
  ink = applyInk(ink, u_colorM.rgb, M);
  ink = applyInk(ink, u_colorY.rgb, Y);

  shape = clamp(max(max(C, M), max(Y, K)), 0., 1.);

  vec3 color = u_colorBack.rgb * u_colorBack.a;
  float opacity = u_colorBack.a;
  color = mix(color, ink, shape);
  opacity += shape;
  opacity = clamp(opacity, 0., 1.);

  float grainOverlay = mix(noiseValues.g, noiseValues.b, .5);
  grainOverlay = pow(grainOverlay, 1.3);

  float grainOverlayV = grainOverlay * 2. - 1.;
  vec3 grainOverlayColor = vec3(step(0., grainOverlayV));
  float grainOverlayStrength = u_grainOverlay * abs(grainOverlayV);
  grainOverlayStrength = pow(grainOverlayStrength, .8);
  color = mix(color, grainOverlayColor, .5 * grainOverlayStrength);

  opacity += .5 * grainOverlayStrength;
  opacity = clamp(opacity, 0., 1.);

  fragColor = vec4(color, opacity);
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
  u_rounded: boolean;
  u_grainSize: number;
  u_grainMixer: number;
  u_grainOverlay: number;
  u_gridNoise: number;
  u_addonC: number;
  u_addonM: number;
  u_addonY: number;
  u_addonK: number;
  u_boostC: number;
  u_boostM: number;
  u_boostY: number;
  u_boostK: number;
  u_shape: (typeof HalftoneCmykShapes)[HalftoneCmykShape];
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
  rounded?: boolean;
  grainSize?: number;
  grainMixer?: number;
  grainOverlay?: number;
  gridNoise?: number;
  addonC?: number;
  addonM?: number;
  addonY?: number;
  addonK?: number;
  boostC?: number;
  boostM?: number;
  boostY?: number;
  boostK?: number;
  shape?: HalftoneCmykShape;
}

export const HalftoneCmykShapes = {
  separate: 0,
  joined: 1,
} as const;

export type HalftoneCmykShape = keyof typeof HalftoneCmykShapes;


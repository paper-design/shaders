import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2, proceduralHash21 } from '../shader-utils.js';

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
 * - u_gridSampleNoise (float): Strength of smooth noise applied to both dot positions and color sampling (0 to 1)
 * - u_compensationC (float): Manual cyan dot size compensation factor (-1 to 1, 0 = no change)
 * - u_compensationM (float): Manual magenta dot size compensation factor (-1 to 1, 0 = no change)
 * - u_compensationY (float): Manual yellow dot size compensation factor (-1 to 1, 0 = no change)
 * - u_compensationK (float): Manual black dot size compensation factor (-1 to 1, 0 = no change)
 * - u_shape (float): Dot shape style (0 = separate, 1 = joined)
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
uniform float u_gridSampleNoise;
uniform float u_softness;
uniform bool u_rounded;
uniform float u_compensationC;
uniform float u_compensationM;
uniform float u_compensationY;
uniform float u_compensationK;
uniform float u_shape;

in vec2 v_imageUV;
out vec4 fragColor;

const float angleC = 15.;
const float angleM = 75.;
const float angleY = 0.;
const float angleK = 45.;
const float shiftC = -.5;
const float shiftM = -.25;
const float shiftY = .2;
const float shiftK = 0.;

${ declarePI }
${ rotation2 }
${ proceduralHash21 }

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float getUvFrame(vec2 uv, vec2 pad) {
  float aa = 0.01;

  float left   = smoothstep(0., pad.x, uv.x);
  float right  = smoothstep(1., 1. - pad.x, uv.x);
  float bottom = smoothstep(0., pad.y, uv.y);
  float top    = smoothstep(1., 1. - pad.y, uv.y);

  return left * right * bottom * top;
}

float conpensationCurve(float v) {
  float comp = pow(abs(v), 2.);
  if (v < 0.) {
    return -comp;
  } else {
    return .5 * comp;
  }
}

vec4 RGBtoCMYK(vec3 rgb) {
  float k = 1.0 - max(max(rgb.r, rgb.g), rgb.b);
  float denom = 1.0 - k;
  vec3 cmy = vec3(0.0);
  if (denom > 1e-5) {
    cmy = (1.0 - rgb - vec3(k)) / denom;
  }

  cmy.x *= (1. + conpensationCurve(u_compensationC));
  cmy.y *= (1. + conpensationCurve(u_compensationM));
  cmy.z *= (1. + conpensationCurve(u_compensationY));
  k *= (1. + conpensationCurve(u_compensationK));

  return 1.3 * vec4(cmy, k) + .1 * u_softness + .1 * u_gridSampleNoise;
}

float sigmoid01(float x, float k) {
  float s  = 1.0 / (1.0 + exp(-k * (x - 0.5)));
  float s0 = 1.0 / (1.0 + exp(0.5 * k));// x = 0
  float s1 = 1.0 / (1.0 + exp(-0.5 * k));// x = 1
  return (s - s0) / max(s1 - s0, 1e-5);
}

vec3 applyContrast(vec3 rgb) {
  float c = clamp(u_contrast, 0.0, 2.0);
  vec3 low = mix(vec3(0.5), rgb, c);// c in [0..1]
  float t = max(c - 1.0, 0.0);// [0..1]
  float k = 15.0 * t;

  vec3 sig = vec3(
  sigmoid01(rgb.r, k),
  sigmoid01(rgb.g, k),
  sigmoid01(rgb.b, k)
  );

  vec3 high = mix(rgb, sig, sst(0.0, 0.01, k));
  return mix(low, high, step(1.0, c));
}

vec2 gridToImageUV(vec2 gridPos, float angle, float shift, vec2 pad, float channelIdx) {
  vec2 cellPos = floor(gridPos) + .5;

  float randAngle = hash21(cellPos + channelIdx * 50.) * 2. * PI;
  float randDist = u_gridSampleNoise * 0.5;
  vec2 sampleJitter = vec2(cos(randAngle), sin(randAngle)) * randDist;

  vec2 cellCenter = cellPos + sampleJitter;
  cellCenter -= shift;
  vec2 uvGrid = rotate(cellCenter, -radians(angle));
  vec2 uv = uvGrid * pad + 0.5;
  return uv;
}

void colorMask(vec2 p, vec2 cellOffset, float radius, float channelIdx, inout float outMask) {
  vec2 cellPos = floor(p) + .5 + cellOffset;

  float randAngle = hash21(cellPos + channelIdx * 50.) * 2. * PI;
  float randDist = u_gridSampleNoise * 0.5;
  vec2 jitter = vec2(cos(randAngle), sin(randAngle)) * randDist;

  vec2 cell = cellPos + jitter;
  float dist = length(p - cell);
  float smallDots = mix(0.2, 0., sst(0., .45, radius));
  float mask = 1. - sst(0., radius + smallDots, dist);
  mask *= (1. - 2. * smallDots);
  
  if (u_shape > 0.5) {
  } else {
    float aa = fwidth(mask);
    mask = sst(.5 - .5 * u_softness, .51 + .49 * u_softness, mask);
  }
  
  outMask += mask;
}

float channelValue(float v, float outOfFrame, float grain) {
  return (v * (1. - grain)) * outOfFrame;
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
  float outOfFrame = getUvFrame(uv, pad);

  if (outOfFrame < 0.001) {
    fragColor = vec4(u_colorBack.rgb * u_colorBack.a, u_colorBack.a);
    return;
  }

  vec2 pC = rotate(uvGrid, radians(angleC));
  pC += shiftC;
  vec2 pM = rotate(uvGrid, radians(angleM));
  pM += shiftM;
  vec2 pY = rotate(uvGrid, radians(angleY));
  pY += shiftY;
  vec2 pK = rotate(uvGrid, radians(angleK));
  pK += shiftK;

  vec2 grainSize = mix(2000., 200., u_grainSize) * vec2(1., 1. / u_imageAspectRatio);
  vec2 grainUV = v_imageUV - .5;
  grainUV *= grainSize;
  grainUV += .5;
  float grain = valueNoise(grainUV);
  grain = sst(.55, 1., grain);
  grain *= u_grainMixer;

  vec3 rgb = vec3(0.);
  vec4 outMask = vec4(0.);
  float contrast = mix(
  u_contrast,
  1.0 + (u_contrast - 1.0) * 14.0,
  step(1.0, u_contrast)
  );


  if (u_rounded == true) {
    for (int dy = -1; dy <= 1; dy++) {
      for (int dx = -1; dx <= 1; dx++) {
        vec2 cellOffset = vec2(float(dx), float(dy));

        rgb = texture(u_image, gridToImageUV(pC + cellOffset, angleC, shiftC, pad, 0.)).rgb;
        rgb = applyContrast(rgb);
        vec4 cmykC = RGBtoCMYK(rgb);
        colorMask(pC, cellOffset, channelValue(cmykC.x, outOfFrame, grain), 0., outMask[0]);

        rgb = texture(u_image, gridToImageUV(pM + cellOffset, angleM, shiftM, pad, 1.)).rgb;
        rgb = applyContrast(rgb);
        vec4 cmykM = RGBtoCMYK(rgb);
        colorMask(pM, cellOffset, channelValue(cmykM.y, outOfFrame, grain), 1., outMask[1]);

        rgb = texture(u_image, gridToImageUV(pY + cellOffset, angleY, shiftY, pad, 2.)).rgb;
        rgb = applyContrast(rgb);
        vec4 cmykY = RGBtoCMYK(rgb);
        colorMask(pY, cellOffset, channelValue(cmykY.z, outOfFrame, grain), 2., outMask[2]);

        rgb = texture(u_image, gridToImageUV(pK + cellOffset, angleK, shiftK, pad, 3.)).rgb;
        rgb = applyContrast(rgb);
        vec4 cmykK = RGBtoCMYK(rgb);
        colorMask(pK, cellOffset, channelValue(cmykK.w, outOfFrame, grain), 3., outMask[3]);
      }
    }
  } else {
    vec3 rgb = texture(u_image, uv).rgb;
    rgb = applyContrast(rgb);
    vec4 cmykOriginal = RGBtoCMYK(rgb);
    for (int dy = -1; dy <= 1; dy++) {
      for (int dx = -1; dx <= 1; dx++) {
        vec2 cellOffset = vec2(float(dx), float(dy));

        colorMask(pC, cellOffset, channelValue(cmykOriginal.x, outOfFrame, grain), 0., outMask[0]);
        colorMask(pM, cellOffset, channelValue(cmykOriginal.y, outOfFrame, grain), 1., outMask[1]);
        colorMask(pY, cellOffset, channelValue(cmykOriginal.z, outOfFrame, grain), 2., outMask[2]);
        colorMask(pK, cellOffset, channelValue(cmykOriginal.w, outOfFrame, grain), 3., outMask[3]);
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
    C = smoothstep(th - sLeft, th + sRight, C);
    M = smoothstep(th - sLeft, th + sRight, M);
    Y = smoothstep(th - sLeft, th + sRight, Y);
    K = smoothstep(th - sLeft, th + sRight, K);
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

  float grainOverlay = valueNoise(rotate(grainUV, 1.) + vec2(3.));
  grainOverlay = mix(grainOverlay, valueNoise(rotate(grainUV, 2.) + vec2(-1.)), .5);
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
  u_gridSampleNoise: number;
  u_compensationC: number;
  u_compensationM: number;
  u_compensationY: number;
  u_compensationK: number;
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
  gridSampleNoise?: number;
  compensationC?: number;
  compensationM?: number;
  compensationY?: number;
  compensationK?: number;
  shape?: HalftoneCmykShape;
}

export const HalftoneCmykShapes = {
  separate: 0,
  joined: 1,
} as const;

export type HalftoneCmykShape = keyof typeof HalftoneCmykShapes;


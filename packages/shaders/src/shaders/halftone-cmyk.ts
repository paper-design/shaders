import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2, proceduralHash21 } from '../shader-utils.js';

export const halftoneCmykMeta = {
  maxBlurRadius: 8,
} as const;

/**
 * CMYK halftone printing effect applied to images with customizable dot/line patterns,
 * angles, and ink colors for each channel (Cyan, Magenta, Yellow, Black).
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
 * - u_radius (float): Dot/line thickness (0 to 1)
 * - u_angleC (float): Cyan channel rotation angle in degrees
 * - u_angleM (float): Magenta channel rotation angle in degrees
 * - u_angleY (float): Yellow channel rotation angle in degrees
 * - u_angleK (float): Black channel rotation angle in degrees
 * - u_shiftC (float): Cyan channel position offset
 * - u_shiftM (float): Magenta channel position offset
 * - u_shiftY (float): Yellow channel position offset
 * - u_shiftK (float): Black channel position offset
 * - u_contrast (float): Image contrast adjustment (0 to 2)
 * - u_smoothness (float): Smoothness of halftone pattern (0 to 1)
 * - u_softness (float): Edge softness of dots/lines (0 to 1)
 * - u_rounded (bool): Use per-cell color sampling (true) or blurred sampling (false)
 * - u_grainSize (float): Size of grain overlay texture (0 to 1)
 * - u_grainMixer (float): Strength of grain affecting dot size (0 to 1)
 * - u_grainOverlay (float): Strength of grain overlay on final output (0 to 1)
 * - u_type (float): Halftone type (0 = dots, 1 = lines)
 * - u_compensationC (float): Manual cyan dot size compensation factor (0.5 to 1.5, default 1.0)
 * - u_compensationM (float): Manual magenta dot size compensation factor (0.5 to 1.5, default 1.0)
 * - u_compensationY (float): Manual yellow dot size compensation factor (0.5 to 1.5, default 1.0)
 * - u_compensationK (float): Manual black dot size compensation factor (0.5 to 1.5, default 1.0)
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
uniform float u_radius;
uniform float u_angleC;
uniform float u_angleM;
uniform float u_angleY;
uniform float u_angleK;
uniform float u_shiftC;
uniform float u_shiftM;
uniform float u_shiftY;
uniform float u_shiftK;
uniform float u_contrast;
uniform float u_grainSize;
uniform float u_grainMixer;
uniform float u_grainOverlay;
uniform float u_smoothness;
uniform float u_softness;
uniform bool u_rounded;
uniform float u_type;
uniform float u_compensationC;
uniform float u_compensationM;
uniform float u_compensationY;
uniform float u_compensationK;

in vec2 v_imageUV;
out vec4 fragColor;

${ declarePI }
${ rotation2 }
${ proceduralHash21 }

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

vec4 RGBtoCMYK(vec3 rgb) {
  // Standard CMYK conversion
  float k = 1.0 - max(max(rgb.r, rgb.g), rgb.b);
  float denom = 1.0 - k;
  vec3 cmy = vec3(0.0);
  if (denom > 1e-5) {
    cmy = (1.0 - rgb - vec3(k)) / denom;
  }

  // Apply manual compensation factors to adjust dot sizes for non-standard ink colors
  // Values > 1.0 = larger dots, values < 1.0 = smaller dots
  cmy.x *= u_compensationC;
  cmy.y *= u_compensationM;
  cmy.z *= u_compensationY;
  k *= u_compensationK;

  return vec4(cmy, k);
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

  vec3 high = mix(rgb, sig, smoothstep(0.0, 0.01, k));
  return mix(low, high, step(1.0, c));
}

vec4 blurTexture(sampler2D tex, vec2 uv, vec2 texelSize, float radius) {
  float r = clamp(radius, 0., float(${ halftoneCmykMeta.maxBlurRadius }));
  int ir = int(r);

  vec4 acc = vec4(0.0);
  float weightSum = 0.0;
  for (int y = -${ halftoneCmykMeta.maxBlurRadius }; y <= ${ halftoneCmykMeta.maxBlurRadius }; ++y) {
    if (abs(y) > ir) continue;
    for (int x = -${ halftoneCmykMeta.maxBlurRadius }; x <= ${ halftoneCmykMeta.maxBlurRadius }; ++x) {
      if (abs(x) > ir) continue;

      vec2 offset = vec2(float(x), float(y));
      float dist2 = dot(offset, offset);

      // tweak sigma to taste; lower sigma = sharper falloff
      float sigma = radius * 0.5 + 0.001;
      float w = exp(-dist2 / (2.0 * sigma * sigma));

      acc += texture(tex, uv + offset * texelSize) * w;
      weightSum += w;
    }
  }

  return acc / max(weightSum, 0.00001);
}

vec2 gridToImageUV(vec2 gridPos, float angle, float shift, vec2 pad) {
  vec2 cellCenter = floor(gridPos) + 0.5;
  cellCenter -= shift;
  vec2 uvGrid = rotate(cellCenter, -radians(angle));
  vec2 uv = uvGrid * pad + 0.5;
  return uv;
}

void computeDotContribution(vec2 p, vec2 cellOffset, float radius, inout float outMask) {
  vec2 cell = floor(p) + .5 + cellOffset;
  float dist = length(p - cell);
  dist *= mix(1., .5, u_softness);
  float mask = 1. - smoothstep(radius * (1. - u_softness), radius + .02, dist);
  outMask = max(outMask, mask);
}

void computeLineContribution(vec2 p, vec2 cellOffset, float halfWidth, inout float outMask) {
  float cellY = floor(p.y) + 0.5 + cellOffset.y;
  float dist = abs(p.y - cellY);
  dist *= mix(1., .5, u_softness);
  float mask = 1. - smoothstep(halfWidth * (1. - u_softness), halfWidth, dist);
  outMask = max(outMask, mask);
}

vec2 lineToImageUV(vec2 gridPos, float yOffset, float angle, float shift, vec2 pad) {
  float lineY = floor(gridPos.y) + 0.5 + yOffset;
  vec2 pointOnLine = vec2(gridPos.x, lineY);
  pointOnLine -= shift;
  vec2 uvGrid = rotate(pointOnLine, -radians(angle));
  vec2 uv = uvGrid * pad + 0.5;
  return uv;
}

float dotRadius(float channelValue, float baseR, float grain) {
  return baseR * channelValue * (1. - grain);
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

  vec2 pC = rotate(uvGrid, radians(u_angleC));
  pC += u_shiftC;
  vec2 pM = rotate(uvGrid, radians(u_angleM));
  pM += u_shiftM;
  vec2 pY = rotate(uvGrid, radians(u_angleY));
  pY += u_shiftY;
  vec2 pK = rotate(uvGrid, radians(u_angleK));
  pK += u_shiftK;

  vec2 grainSize = mix(2000., 200., u_grainSize) * vec2(1., 1. / u_imageAspectRatio);
  vec2 grainUV = v_imageUV - .5;
  grainUV *= grainSize;
  grainUV += .5;
  float grain = valueNoise(grainUV);
  grain = smoothstep(.55, 1., grain);
  grain *= u_grainMixer;

  float baseR = u_radius * outOfFrame;
  vec3 rgb = vec3(0.);
  vec4 outMask = vec4(0.);
  float contrast = mix(
  u_contrast,
  1.0 + (u_contrast - 1.0) * 14.0,
  step(1.0, u_contrast)
  );

  if (u_type > .5) {
    // LINE MODE
    if (u_rounded == true) {
      // Sample color at fragment's position on each line
      for (int dy = -1; dy <= 1; dy++) {
        float yOffset = float(dy);

        baseR *= .8;
        rgb = texture(u_image, lineToImageUV(pC, yOffset, u_angleC, u_shiftC, pad)).rgb;
        rgb = applyContrast(rgb);
        vec4 cmykC = RGBtoCMYK(rgb);
        computeLineContribution(pC, vec2(0.0, yOffset), dotRadius(cmykC.x, baseR * u_colorC.a, grain), outMask[0]);

        rgb = texture(u_image, lineToImageUV(pM, yOffset, u_angleM, u_shiftM, pad)).rgb;
        rgb = applyContrast(rgb);
        vec4 cmykM = RGBtoCMYK(rgb);
        computeLineContribution(pM, vec2(0.0, yOffset), dotRadius(cmykM.y, baseR * u_colorM.a, grain), outMask[1]);

        rgb = texture(u_image, lineToImageUV(pY, yOffset, u_angleY, u_shiftY, pad)).rgb;
        rgb = applyContrast(rgb);
        vec4 cmykY = RGBtoCMYK(rgb);
        computeLineContribution(pY, vec2(0.0, yOffset), dotRadius(cmykY.z, baseR * u_colorY.a, grain), outMask[2]);

        rgb = texture(u_image, lineToImageUV(pK, yOffset, u_angleK, u_shiftK, pad)).rgb;
        rgb = applyContrast(rgb);
        vec4 cmykK = RGBtoCMYK(rgb);
        computeLineContribution(pK, vec2(0.0, yOffset), dotRadius(cmykK.w, baseR * u_colorK.a, grain), outMask[3]);
      }
    } else {
      baseR *= .9;
      vec4 texBlur = texture(u_image, uv);
//      rgb = texBlur.rgb;
      rgb = applyContrast(texBlur.rgb);
      vec4 cmykOriginal = RGBtoCMYK(rgb);
      for (int dy = -1; dy <= 1; dy++) {
        vec2 cellOffset = vec2(0.0, float(dy));

        computeLineContribution(pC, cellOffset, dotRadius(cmykOriginal.x, baseR * u_colorC.a, grain), outMask[0]);
        computeLineContribution(pM, cellOffset, dotRadius(cmykOriginal.y, baseR * u_colorM.a, grain), outMask[1]);
        computeLineContribution(pY, cellOffset, dotRadius(cmykOriginal.z, baseR * u_colorY.a, grain), outMask[2]);
        computeLineContribution(pK, cellOffset, dotRadius(cmykOriginal.w, baseR * u_colorK.a, grain), outMask[3]);
      }
    }
  } else {
    // DOT MODE (original)
    if (u_rounded == true) {
      for (int dy = -1; dy <= 1; dy++) {
        for (int dx = -1; dx <= 1; dx++) {
          vec2 cellOffset = vec2(float(dx), float(dy));

          rgb = texture(u_image, gridToImageUV(pC + cellOffset, u_angleC, u_shiftC, pad)).rgb;
          rgb = applyContrast(rgb);
          vec4 cmykC = RGBtoCMYK(rgb);
          computeDotContribution(pC, cellOffset, dotRadius(cmykC.x, baseR * u_colorC.a, grain), outMask[0]);

          rgb = texture(u_image, gridToImageUV(pM + cellOffset, u_angleM, u_shiftM, pad)).rgb;
          rgb = applyContrast(rgb);
          vec4 cmykM = RGBtoCMYK(rgb);
          computeDotContribution(pM, cellOffset, dotRadius(cmykM.y, baseR * u_colorM.a, grain), outMask[1]);

          rgb = texture(u_image, gridToImageUV(pY + cellOffset, u_angleY, u_shiftY, pad)).rgb;
          rgb = applyContrast(rgb);
          vec4 cmykY = RGBtoCMYK(rgb);
          computeDotContribution(pY, cellOffset, dotRadius(cmykY.z, baseR * u_colorY.a, grain), outMask[2]);

          rgb = texture(u_image, gridToImageUV(pK + cellOffset, u_angleK, u_shiftK, pad)).rgb;
          rgb = applyContrast(rgb);
          vec4 cmykK = RGBtoCMYK(rgb);
          computeDotContribution(pK, cellOffset, dotRadius(cmykK.w, baseR * u_colorK.a, grain), outMask[3]);
        }
      }
    } else {
      vec4 texBlur = texture(u_image, uv);
//      rgb = texBlur.rgb;
      rgb = applyContrast(texBlur.rgb);
      vec4 cmykOriginal = RGBtoCMYK(rgb);
      for (int dy = -1; dy <= 1; dy++) {
        for (int dx = -1; dx <= 1; dx++) {
          vec2 cellOffset = vec2(float(dx), float(dy));

          computeDotContribution(pC, cellOffset, dotRadius(cmykOriginal.x, baseR * u_colorC.a, grain), outMask[0]);
          computeDotContribution(pM, cellOffset, dotRadius(cmykOriginal.y, baseR * u_colorM.a, grain), outMask[1]);
          computeDotContribution(pY, cellOffset, dotRadius(cmykOriginal.z, baseR * u_colorY.a, grain), outMask[2]);
          computeDotContribution(pK, cellOffset, dotRadius(cmykOriginal.w, baseR * u_colorK.a, grain), outMask[3]);
        }
      }
    }
  }

  float shape;

  float covC = outMask[0];
  float covM = outMask[1];
  float covY = outMask[2];
  float covK = outMask[3];

  vec3 ink = vec3(1.);

  ink = applyInk(ink, u_colorK.rgb, covK);
  ink = applyInk(ink, u_colorC.rgb, covC);
  ink = applyInk(ink, u_colorM.rgb, covM);
  ink = applyInk(ink, u_colorY.rgb, covY);

  shape = clamp(max(max(covC, covM), max(covY, covK)), 0.0, 1.0);

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
  u_radius: number;
  u_angleC: number;
  u_angleM: number;
  u_angleY: number;
  u_angleK: number;
  u_shiftC: number;
  u_shiftM: number;
  u_shiftY: number;
  u_shiftK: number;
  u_contrast: number;
  u_smoothness: number;
  u_softness: number;
  u_rounded: boolean;
  u_grainSize: number;
  u_grainMixer: number;
  u_grainOverlay: number;
  u_type: (typeof HalftoneCmykTypes)[HalftoneCmykType];
  u_compensationC: number;
  u_compensationM: number;
  u_compensationY: number;
  u_compensationK: number;
}

export interface HalftoneCmykParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorBack?: string;
  colorC?: string;
  colorM?: string;
  colorY?: string;
  colorK?: string;
  size?: number;
  radius?: number;
  angleC?: number;
  angleM?: number;
  angleY?: number;
  angleK?: number;
  shiftC?: number;
  shiftM?: number;
  shiftY?: number;
  shiftK?: number;
  contrast?: number;
  smoothness?: number;
  softness?: number;
  rounded?: boolean;
  grainSize?: number;
  grainMixer?: number;
  grainOverlay?: number;
  type?: HalftoneCmykType;
  compensationC?: number;
  compensationM?: number;
  compensationY?: number;
  compensationK?: number;
}

export const HalftoneCmykTypes = {
  dot: 0,
  line: 1,
} as const;

export type HalftoneCmykType = keyof typeof HalftoneCmykTypes;


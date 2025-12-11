import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2, proceduralHash21 } from '../shader-utils.js';

export const halftoneCmykMeta = {
  maxBlurRadius: 5,
} as const;

// language=GLSL
export const halftoneCmykFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_fit;

uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec4 u_colorBack;
uniform float u_size;
uniform float u_radius;
uniform float u_minRadius;
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
uniform float u_showDots;

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

vec2 getImageUV(vec2 uv, vec2 extraScale) {
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  float r = u_rotation * PI / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  vec2 imageBoxSize;
  if (u_fit == 1.) {
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  vec2 imageUV = uv;
  imageUV *= imageBoxScale;
  imageUV += boxOrigin * (imageBoxScale - 1.);
  imageUV += graphicOffset;
  imageUV /= u_scale;
  imageUV *= extraScale;
  imageUV.x *= u_imageAspectRatio;
  imageUV = graphicRotation * imageUV;
  imageUV.x /= u_imageAspectRatio;

  imageUV += .5;
  imageUV.y = 1. - imageUV.y;

  return imageUV;
}

float getUvFrame(vec2 uv, vec2 pad) {
  float aa = 0.01;

  float left   = smoothstep(0., pad.x, uv.x);
  float right  = smoothstep(1., 1. - pad.x, uv.x);
  float bottom = smoothstep(0., pad.y, uv.y);
  float top    = smoothstep(1., 1. - pad.y, uv.y);

  return left * right * bottom * top;
}

float sigmoid(float x, float k) {
  return 1.0 / (1.0 + exp(-k * (x - 0.5)));
}

vec4 RGBtoCMYK(vec3 rgb) {
  float k = 1.0 - max(max(rgb.r, rgb.g), rgb.b);
  float denom = 1.0 - k;
  vec3 cmy = vec3(0.0);
  if (denom > 1e-5) {
    cmy = (1.0 - rgb - vec3(k)) / denom;
  }
  return vec4(cmy, k);
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

float dotRadius(float channelValue, float baseR, float grain) {
  return baseR * mix(channelValue, 1.0, u_minRadius) * (1. - grain);
}

vec3 applyInk(vec3 paper, vec3 inkColor, float cov) {
  vec3 inkEffect = mix(vec3(1.0), inkColor, clamp(cov, 0.0, 1.0));
  return paper * inkEffect;
}

void main() {
  vec2 uvNormalised = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.xy;
  vec2 uv = getImageUV(uvNormalised, vec2(1.));

  float cellsPerSide = mix(300.0, 7.0, pow(u_size, 0.7));
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
  vec2 grainUV = getImageUV(uvNormalised, grainSize);
  float grain = valueNoise(grainUV);
  grain = smoothstep(.55, 1., grain);
  grain *= u_grainMixer;

  float baseR = u_radius * outOfFrame;
  vec4 outCmyk = vec4(0.);
  vec4 outMask = vec4(0.);

  if (u_showDots > 0.5) {
    for (int dy = -1; dy <= 1; dy++) {
      for (int dx = -1; dx <= 1; dx++) {
        vec2 cellOffset = vec2(float(dx), float(dy));

        vec4 cmykC = RGBtoCMYK(texture(u_image, gridToImageUV(pC + cellOffset, u_angleC, u_shiftC, pad)).rgb);
        computeDotContribution(pC, cellOffset, dotRadius(cmykC.x, baseR, grain), outMask[0]);

        vec4 cmykM = RGBtoCMYK(texture(u_image, gridToImageUV(pM + cellOffset, u_angleM, u_shiftM, pad)).rgb);
        computeDotContribution(pM, cellOffset, dotRadius(cmykM.y, baseR, grain), outMask[1]);

        vec4 cmykY = RGBtoCMYK(texture(u_image, gridToImageUV(pY + cellOffset, u_angleY, u_shiftY, pad)).rgb);
        computeDotContribution(pY, cellOffset, dotRadius(cmykY.z, baseR, grain), outMask[2]);

        vec4 cmykK = RGBtoCMYK(texture(u_image, gridToImageUV(pK + cellOffset, u_angleK, u_shiftK, pad)).rgb);
        computeDotContribution(pK, cellOffset, dotRadius(cmykK.w, baseR, grain), outMask[3]);
      }
    }
  } else {
    vec2 texelSize = 1.0 / u_resolution;
    vec4 texBlur = blurTexture(u_image, uv, texelSize, u_smoothness);
    vec4 cmykOriginal = RGBtoCMYK(texBlur.rgb);
    for (int dy = -1; dy <= 1; dy++) {
      for (int dx = -1; dx <= 1; dx++) {
        vec2 cellOffset = vec2(float(dx), float(dy));

        computeDotContribution(pC, cellOffset, dotRadius(cmykOriginal.x, baseR, grain), outMask[0]);
        computeDotContribution(pM, cellOffset, dotRadius(cmykOriginal.y, baseR, grain), outMask[1]);
        computeDotContribution(pY, cellOffset, dotRadius(cmykOriginal.z, baseR, grain), outMask[2]);
        computeDotContribution(pK, cellOffset, dotRadius(cmykOriginal.w, baseR, grain), outMask[3]);
      }
    }
  }

  float shape;

  float covC = outMask[0];
  float covM = outMask[1];
  float covY = outMask[2];
  float covK = outMask[3];

  vec3 ink = vec3(1.0);

  const vec3 INK_C = vec3(0.0, 1.0, 1.0);
  const vec3 INK_M = vec3(1.0, 0.0, 1.0);
  const vec3 INK_Y = vec3(1.0, 1.0, 0.0);
  const vec3 INK_K = vec3(0.0, 0.0, 0.0);

  ink = applyInk(ink, INK_K, covK);
  ink = applyInk(ink, INK_C, covC);
  ink = applyInk(ink, INK_M, covM);
  ink = applyInk(ink, INK_Y, covY);

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
  u_size: number;
  u_radius: number;
  u_minRadius: number;
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
  u_showDots: number;
  u_grainSize: number;
  u_grainMixer: number;
  u_grainOverlay: number;
}

export interface HalftoneCmykParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorBack?: string;
  size?: number;
  radius?: number;
  minRadius?: number;
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
  showDots?: number;
  grainSize?: number;
  grainMixer?: number;
  grainOverlay?: number;
}

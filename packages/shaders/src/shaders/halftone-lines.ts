import type {ShaderMotionParams} from '../shader-mount.js';
import {sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms} from '../shader-sizing.js';
import {declarePI, rotation2, simplexNoise, proceduralHash21} from '../shader-utils.js';

export const halftoneLinesMeta = {
    maxBlurRadius: 8,
} as const;

/**
 *
 * Fluid motion imitation applied over user image
 * (animated stripe pattern getting distorted with shape edges)
 *
 * Uniforms:
 * - u_colorBack, u_colorFront (RGBA)
 *
 */

// language=GLSL
export const halftoneLinesFragmentShader: string = `#version 300 es
precision mediump float;

uniform mediump vec2 u_resolution;
uniform mediump float u_pixelRatio;
uniform mediump float u_originX;
uniform mediump float u_originY;
uniform mediump float u_fit;

uniform mediump float u_scale;
uniform mediump float u_rotation;
uniform mediump float u_offsetX;
uniform mediump float u_offsetY;

uniform float u_time;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_radius;
uniform float u_contrast;

uniform sampler2D u_image;
uniform mediump float u_imageAspectRatio;

uniform float u_size;
uniform bool u_thinLines;
uniform bool u_allowOverflow;
uniform float u_grid;
uniform float u_gridOffsetX;
uniform float u_gridOffsetY;
uniform float u_grainMixer;
uniform float u_grainMixerSize;
uniform float u_grainOverlay;
uniform float u_grainOverlaySize;
uniform bool u_straight;
uniform bool u_originalColors;
uniform bool u_inverted;
uniform float u_stripeWidth;
uniform float u_smoothness;
uniform float u_angleDistortion;
uniform float u_noiseDistortion;
uniform float u_gridRotation;


${ sizingVariablesDeclaration }

out vec4 fragColor;

${ declarePI }
${ rotation2 }
${ simplexNoise }
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

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
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


float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.x);
  return frame;
}

float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

float sigmoid(float x, float k) {
  return 1.0 / (1.0 + exp(-k * (x - 0.5)));
}

vec4 blurTexture(sampler2D tex, vec2 uv, vec2 texelSize, float radius) {
  // clamp radius so loops have a known max
  float r = clamp(radius, 0., float(${ halftoneLinesMeta.maxBlurRadius }));
  int ir = int(r);

  vec4 acc = vec4(0.0);
  float weightSum = 0.0;

  // simple Gaussian-ish weights based on distance
  for (int y = -20; y <= ${ halftoneLinesMeta.maxBlurRadius }; ++y) {
    if (abs(y) > ir) continue;
    for (int x = -20; x <= ${ halftoneLinesMeta.maxBlurRadius }; ++x) {
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


float getLumAtPx(vec2 uv, float contrast, out vec3 origColor) {
  vec4 tex = blurTexture(u_image, uv, vec2(1. / u_resolution), u_smoothness);

  origColor = tex.rgb;
  vec3 color = vec3(
      sigmoid(tex.r, contrast),
      sigmoid(tex.g, contrast),
      sigmoid(tex.b, contrast)
  );
  float lum = dot(vec3(0.2126, 0.7152, 0.0722), color);
  lum = mix(1., lum, tex.a);
  lum = u_inverted ? (1. - lum) : lum;
  return lum;
}

float blendOverlay(float base, float blend) {
  return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
  return vec3(blendOverlay(base.r, blend.r), blendOverlay(base.g, blend.g), blendOverlay(base.b, blend.b));
}

vec3 blendHardLight(vec3 base, vec3 blend) {
  return blendOverlay(blend, base);
}

vec3 blendHardLight(vec3 base, vec3 blend, float opacity) {
  return (blendHardLight(base, blend) * opacity + base * (1.0 - opacity));
}

void main() {

  vec2 uv = gl_FragCoord.xy - .5 * u_resolution;

  vec2 uvNormalised = uv / u_resolution.xy;
  vec2 uvOriginal = getImageUV(uvNormalised, vec2(1.));

  float contrast = mix(0., 15., u_contrast);

  vec3 origColor = vec3(0.);
  float lum = getLumAtPx(uvOriginal, contrast, origColor);

  float frame = getImgFrame(v_imageUV, 0.);
  lum = mix(1., lum, frame);
  lum = 1. - lum;

  uv = v_objectUV;
  float n = snoise(3. * uv + 100.);

  vec2 uvGrid = v_objectUV;
  uvGrid += .15 * n * lum * u_noiseDistortion;
  uvGrid *= u_size;

  float gridLine;

  float angleOffset = u_gridRotation * PI / 180.;
  float angleDistort = u_angleDistortion * lum;

  vec2 gridOffset = -vec2(u_gridOffsetX, u_gridOffsetY);
  if (u_grid == 1.) {
    uvGrid -= u_size * gridOffset;
    uvGrid = rotate(uvGrid, angleOffset);
    uvGrid += u_size * gridOffset;

    uvGrid = rotate(uvGrid, angleDistort);
    uvGrid += u_size * gridOffset;
    gridLine = length(uvGrid);
  } else {
    uvGrid += gridOffset;
    uvGrid = rotate(uvGrid, angleOffset + angleDistort);
    gridLine = uvGrid.y;
  }

  float stripeMap = abs(fract(gridLine) - .5);
  float aa = fwidth(gridLine);

  float w = mix(0., .5 * u_stripeWidth, lum);
  float wLo = .0;
  float wHi = .5 + aa;
  if (u_allowOverflow == false) {
    wHi -= 2. * aa;
  }
  if (u_thinLines == false) {
    wLo += .5 * aa;
    wHi -= .5 * aa;
  }
  w = clamp(w, wLo, wHi);
  
  vec2 grainMixerSize = mix(1000., 25., u_grainMixerSize) * vec2(1., 1. / u_imageAspectRatio);
  vec2 grainOverlaySize = mix(2000., 200., u_grainOverlaySize) * vec2(1., 1. / u_imageAspectRatio);
  vec2 grainMixerUV = getImageUV(uvNormalised, grainMixerSize);
  vec2 grainOverlayUV = getImageUV(uvNormalised, grainOverlaySize);
  float grain = valueNoise(grainMixerUV) + .3 * pow(u_grainMixer, 3.);
  grain = smoothstep(.55, .9, grain);
  grain *= .5 * pow(u_grainMixer, 3.);
  stripeMap += .5 * grain;

  float lo = w;
  float hi = w + aa;
  float line = sst(lo, hi, stripeMap);
  line = mix(1., line, frame);
  line = clamp(line, 0., 1.);

  vec3 color = vec3(0.);
  float opacity = 1.;

  if (u_originalColors == true) {
    color = mix(origColor, u_colorBack.rgb, line);
  } else {
    color = mix(u_colorFront.rgb, u_colorBack.rgb, line);
  }

  float grainOverlay = valueNoise(rotate(grainOverlayUV, 1.) + vec2(3.));
  grainOverlay = mix(grainOverlay, valueNoise(rotate(grainOverlayUV, 2.) + vec2(-1.)), .5);
  grainOverlay = pow(grainOverlay, 1.3);
  float grainOverlayV = grainOverlay * 2. - 1.;
  vec3 grainOverlayColor = vec3(step(0., grainOverlayV));
  float grainOverlayStrength = u_grainOverlay * abs(grainOverlayV);
  grainOverlayStrength = pow(grainOverlayStrength, .8);
  color = mix(color, grainOverlayColor, .35 * grainOverlayStrength);

  opacity += .5 * grainOverlayStrength;
  opacity = clamp(opacity, 0., 1.);
  
  fragColor = vec4(color, opacity);
}
`;

export interface HalftoneLinesUniforms extends ShaderSizingUniforms {
    u_colorBack: [number, number, number, number];
    u_colorFront: [number, number, number, number];
    u_image: HTMLImageElement | string | undefined;
    u_grid: (typeof HalftoneLinesGrids)[HalftoneLinesGrid];
    u_gridOffsetX: number;
    u_gridOffsetY: number;
    u_stripeWidth: number;
    u_smoothness: number;
    u_size: number;
    u_thinLines: boolean;
    u_allowOverflow: boolean;
    u_angleDistortion: number;
    u_noiseDistortion: number;
    u_gridRotation: number;
    u_contrast: number;
    u_originalColors: boolean;
    u_inverted: boolean;
    u_grainMixer: number;
    u_grainMixerSize: number;
    u_grainOverlay: number;
    u_grainOverlaySize: number;
}

export interface HalftoneLinesParams extends ShaderSizingParams, ShaderMotionParams {
    colorBack?: string;
    colorFront?: string;
    image?: HTMLImageElement | string | undefined;
    grid?: HalftoneLinesGrid;
    gridOffsetX?: number;
    gridOffsetY?: number;
    stripeWidth?: number;
    smoothness?: number;
    size?: number;
    thinLines?: boolean;
    allowOverflow?: boolean;
    angleDistortion?: number;
    noiseDistortion?: number;
    gridRotation?: number;
    contrast?: number;
    originalColors?: boolean;
    inverted?: boolean;
    grainMixer?: number;
    grainMixerSize?: number;
    grainOverlay?: number;
    grainOverlaySize?: number;
}

export const HalftoneLinesGrids = {
  lines: 0,
  radial: 1,
} as const;

export type HalftoneLinesGrid = keyof typeof HalftoneLinesGrids;

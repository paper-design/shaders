import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2, simplexNoise, proceduralHash21 } from '../shader-utils.js';

export const halftoneLinesMeta = {
  maxBlurRadius: 64,
} as const;

/**
 * A halftone image filter drawing the image as a line grid (lines, radial, waves, noise),
 * with the line width and the grid distortion driven by image luminance.
 * Supports original colors or a custom 2-color palette.
 *
 * Fragment shader uniforms:
 * - u_image (sampler2D): Source image texture
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorFront (vec4): Foreground (line) color in RGBA, needs originalColors off
 * - u_colorBack (vec4): Background color in RGBA
 * - u_size (float): Grid size relative to the canvas; the grid lives in object space, so it doesn't follow the image box (0 to 1)
 * - u_grid (float): Grid pattern type (0 = lines, 1 = radial, 2 = waves, 3 = noise)
 * - u_gridOffsetX (float): Horizontal grid offset in canvas units (-1 to 1)
 * - u_gridOffsetY (float): Vertical grid offset in canvas units (-1 to 1)
 * - u_gridRotation (float): Grid rotation angle in degrees, with the radial grid needs a nonzero grid offset (0 to 360)
 * - u_gridAngleDistortion (float): Luminosity-based angle distortion strength, with the radial grid needs a nonzero grid offset (0 to 1)
 * - u_gridNoiseDistortion (float): Noise-based position distortion strength (0 to 1)
 * - u_stripeWidth (float): Max width of the line, relative to grid size (0 to 1)
 * - u_thinLines (bool): Allow sub-pixel thin lines (set false to keep lines antialiased)
 * - u_allowOverflow (bool): Allow the line to take the whole grid cell (set false to keep the gaps visible)
 * - u_contrast (float): Image contrast adjustment (0 to 1)
 * - u_smoothness (float): Smoothing applied to the luminance that drives the strokes (0 to 1)
 * - u_colorSmoothness (float): Smoothing applied to the sampled color, needs originalColors on (0 to 1)
 * - u_originalColors (bool): Use the sampled image's original colors instead of colorFront
 * - u_inverted (bool): Inverts the image luminance, needs contrast > 0
 * - u_grainMixer (float): Strength of grain distortion applied to the lines (0 to 1)
 * - u_grainMixerSize (float): Scale of the grain distortion, needs grainMixer > 0 (0 to 1)
 * - u_grainOverlay (float): Strength of the post-processing black/white grain overlay (0 to 1)
 * - u_grainOverlaySize (float): Scale of the grain overlay, needs grainOverlay > 0 (0 to 1)
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_imageUV (vec2): UV coordinates for sampling the source image, with fit, scale, rotation, and offset applied
 * - v_objectUV (vec2): Object box UV coordinates with global sizing (scale, rotation, offsets, etc) applied
 *
 * Vertex shader uniforms:
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_originX (float): Reference point for positioning world width in the canvas (0 to 1)
 * - u_originY (float): Reference point for positioning world height in the canvas (0 to 1)
 * - u_worldWidth (float): Virtual width of the graphic before it's scaled to fit the canvas
 * - u_worldHeight (float): Virtual height of the graphic before it's scaled to fit the canvas
 * - u_fit (float): How to fit the rendered shader into the canvas dimensions (0 = none, 1 = contain, 2 = cover)
 * - u_scale (float): Overall zoom level of the graphics (0.1 to 4)
 * - u_rotation (float): Overall rotation angle of the graphics in degrees (0 to 360)
 * - u_offsetX (float): Horizontal offset of the graphics center (-1 to 1)
 * - u_offsetY (float): Vertical offset of the graphics center (-1 to 1)
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 *
 */

// language=GLSL
export const halftoneLinesFragmentShader: string = `#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform mediump float u_imageAspectRatio;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_contrast;

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
uniform bool u_originalColors;
uniform bool u_inverted;
uniform float u_stripeWidth;
uniform float u_smoothness;
uniform float u_colorSmoothness;
uniform float u_gridAngleDistortion;
uniform float u_gridNoiseDistortion;
uniform float u_gridRotation;

in vec2 v_imageUV;
in vec2 v_objectUV;

out vec4 fragColor;

${declarePI}
${rotation2}
${simplexNoise}
${proceduralHash21}

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

float toLum(vec4 tex, float contrast) {
  vec3 color = vec3(
  sigmoid(tex.r, contrast),
  sigmoid(tex.g, contrast),
  sigmoid(tex.b, contrast)
  );
  float lum = dot(vec3(0.2126, 0.7152, 0.0722), color);
  lum = mix(1., lum, tex.a);
  return u_inverted ? (1. - lum) : lum;
}

float smoothingLod(float radius) {
  return max(0., log2(max(radius, 1.)) - 1.);
}

vec4 sampleSmoothed(vec2 uv, float radius) {
  if (radius <= 0.) return texture(u_image, uv);

  vec2 texelSize = 1. / vec2(textureSize(u_image, 0));
  float lod = smoothingLod(radius);
  vec2 texelStep = exp2(lod) * texelSize;

  vec4 acc = 2. * textureLod(u_image, uv, lod);
  acc += textureLod(u_image, uv + vec2(texelStep.x, 0.), lod);
  acc += textureLod(u_image, uv - vec2(texelStep.x, 0.), lod);
  acc += textureLod(u_image, uv + vec2(0., texelStep.y), lod);
  acc += textureLod(u_image, uv - vec2(0., texelStep.y), lod);

  return acc / 6.;
}

void main() {

  float contrast = mix(0., 15., u_contrast);

  float maxRadius = float(${halftoneLinesMeta.maxBlurRadius});
  float smoothingRadius = maxRadius * u_smoothness * u_smoothness;
  float colorSmoothingRadius = maxRadius * u_colorSmoothness * u_colorSmoothness;

  vec4 originalTexture = sampleSmoothed(v_imageUV, colorSmoothingRadius);

  float frame = getImgFrame(v_imageUV, 0.);

  float lum = toLum(sampleSmoothed(v_imageUV, smoothingRadius), contrast);
  lum = mix(1., lum, frame);
  lum = 1. - lum;

  vec2 uv = v_objectUV;
  float noise = snoise(2.5 * uv + 100.);

  vec2 uvGrid = v_objectUV;
  uvGrid += .15 * noise * lum * u_gridNoiseDistortion;
  float gridSize = mix(200., 5., u_size);
  uvGrid *= gridSize;

  float gridLine;

  float angleOffset = u_gridRotation * PI / 180.;
  float angleDistort = u_gridAngleDistortion * lum;

  vec2 gridOffset = -gridSize * vec2(u_gridOffsetX, u_gridOffsetY);
  if (u_grid == 0.) {
    uvGrid += gridOffset;
    uvGrid = rotate(uvGrid, angleOffset + angleDistort);
    gridLine = uvGrid.y;
  } else if (u_grid == 1.) {
    uvGrid = rotate(uvGrid, angleOffset + angleDistort);
    uvGrid += gridOffset;
    gridLine = length(uvGrid);
  } else if (u_grid == 2.) {
    uvGrid += gridOffset;
    uvGrid = rotate(uvGrid, angleOffset + angleDistort);
    gridLine = uvGrid.y + sin(.5 * uvGrid.x);
  } else if (u_grid == 3.) {
    uvGrid += gridOffset;
    uvGrid = rotate(uvGrid, angleOffset + angleDistort);
    noise = snoise(.2 * uvGrid);
    gridLine = noise;
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

  vec2 grainMixerScale = mix(1000., 50., u_grainMixerSize) * vec2(1., 1. / u_imageAspectRatio);
  vec2 grainOverlayScale = mix(2000., 200., u_grainOverlaySize) * vec2(1., 1. / u_imageAspectRatio);
  vec2 grainMixerUV = (v_imageUV - .5) * grainMixerScale;
  vec2 grainOverlayUV = (v_imageUV - .5) * grainOverlayScale;
  float grain = valueNoise(grainMixerUV) + .3 * pow(u_grainMixer, 3.);
  grain = smoothstep(.55, .9, grain);
  grain *= .5 * pow(u_grainMixer, 3.);
  stripeMap += .5 * grain;

  float lo = w;
  float hi = w + aa;
  float line = sst(lo, hi, stripeMap);
  line = mix(1., line, frame);
  line = 1. - clamp(line, 0., 1.);

  vec3 color = vec3(0.);
  float opacity = 0.;
  
  if (u_originalColors == true) {
    color = originalTexture.rgb * line;
    opacity = originalTexture.a * line;

    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    color = color + bgColor * (1. - opacity);
    opacity = opacity + u_colorBack.a * (1. - opacity);
  } else {
    vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
    float fgOpacity = u_colorFront.a;
    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    float bgOpacity = u_colorBack.a;

    color = fgColor * line;
    opacity = fgOpacity * line;
    color += bgColor * (1. - opacity);
    opacity += bgOpacity * (1. - opacity);
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
  u_colorSmoothness: number;
  u_size: number;
  u_thinLines: boolean;
  u_allowOverflow: boolean;
  u_gridAngleDistortion: number;
  u_gridNoiseDistortion: number;
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
  colorSmoothness?: number;
  size?: number;
  thinLines?: boolean;
  allowOverflow?: boolean;
  gridAngleDistortion?: number;
  gridNoiseDistortion?: number;
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
  waves: 2,
  noise: 3,
} as const;

export type HalftoneLinesGrid = keyof typeof HalftoneLinesGrids;

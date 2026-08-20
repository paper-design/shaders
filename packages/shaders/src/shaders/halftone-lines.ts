import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2, simplexNoise, proceduralHash21 } from '../shader-utils.js';

export const halftoneLinesMeta = {
  maxBlurRadius: 64,
} as const;

/**
 * A halftone image filter drawing the image as a line grid (lines, radial, waves, noise),
 * with the stroke width and the grid distortion driven by image luminance.
 * Supports original colors or a custom 2-color palette.
 *
 * Fragment shader uniforms:
 * - u_image (sampler2D): Source image texture
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorFront (vec4): Foreground (line) color in RGBA, needs originalColors off
 * - u_colorBack (vec4): Background color in RGBA
 * - u_gridSize (float): Grid size relative to the canvas; the grid lives in object space, so it doesn't follow the image box (0 to 1)
 * - u_grid (float): Grid pattern type (0 = lines, 1 = radial, 2 = waves, 3 = noise)
 * - u_gridOffsetX (float): Horizontal grid offset in canvas units (-1 to 1)
 * - u_gridOffsetY (float): Vertical grid offset in canvas units (-1 to 1)
 * - u_gridRotation (float): Grid rotation angle in degrees, with the radial grid needs a nonzero grid offset (0 to 360)
 * - u_gridAngleDistortion (float): Luminosity-based angle distortion strength, with the radial grid needs a nonzero grid offset (0 to 1)
 * - u_gridNoiseDistortion (float): Noise-based position distortion strength (0 to 1)
 * - u_strokeWidth (float): Stroke width relative to the grid cell, at 1 the strokes fill the cell completely (0 to 1)
 * - u_softness (float): Softness of the stroke edges as a fraction of the grid cell, at 1 the stripes blur out into flat tone (0 to 1)
 * - u_strokeOverflow (bool): Let neighbouring strokes merge where they meet, off keeps a two pixel mask between them
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
precision highp float;

uniform sampler2D u_image;
uniform mediump float u_imageAspectRatio;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_contrast;

uniform float u_gridSize;
uniform float u_grid;
uniform float u_gridOffsetX;
uniform float u_gridOffsetY;
uniform float u_grainMixer;
uniform float u_grainMixerSize;
uniform float u_grainOverlay;
uniform float u_grainOverlaySize;
uniform bool u_originalColors;
uniform bool u_inverted;
uniform float u_strokeWidth;
uniform bool u_strokeOverflow;
uniform float u_softness;
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

float getImgFrame(vec2 uv, vec2 th) {
  vec2 f = smoothstep(vec2(0.), th, uv) * (1. - smoothstep(1. - th, vec2(1.), uv));
  return f.x * f.y;
}

float stripeCoverage(float x, float window, float w) {
  float a = x - .5 * window;
  float b = x + .5 * window;
  float span = 2. * w;
  float ia = clamp(fract(a) - .5 + w, 0., span);
  float ib = clamp(fract(b) - .5 + w, 0., span);
  return (span * (floor(b) - floor(a)) + ib - ia) / window;
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

  float frame = getImgFrame(v_imageUV, max(fwidth(v_imageUV), 1e-4));

  float lum = 1. - toLum(sampleSmoothed(v_imageUV, smoothingRadius), contrast);

  vec2 uv = v_objectUV;
  float noise = snoise(2.5 * uv + 100.);

  vec2 uvGrid = v_objectUV;
  uvGrid += .15 * noise * lum * u_gridNoiseDistortion;
  float cellsPerSide = mix(200., 5., u_gridSize);
  uvGrid *= cellsPerSide;

  float gridLine;
  vec2 gridGrad = vec2(0.);

  float angleOffset = u_gridRotation * PI / 180.;
  float angleDistort = u_gridAngleDistortion * lum;

  vec2 gridOffset = -cellsPerSide * vec2(u_gridOffsetX, u_gridOffsetY);
  if (u_grid == 0.) {
    uvGrid += gridOffset;
    uvGrid = rotate(uvGrid, angleOffset + angleDistort);
    gridLine = uvGrid.y;
    gridGrad = vec2(0., 1.);
  } else if (u_grid == 1.) {
    uvGrid = rotate(uvGrid, angleOffset + angleDistort);
    uvGrid += gridOffset;
    float radius = length(uvGrid);
    gridLine = radius;
    gridGrad = radius > 1e-4 ? uvGrid / radius : vec2(1., 0.);
  } else if (u_grid == 2.) {
    uvGrid += gridOffset;
    uvGrid = rotate(uvGrid, angleOffset + angleDistort);
    gridLine = uvGrid.y + sin(.5 * uvGrid.x);
    gridGrad = vec2(.5 * cos(.5 * uvGrid.x), 1.);
  } else if (u_grid == 3.) {
    uvGrid += gridOffset;
    uvGrid = rotate(uvGrid, angleOffset + angleDistort);
    noise = snoise(.2 * uvGrid);
    gridLine = noise;
  }

  vec2 grainMixerScale = mix(1000., 50., u_grainMixerSize) * vec2(1., 1. / u_imageAspectRatio);
  vec2 grainOverlayScale = mix(2000., 200., u_grainOverlaySize) * vec2(1., 1. / u_imageAspectRatio);
  vec2 grainMixerUV = (v_imageUV - .5) * grainMixerScale;
  vec2 grainOverlayUV = (v_imageUV - .5) * grainOverlayScale;
  float grain = valueNoise(grainMixerUV) + .3 * pow(u_grainMixer, 3.);
  grain = smoothstep(.55, .9, grain);
  grain *= .5 * pow(u_grainMixer, 3.);

  float aa = max(
    length(vec2(dFdx(gridLine), dFdy(gridLine))),
    length(vec2(dot(gridGrad, dFdx(uvGrid)), dot(gridGrad, dFdy(uvGrid))))
  );

  float wMax = u_strokeOverflow ? .5 + .5 * aa : .5;
  float w = clamp(wMax * u_strokeWidth * lum - .5 * grain, 0., .5);

  float window = max(max(aa, u_softness), 1e-4);
  float stroke = stripeCoverage(gridLine, window, w);

  if (u_strokeOverflow == false) {
    float maskWidth = min(aa, .25);
    float mask = stripeCoverage(gridLine + .5, window, maskWidth) * (1. - smoothstep(.25, .5, aa));
    stroke *= 1. - mask;
  }

  stroke *= frame;

  vec3 color = vec3(0.);
  float opacity = 0.;
  
  if (u_originalColors == true) {
    color = originalTexture.rgb * stroke;
    opacity = originalTexture.a * stroke;

    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    color = color + bgColor * (1. - opacity);
    opacity = opacity + u_colorBack.a * (1. - opacity);
  } else {
    vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
    float fgOpacity = u_colorFront.a;
    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    float bgOpacity = u_colorBack.a;

    color = fgColor * stroke;
    opacity = fgOpacity * stroke;
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
  u_strokeWidth: number;
  u_strokeOverflow: boolean;
  u_softness: number;
  u_smoothness: number;
  u_colorSmoothness: number;
  u_gridSize: number;
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
  strokeWidth?: number;
  strokeOverflow?: boolean;
  softness?: number;
  smoothness?: number;
  colorSmoothness?: number;
  gridSize?: number;
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

import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2, simplexNoise, proceduralHash21 } from '../shader-utils.js';

export const halftoneLinesMeta = {
  maxBlurRadius: 8,
} as const;

/**
 * Animated halftone lines effect with customizable grid patterns (lines, radial, waves, noise)
 * and distortion based on image luminosity. Supports original colors or custom color overlay.
 *
 * Fragment shader uniforms:
 * - u_resolution (vec2): Canvas resolution in pixels (used for blur calculations)
 * - u_time (float): Animation time
 * - u_image (sampler2D): Source image texture
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorFront (vec4): Foreground (line) color in RGBA (used when originalColors = false)
 * - u_colorBack (vec4): Background color in RGBA
 * - u_size (float): Halftone cell/grid size (0 to 1)
 * - u_grid (float): Grid pattern type (0 = lines, 1 = radial, 2 = waves, 3 = noise)
 * - u_gridOffsetX (float): Horizontal grid offset
 * - u_gridOffsetY (float): Vertical grid offset
 * - u_gridRotation (float): Grid rotation angle in degrees
 * - u_gridAngleDistortion (float): Luminosity-based angle distortion strength (0 to 1)
 * - u_gridNoiseDistortion (float): Noise-based position distortion strength (0 to 1)
 * - u_stripeWidth (float): Width of lines/stripes (0 to 1)
 * - u_thinLines (bool): Use thinner lines with anti-aliasing
 * - u_allowOverflow (bool): Allow lines to overflow cell boundaries
 * - u_straight (bool): Disable wave distortion for straight lines
 * - u_contrast (float): Image contrast adjustment (0 to 1)
 * - u_smoothness (float): Blur amount applied to source image (0 to 8)
 * - u_originalColors (bool): Use original image colors (true) or custom colors (false)
 * - u_inverted (bool): Invert luminosity calculation
 * - u_grainMixer (float): Strength of grain affecting line width (0 to 1)
 * - u_grainMixerSize (float): Size of grain mixer texture (0 to 1)
 * - u_grainOverlay (float): Strength of grain overlay on final output (0 to 1)
 * - u_grainOverlaySize (float): Size of grain overlay texture (0 to 1)
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
 * - u_scale (float): Overall zoom level of the graphics (0.01 to 4)
 * - u_rotation (float): Overall rotation angle of the graphics in degrees (0 to 360)
 * - u_offsetX (float): Horizontal offset of the graphics center (-1 to 1)
 * - u_offsetY (float): Vertical offset of the graphics center (-1 to 1)
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 *
 */

// language=GLSL
export const halftoneLinesFragmentShader: string = `#version 300 es
precision mediump float;

uniform mediump vec2 u_resolution;

uniform float u_time;

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
uniform bool u_straight;
uniform bool u_originalColors;
uniform bool u_inverted;
uniform float u_stripeWidth;
uniform float u_smoothness;
uniform float u_gridAngleDistortion;
uniform float u_gridNoiseDistortion;
uniform float u_gridRotation;

in vec2 v_imageUV;
in vec2 v_objectUV;

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
  for (int y = -${ halftoneLinesMeta.maxBlurRadius }; y <= ${ halftoneLinesMeta.maxBlurRadius }; ++y) {
    if (abs(y) > ir) continue;
    for (int x = -${ halftoneLinesMeta.maxBlurRadius }; x <= ${ halftoneLinesMeta.maxBlurRadius }; ++x) {
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


float getLumAtPx(vec2 uv, float contrast, out vec4 originalTexture) {
  originalTexture = blurTexture(u_image, uv, vec2(1. / u_resolution), u_smoothness);
  vec3 color = vec3(
  sigmoid(originalTexture.r, contrast),
  sigmoid(originalTexture.g, contrast),
  sigmoid(originalTexture.b, contrast)
  );
  float lum = dot(vec3(0.2126, 0.7152, 0.0722), color);
  lum = mix(1., lum, originalTexture.a);
  lum = u_inverted ? (1. - lum) : lum;
  return lum;
}

void main() {

  vec2 uvOriginal = v_imageUV;

  float contrast = mix(0., 15., u_contrast);

  vec4 originalTexture = vec4(0.);
  float lum = getLumAtPx(uvOriginal, contrast, originalTexture);

  float frame = getImgFrame(v_imageUV, 0.);
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

  vec2 gridOffset = -vec2(u_gridOffsetX, u_gridOffsetY);
  if (u_grid == 0.) {
    uvGrid += gridOffset;
    uvGrid = rotate(uvGrid, angleOffset + angleDistort);
    gridLine = uvGrid.y;
  } else if (u_grid == 1.) {
    uvGrid += gridSize * gridOffset;

    uvGrid -= gridSize * gridOffset;
    uvGrid = rotate(uvGrid, angleOffset + angleDistort);
    uvGrid += gridSize * gridOffset;

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

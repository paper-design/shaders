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
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colorMid (vec4): Stroke color in RGBA drawn in the light image areas, blending into colorFront in the dark ones, needs originalColors off
 * - u_colorFront (vec4): Foreground (line) color in RGBA drawn in the dark image areas, blending into colorMid in the light ones, needs originalColors off
 * - u_originalColors (bool): Use the sampled image's original colors instead of colorMid and colorFront
 * - u_colorSoftness (float): Blur applied to the sampled color, softening the image colors with originalColors on and the colorMid to colorFront edge with it off, at 0 the two colors meet on a sharp line (0 to 1)
 * - u_strokeWidth (float): Stroke width relative to the grid cell, at 1 the strokes fill the cell completely (0 to 1)
 * - u_strokeContrast (float): How strongly the image luminance varies the stroke width (0 to 1)
 * - u_strokesRounding (float): Rounding of the stroke shapes, from smoothing the luminance that drives them (0 to 1)
 * - u_strokeInverted (bool): Inverts the image luminance driving the stroke width, leaving the colors and the grid contouring unchanged, needs strokeContrast > 0
 * - u_strokeSoftness (float): Softness added at the stroke edges, the same width at any stroke width; the stroke core keeps its full color and the stroke grows outward by the softness (0 to 1)
 * - u_strokeKeepGaps (bool): Keep a thin gap between neighbouring strokes, two pixels wide and picking up a third of the stroke softness, off lets them merge where they meet
 * - u_strokeKeepWidth (bool): Draw a thin line along the grid where the strokes fade out, two pixels wide and picking up a third of the stroke softness, off lets them fade away in the lightest areas
 * - u_gridType (float): Grid pattern type (0 = lines, 1 = linesIrregular, 2 = waves, 3 = wavesIrregular, 4 = zigzag, 5 = truchet, 6 = radial)
 * - u_gridSize (float): Grid size relative to the canvas; the grid lives in object space, so it doesn't follow the image box (0 to 1)
 * - u_gridOffset (float): Grid offset along the grid Y axis, one grid cell at full range for the lines and waves grids, canvas units for the radial distance from the image center to the ring center, and a quarter of that for noise (-1 to 1)
 * - u_gridRotation (float): Grid rotation angle in degrees around the image center, with the radial grid needs a nonzero grid offset (0 to 360)
 * - u_gridNoise (float): Noise displacement of the grid along its Y axis (0 to 1)
 * - u_gridContouring (float): How much the image contours the grid, blending an offset along the grid Y axis, a rotation around the image center and a noise displacement in proportion to gridOffset, gridRotation and gridNoise; -1 follows the light areas and 1 the dark ones, independent of strokeContrast (-1 to 1)
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

uniform vec4 u_colorBack;
uniform vec4 u_colorMid;
uniform vec4 u_colorFront;
uniform bool u_originalColors;
uniform float u_colorSoftness;
uniform float u_strokeWidth;
uniform float u_strokeContrast;
uniform float u_strokesRounding;
uniform bool u_strokeInverted;
uniform float u_strokeSoftness;
uniform bool u_strokeKeepGaps;
uniform bool u_strokeKeepWidth;
uniform float u_gridType;
uniform float u_gridSize;
uniform float u_gridOffset;
uniform float u_gridRotation;
uniform float u_gridNoise;
uniform float u_gridContouring;
uniform float u_grainMixer;
uniform float u_grainMixerSize;
uniform float u_grainOverlay;
uniform float u_grainOverlaySize;


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

float toLumLinear(vec4 tex) {
  float lum = dot(vec3(0.2126, 0.7152, 0.0722), tex.rgb);
  return mix(1., lum, tex.a);
}

float toLum(vec4 tex, float contrast) {
  vec3 color = vec3(
  sigmoid(tex.r, contrast),
  sigmoid(tex.g, contrast),
  sigmoid(tex.b, contrast)
  );
  float lum = dot(vec3(0.2126, 0.7152, 0.0722), color);
  lum = mix(1., lum, tex.a);
  return u_strokeInverted ? (1. - lum) : lum;
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

  float contrast = mix(0., 15., u_strokeContrast);

  float maxRadius = float(${halftoneLinesMeta.maxBlurRadius});
  float strokesRoundingRadius = maxRadius * u_strokesRounding * u_strokesRounding;
  float colorSoftnessRadius = maxRadius * u_colorSoftness * u_colorSoftness;

  vec4 originalTexture = sampleSmoothed(v_imageUV, colorSoftnessRadius);

  float frame = getImgFrame(v_imageUV, max(fwidth(v_imageUV), 1e-4));

  vec4 lumSample = sampleSmoothed(v_imageUV, strokesRoundingRadius);
  float lum = 1. - toLum(lumSample, contrast);
  float contouringLum = 1. - toLumLinear(lumSample);

  vec2 uv = v_objectUV;
  float cellsPerSide = mix(200., 5., u_gridSize);

  float offsetScale = u_gridType < 5.5 ? 1. : cellsPerSide;
  float contouringPower = abs(u_gridContouring) * ((u_gridContouring > 0. ? contouringLum : 1. - contouringLum) - 1.);

  vec3 contouring = vec3(6., .5 * smoothstep(length(uv), 0., 1.), -5.) * contouringPower;

  vec2 uvGrid = uv * cellsPerSide;
  float noiseShift = (6. * u_gridNoise + contouring.z) * snoise(3. * uv + 10.);
  if (u_gridType < 4.5) {
    uvGrid += vec2(0., noiseShift);
  }

  float gridLine;
  vec2 gridGrad = vec2(0.);

  uvGrid = rotate(uvGrid, u_gridRotation * PI / 180. + contouring.y);
  uvGrid -= vec2(0., offsetScale * u_gridOffset + contouring.x);

  if (u_gridType > 4.5) {
    float noiseRadius = length(uvGrid);
    uvGrid += noiseShift * (noiseRadius > 1e-4 ? uvGrid / noiseRadius : vec2(0., 1.));
  }

  if (u_gridType == 0.) {
    gridLine = uvGrid.y;
    gridGrad = vec2(0., 1.);
  } else if (u_gridType == 1.) {
    gridLine = uvGrid.y + .25 * sin(.5 * uvGrid.y) * sin(1.7 * uvGrid.y);
    gridGrad = vec2(0., 1. + .25 * (.5 * cos(.5 * uvGrid.y) * sin(1.7 * uvGrid.y) + 1.7 * sin(.5 * uvGrid.y) * cos(1.7 * uvGrid.y)));
  } else if (u_gridType == 2.) {
    gridLine = uvGrid.y + 1.5 * sin(.5 * uvGrid.x);
    gridGrad = vec2(1.5 * .5 * cos(.5 * uvGrid.x), 1.);
  } else if (u_gridType == 3.) {
    float wave1 = sin(.4 * uvGrid.x);
    float wave2 = sin(.27 * uvGrid.x + 1.3);
    float drift = .13 * uvGrid.x + .19 * uvGrid.y;
    float wave3 = cos(drift);
    gridLine = uvGrid.y + 3. * wave1 * wave2 * wave3;
    gridGrad = vec2(
      3. * (.4 * cos(.4 * uvGrid.x) * wave2 * wave3 + .27 * wave1 * cos(.27 * uvGrid.x + 1.3) * wave3 - .13 * wave1 * wave2 * sin(drift)),
      1. - 3. * .19 * wave1 * wave2 * sin(drift)
    );
  } else if (u_gridType == 4.) {
    float tooth = fract(uvGrid.x / (4. * PI)) - .5;
    gridLine = uvGrid.y + 12. * abs(tooth);
    gridGrad = vec2(3. * sign(tooth) / PI, 1.);
  } else if (u_gridType == 5.) {
    float tileSize = 8.;
    vec2 tile = uvGrid / tileSize;
    vec2 tileId = floor(tile);
    vec2 tileUV = fract(tile);
    float flip = 1.;
    if (hash21(tileId) > .5) {
      tileUV.x = 1. - tileUV.x;
      flip = -1.;
    }
    vec2 corner = tileUV.x + tileUV.y < 1. ? vec2(0.) : vec2(1.);
    vec2 rel = tileUV - corner;
    float arc = length(rel);
    gridLine = tileSize * abs(arc - .5);
    gridGrad = sign(arc - .5) * vec2(flip * rel.x, rel.y) / max(arc, 1e-4);
  } else if (u_gridType == 6.) {
    float radius = length(uvGrid);
    gridLine = radius;
    gridGrad = radius > 1e-4 ? uvGrid / radius : vec2(1., 0.);
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
  float baseAA = cellsPerSide * max(length(dFdx(uv)), length(dFdy(uv)));
  float overlap = smoothstep(1.5, 3.5, aa / max(baseAA, 1e-6));

  float wMax = 1.5 + .5 * aa;
  float w = clamp(wMax * u_strokeWidth * lum - .5 * grain, 0., .5);

  float stable = min(aa, .25);
  float wDraw = clamp(w, stable, max(.5 - stable, stable));

  float window = max(clamp(.25 * u_strokeSoftness, aa, max(.5 - 2. * aa, aa)), 1e-4);
  float wSoft = clamp(wDraw + .5 * (window - aa), 0., max(.5 - .5 * (window + aa), 0.));
  float stroke = stripeCoverage(gridLine, window, wSoft);
  stroke *= min(w / max(stable, 1e-4), 1.);
  stroke = 1. + (stroke - 1.) * min((.5 - w) / max(stable, 1e-4), 1.);
  stroke = mix(stroke, mix(min(2. * w, 1.), 1., overlap), smoothstep(.15, .4, aa));

  float thinWindow = max(aa * (1. + .5 * u_strokeSoftness), 1e-4);
  float thinGrow = .5 * (thinWindow - aa);

  if (u_strokeKeepWidth == true) {
    float minWidth = min(aa, .25) * (1. - smoothstep(.25, .5, aa));
    stroke = max(stroke, stripeCoverage(gridLine, thinWindow, min(minWidth + thinGrow, .5)));
  }

  if (u_strokeKeepGaps == true) {
    float maskWidth = min(aa, .25);
    float mask = stripeCoverage(gridLine + .5, thinWindow, min(maskWidth + thinGrow, .5)) * (1. - smoothstep(.25, .5, aa));
    stroke *= 1. - mask;
  }

  stroke *= frame;

  float inkLum = 1. - 1.1 * toLum(originalTexture, .8);
  float inkEdge = max(.5 * u_colorSoftness, fwidth(inkLum));
  float inkMix = smoothstep(.5 - inkEdge, .5 + inkEdge, inkLum);

  vec3 color = vec3(0.);
  float opacity = 0.;
  
  if (u_originalColors == true) {
    color = originalTexture.rgb * stroke;
    opacity = originalTexture.a * stroke;

    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    color = color + bgColor * (1. - opacity);
    opacity = opacity + u_colorBack.a * (1. - opacity);
  } else {
    vec4 frontPremult = vec4(u_colorFront.rgb * u_colorFront.a, u_colorFront.a);
    vec4 midPremult = vec4(u_colorMid.rgb * u_colorMid.a, u_colorMid.a);
    vec4 ink = mix(midPremult, frontPremult, inkMix);
    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    float bgOpacity = u_colorBack.a;

    color = ink.rgb * stroke;
    opacity = ink.a * stroke;
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
  u_colorMid: [number, number, number, number];
  u_colorFront: [number, number, number, number];
  u_originalColors: boolean;
  u_colorSoftness: number;
  u_strokeWidth: number;
  u_strokeContrast: number;
  u_strokesRounding: number;
  u_strokeInverted: boolean;
  u_strokeSoftness: number;
  u_strokeKeepGaps: boolean;
  u_strokeKeepWidth: boolean;
  u_gridType: (typeof HalftoneLinesGrids)[HalftoneLinesGrid];
  u_gridSize: number;
  u_gridOffset: number;
  u_gridRotation: number;
  u_gridNoise: number;
  u_gridContouring: number;
  u_grainMixer: number;
  u_grainMixerSize: number;
  u_grainOverlay: number;
  u_grainOverlaySize: number;
  u_image: HTMLImageElement | string | undefined;
}

export interface HalftoneLinesParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colorMid?: string;
  colorFront?: string;
  originalColors?: boolean;
  colorSoftness?: number;
  strokeWidth?: number;
  strokeContrast?: number;
  strokesRounding?: number;
  strokeInverted?: boolean;
  strokeSoftness?: number;
  strokeKeepGaps?: boolean;
  strokeKeepWidth?: boolean;
  gridType?: HalftoneLinesGrid;
  gridSize?: number;
  gridOffset?: number;
  gridRotation?: number;
  gridNoise?: number;
  gridContouring?: number;
  grainMixer?: number;
  grainMixerSize?: number;
  grainOverlay?: number;
  grainOverlaySize?: number;
  image?: HTMLImageElement | string | undefined;
}

export const HalftoneLinesGrids = {
  lines: 0,
  linesIrregular: 1,
  waves: 2,
  wavesIrregular: 3,
  zigzag: 4,
  truchet: 5,
  radial: 6,
} as const;


export type HalftoneLinesGrid = keyof typeof HalftoneLinesGrids;

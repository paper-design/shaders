import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2, colorBandingFix } from '../shader-utils.js';

export const warpMeta = {
  maxColorCount: 10,
} as const;

/**
 * Animated color fields warped by noise and swirls, applied over base patterns
 * (checks, stripes, or split edge). Blends up to 10 colors with adjustable distribution,
 * softness, distortion, and swirl. Great for fluid, smoky, or marbled effects.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_scale (float): Overall zoom level, used for anti-aliasing calculations
 * - u_colors (vec4[]): Up to 10 gradient colors in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_proportion (float): Blend point between colors, 0.5 = equal distribution (0 to 1)
 * - u_softness (float): Color transition sharpness, 0 = hard edge, 1 = smooth gradient (0 to 1)
 * - u_shape (float): Base pattern type (0 = checks, 1 = stripes, 2 = edge)
 * - u_shapeScale (float): Zoom level of the base pattern (0 to 1)
 * - u_distortion (float): Strength of noise-based distortion (0 to 1)
 * - u_swirl (float): Strength of the swirl distortion (0 to 1)
 * - u_swirlIterations (float): Number of layered swirl passes, effective with swirl > 0 (0 to 20)
 * - u_contour (float): Strength of the contour band traced around the canvas element borders (0 to 1)
 * - u_antialiasing (bool): Enables fixed 4x4 supersampling; needed for crisp low-softness bands under strong distortion/swirl
 * - u_resolution (vec2): Canvas resolution in pixels, used to keep the contour locked to the canvas borders
 * - u_pixelRatio (float): Device pixel ratio, used to keep the contour thickness consistent across displays
 * - u_noiseTexture (sampler2D): Pre-computed randomizer source texture
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_patternUV (vec2): UV coordinates for pattern with global sizing (rotation, scale, offset, etc) applied
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
 *
 */

// language=GLSL
export const warpFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;
uniform float u_scale;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colors[${warpMeta.maxColorCount}];
uniform float u_colorsCount;
uniform float u_proportion;
uniform float u_softness;
uniform float u_shape;
uniform float u_shapeScale;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_swirlIterations;
uniform float u_contour;
uniform bool u_antialiasing;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

in vec2 v_patternUV;

out vec4 fragColor;

${declarePI}
${rotation2}
float randomG(vec2 p) {
  vec2 uv = floor(p) / 100. + .5;
  return texture(u_noiseTexture, fract(uv)).g;
}
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomG(i);
  float b = randomG(i + vec2(1.0, 0.0));
  float c = randomG(i + vec2(0.0, 1.0));
  float d = randomG(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

// The scalar base pattern (checks / stripes / edge) evaluated at a warped UV.
float patternShape(vec2 uv) {
  float proportion = clamp(u_proportion, 0., 1.);
  float proportionOffset = .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
  float shape;
  if (u_shape < .5) {
    vec2 p = uv * (.5 + 3.5 * u_shapeScale);
    shape = .5 + .5 * sin(p.x) * cos(p.y);
    shape += proportionOffset;
  } else if (u_shape < 1.5) {
    float f = fract(uv.y * (2. * u_shapeScale));
    shape = smoothstep(.0, .55, f) * (1.0 - smoothstep(.45, 1., f));
    shape += proportionOffset;
  } else {
    float shapeScaling = 5. * (1. - u_shapeScale);
    float e0 = 0.45 - shapeScaling;
    float e1 = 0.55 + shapeScaling;
    shape = smoothstep(min(e0, e1), max(e0, e1), 1.0 - uv.y + 0.3 * (proportion - 0.5));
  }
  return shape;
}

// Map the scalar pattern onto the color bands. u_softness sets band sharpness; aaW is
// a screen-space floor that antialiases individual band edges (needed when a pixel
// takes only 1 sample). Multi-crossing AA is handled by supersampling in main.
vec4 shadeBands(float shape, float aaW) {
  float mixer = shape * (u_colorsCount - 1.);
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${warpMeta.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;
    float m = clamp(mixer - float(i - 1), 0.0, 1.0);

    float localMixerStart = floor(m);
    float w = .5 * u_softness + aaW;
    float e = m - localMixerStart;
    float smoothed = w > 0. ? smoothstep(max(0., .5 - w), min(1., .5 + w), e) : step(.5, e);
    float stepped = localMixerStart + smoothed;

    m = mix(stepped, m, u_softness);

    vec4 c = u_colors[i];
    c.rgb *= c.a;
    gradient = mix(gradient, c, m);
  }
  return gradient;
}


// Contour band mask, locked to the <canvas> borders. Smooth in screen space, so it is
// a reliable per-pixel signal (unlike derivatives of the folded warp).
float contourEdge(vec2 fragCoord) {
  const float MAX_THICKNESS = .5;
  vec2 borderUV = fragCoord / u_resolution;
  vec2 mask = min(borderUV, 1. - borderUV);
  vec2 pixel_thickness = min(400. * u_pixelRatio / u_resolution, vec2(MAX_THICKNESS));
  float maskX = pow(smoothstep(0.0, pixel_thickness.x, mask.x), .2);
  float maskY = pow(smoothstep(0.0, pixel_thickness.y, mask.y), .2);
  return clamp(1. - maskX * maskY, 0., 1.);
}

vec2 warpUV(vec2 uv, vec2 fragCoord, float t) {
  float edge = contourEdge(fragCoord);

  float n1 = valueNoise(uv * 1. + t);
  float n2 = valueNoise(uv * 2. - t);
  float angle = n1 * TWO_PI;

  float edgeFadeW = u_contour * edge;
  float edgeFade = u_contour * pow(edge, 5.);
  uv -= vec2(.5);
  uv = rotate(uv, -edgeFade * angle);
  uv += vec2(.5);

  uv.x += 4. * u_distortion * n2 * cos(angle) * (1. - edgeFadeW);
  uv.y += 4. * u_distortion * n2 * sin(angle) * (1. - edgeFadeW);

  float swirl = u_swirl * (1. - edgeFadeW);
  for (int i = 1; i <= 20; i++) {
    if (i >= int(u_swirlIterations)) break;
    float iFloat = float(i);
    uv.x += swirl / iFloat * cos(t + iFloat * 1.5 * uv.y);
    uv.y += swirl / iFloat * cos(t + iFloat * 1. * uv.x);
  }
  return uv;
}


void main() {
  vec2 uv = v_patternUV * .5;

  const float firstFrameOffset = 118.;
  float t = 0.0625 * (u_time + firstFrameOffset);

  vec4 acc;
  if (u_antialiasing) {
    // Non-adaptive supersampling: fixed AA_ROOT x AA_ROOT grid, every pixel. The base
    // UV is a linear varying so its screen gradients are exact; we reconstruct each
    // sub-sample's pre-warp UV from them and run the whole warp per tap, so the taps
    // follow the true folded footprint the swirl produces. Hard-banded samples (aaW=0)
    // are averaged -> coverage-based AA that holds up under strong distortion/swirl.
    vec2 duvdx = dFdx(uv);
    vec2 duvdy = dFdy(uv);
    const int AA_ROOT = 4;
    acc = vec4(0.);
    for (int i = 0; i < AA_ROOT * AA_ROOT; i++) {
      int iy = i / AA_ROOT;
      int ix = i - iy * AA_ROOT;
      vec2 cell = (vec2(float(ix), float(iy)) + .5) / float(AA_ROOT) - .5;
      // rotate ~26.57deg so the grid never resonates with the checks/stripes axes
      vec2 o = vec2(cell.x * .8944 - cell.y * .4472, cell.x * .4472 + cell.y * .8944);
      vec2 sBase = uv + o.x * duvdx + o.y * duvdy;
      acc += shadeBands(patternShape(warpUV(sBase, gl_FragCoord.xy + o, t)), 0.);
    }
    acc /= float(AA_ROOT * AA_ROOT);
  } else {
    // Single sample + a cheap analytic floor that antialiases lone band edges.
    vec2 wc = warpUV(uv, gl_FragCoord.xy, t);
    float shapeC = patternShape(wc);
    float aaW = min(fwidth(shapeC * (u_colorsCount - 1.)), .5);
    acc = shadeBands(shapeC, aaW);
  }

  vec3 color = acc.rgb;
  float opacity = acc.a;

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface WarpUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_proportion: number;
  u_softness: number;
  u_shape: (typeof WarpPatterns)[WarpPattern];
  u_shapeScale: number;
  u_distortion: number;
  u_swirl: number;
  u_swirlIterations: number;
  u_contour: number;
  u_antialiasing: boolean;
  u_noiseTexture?: HTMLImageElement;
}

export interface WarpParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  rotation?: number;
  proportion?: number;
  softness?: number;
  shape?: WarpPattern;
  shapeScale?: number;
  distortion?: number;
  swirl?: number;
  swirlIterations?: number;
  contour?: number;
  antialiasing?: boolean;
}

export const WarpPatterns = {
  checks: 0,
  stripes: 1,
  edge: 2,
} as const;

export type WarpPattern = keyof typeof WarpPatterns;

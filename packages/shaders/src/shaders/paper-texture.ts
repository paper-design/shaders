import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, proceduralHash22 } from '../shader-utils.js';

export const paperTextureMeta = {
  maxFoldCount: 15,
} as const;

/**
 * Static paper-like texture built from a combination of grain, noise and multiple fold patterns.
 * Works as an image filter or as a standalone texture.
 *
 * Fragment shader uniforms:
 * - u_image (sampler2D): Optional source image texture
 * - u_isImage (bool): Whether a source image was provided
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorShadow (vec4): Color used for folds, creases, grain and speckles, blends into the image, in RGBA
 * - u_colorBack (vec4): Color behind the image, usually light, in RGBA
 * - u_roughness (float): Grain noise, sized independently of scaling, with its level of detail depending on the scale (0 to 1)
 * - u_roughnessSize (float): Scale of the roughness noise, needs u_roughness > 0 (0 to 1)
 * - u_fiber (float): Curly fiber noise, simulating real paper (0 to 1)
 * - u_fiberSize (float): Scale of the fiber noise, needs u_fiber > 0 (0 to 1)
 * - u_folds (float): Depth of the centered, irregular field of facets across the sheet (0 to 1)
 * - u_foldCount (float): Number of folds, needs u_folds > 0 (1 to 15)
 * - u_creases (float): Depth of the straight creases, alternating between ridges and valleys (0 to 1)
 * - u_creaseSizeX (float): Size of the vertical creases, needs u_creases > 0 (0 to 1)
 * - u_creaseSizeY (float): Size of the horizontal creases, needs u_creases > 0 (0 to 1)
 * - u_creaseOffsetX (float): Shifts the vertical creases across the surface, needs u_creases > 0 (0 to 1)
 * - u_creaseOffsetY (float): Shifts the horizontal creases across the surface, needs u_creases > 0 (0 to 1)
 * - u_angle (float): Direction the surface is lit from in degrees, clockwise from the top of the canvas, needs u_folds or u_creases > 0 (0 to 360)
 * - u_drops (float): Visibility of the speckle pattern (0 to 1)
 * - u_seed (float): Seed applied to folds and drops (0 to 1000)
 * - u_blending (float): How much the image is printed into the paper; 0 = exact image, 1 = image multiplied with a grayscale paper-texture ink (toned by colorShadow) and thinned so the background reads through, needs image (0 to 1)
 * - u_distortion (float): How much the image bends with the paper surface; negative values bend it the opposite direction, needs image (-1 to 1)
 * - u_clip (bool): Hides the paper texture outside the distorted image frame, needs image
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
export const paperTextureFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec4 u_colorShadow;
uniform vec4 u_colorBack;

uniform sampler2D u_image;
uniform bool u_isImage;
uniform float u_imageAspectRatio;

uniform float u_roughness;
uniform float u_fiber;
uniform float u_fiberSize;
uniform float u_folds;
uniform float u_foldCount;
uniform float u_creases;
uniform float u_creaseSizeX;
uniform float u_creaseSizeY;
uniform float u_creaseOffsetX;
uniform float u_creaseOffsetY;
uniform float u_angle;
uniform float u_drops;
uniform float u_seed;
uniform float u_blending;
uniform float u_distortion;
uniform float u_roughnessSize;
uniform bool u_clip;
uniform sampler2D u_noiseTexture;

in vec2 v_imageUV;
out vec4 fragColor;

#define CREASE_WEAR .6
#define LIFT_SHARPNESS 4.
#define GRAIN_DRAG .2

#define TILT_FLOOR .9
#define RADIAL_FALLOFF .7
#define FACET_CURVE 1.5
#define FOLD_LIT_GAIN .35
#define SHADING_SCALE 1.

float getUvFrame(vec2 uv, float blur) {
  float left = smoothstep(0., blur, uv.x);
  float right = 1. - smoothstep(1. - blur, 1., uv.x);
  float bottom = smoothstep(0., blur, uv.y);
  float top = 1. - smoothstep(1. - blur, 1., uv.y);
  return left * right * bottom * top;
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

${declarePI}
${proceduralHash22}

float getRoughness(vec2 p) {
  vec2 u = p / vec2(2, 4);
  float w = max(length(dFdx(p * .1)), length(dFdy(p * .1)));
  float eps = 4. * w;

  float size = mix(3.2, .6, u_roughnessSize);
  float logLac = log2(2.1);
  float level = -log2(w + 1e-8) / logLac;
  float baseLevel = floor(level) - 2.;
  float fade = fract(level);

  vec2 px = (u.x + vec2(eps, -eps)) * .1;
  float py = u.y * .1;

  vec2 sum = vec2(0.);
  float norm = 0., amp = .5;
  for (int i = 0; i < 4; i++) {
    float absIdx = baseLevel + float(i);
    float freq = exp2(absIdx * logLac);
    vec2 qx = size * px * freq;
    float qy = size * py * freq;

    float wi = 1.;
    if (i == 0) wi = 1. - fade;
    if (i == 3) wi = fade;

    vec2 fx = fract(qx);
    float fy = fract(qy);
    float shift = .5 + absIdx * .3;
    float uvY = floor(qy) / 50. + shift;
    vec2 s0a = texture(u_noiseTexture, fract(vec2(floor(qx.x) / 50. + shift, uvY))).rg;
    vec2 s1a = texture(u_noiseTexture, fract(vec2( ceil(qx.x) / 50. + shift, uvY))).rg;
    vec2 s0b = texture(u_noiseTexture, fract(vec2(floor(qx.y) / 50. + shift, uvY))).rg;
    vec2 s1b = texture(u_noiseTexture, fract(vec2( ceil(qx.y) / 50. + shift, uvY))).rg;
    vec2 ny0 = mix(vec2(s0a.r, s0b.r), vec2(s0a.g, s0b.g), fy);
    vec2 ny1 = mix(vec2(s1a.r, s1b.r), vec2(s1a.g, s1b.g), fy);
    vec2 n = mix(ny0, ny1, fx);

    sum += amp * wi * n;
    norm += amp * wi;
    amp *= .8;
  }

  vec2 r = sum / norm;
  float dx = .5 + r.x - r.y;
  return 3. * dx * dx - .7;
}

float getFiber(vec2 p) {
  float size = mix(4.5, 1.2, u_fiberSize);
  float w = max(length(dFdx(p)), length(dFdy(p)));
  float level = -log2(w + 1e-8);
  float baseLevel = floor(level) - 3.;
  float fade = fract(level);

  vec2 grad = vec2(0.);
  float scale = 1.;
  float amp = 1.;
  for (int i = 0; i < 5; i++) {
    float absIdx = baseLevel + float(i);
    float freq = exp2(absIdx * 0.76553);
    vec2 q = size * p * freq;

    float an = absIdx * .8;
    float rc = cos(an), rs = sin(an);
    q = vec2(rc * q.x - rs * q.y, rs * q.x + rc * q.y);

    float wi = 1.;
    if (i == 0) wi = 1. - fade;
    if (i == 4) wi = fade;

    vec2 iq = floor(q);
    vec2 fq = fract(q);
    float shift = absIdx * .3;
    vec4 uv = fract(vec4(iq, iq + 1.) / 50. + .5 + shift);
    float aF = texture(u_noiseTexture, uv.xy).b;
    float bF = texture(u_noiseTexture, uv.zy).b;
    float cF = texture(u_noiseTexture, uv.xw).b;
    float dF = texture(u_noiseTexture, uv.zw).b;
    vec2 u = fq * fq * (3. - 2. * fq);
    vec2 du = 8. * fq * (1. - fq);
    float dx = du.x * mix(bF - aF, dF - cF, u.y);
    float dy = du.y * mix(cF - aF, dF - bF, u.x);
    grad += wi * amp * scale * vec2(rc * dx + rs * dy, -rs * dx + rc * dy);
    scale *= 1.7;
    amp *= .5;
  }

  return .5 * length(grad) - .5;
}

vec2 smoothNoise(vec2 p) {
  vec2 t = p * 50. - .5;
  vec2 i = floor(t);
  vec2 f = fract(t);
  f = f * f * (3. - 2. * f);
  return texture(u_noiseTexture, fract((i + f + .5) / vec2(50.))).rg;
}

float getDrops(vec2 uv) {
  vec2 iDropsUV = floor(uv);
  vec2 fDropsUV = fract(uv);
  float dropsMinDist = 1.;
  for (int y = -1; y < 2; y += 1) {
    for (int x = -1; x < 2; x += 1) {
      vec2 neighbor = vec2(float(y), float(x));
      vec2 offset = hash22(iDropsUV + neighbor);
      offset = .5 + .5 * sin(10. * u_seed + TWO_PI * offset);
      vec2 pos = neighbor + offset - fDropsUV;
      dropsMinDist *= min(1., dot(pos, pos));
    }
  }
  return 1. - lst(.05, .09, sqrt(sqrt(dropsMinDist)));
}

vec2 getCellTilt(float idx, float radius) {
  vec2 rand = hash22(vec2(idx + 31., idx * u_seed + 17.));
  float an = floor(rand.x * 24.) / 24. * TWO_PI;
  return vec2(cos(an), sin(an)) * mix(TILT_FLOOR, 1., rand.y) * mix(RADIAL_FALLOFF, 1., radius);
}

vec4 getFolds(vec2 uv) {
  float near = 9., nearB = 9.;
  float idx = 0., rad = 0.;
  vec2 nearP = vec2(0.), nearPb = vec2(0.);
  for (int i = 0; i < ${paperTextureMeta.maxFoldCount}; i++) {
    if (float(i) >= floor(u_foldCount + .5)) break;
    vec2 rand = hash22(vec2(float(i), float(i) * u_seed));
    float an = rand.x * TWO_PI;
    vec2 p = vec2(cos(an), sin(an)) * rand.y;

    vec2 d = uv - p;
    float dsq = dot(d, d);
    if (dsq < near) {
      nearB = near;
      nearPb = nearP;
      near = dsq;
      idx = float(i);
      rad = rand.y;
      nearP = p;
    } else if (dsq < nearB) {
      nearB = dsq;
      nearPb = p;
    }
  }
  float l = sqrt(near), lb = sqrt(nearB);

  float edge = lst(0., .5, lb - l);
  vec2 edgeGrad = (uv - nearPb) / max(lb, 1e-4) - (uv - nearP) / max(l, 1e-4);

  return vec4(getCellTilt(idx, rad) + FACET_CURVE * (1. - edge) * edgeGrad, .2 * l, edge);
}

void getCreases(vec2 coord, vec2 offset, vec2 count, out vec2 slope, out vec2 dark, out vec2 lift) {
  vec2 g = (coord - 1.) * count + .5 * offset;
  vec2 creaseIdx = floor(g);
  vec2 dx = fract(g) - .5;
  float foldWidth = .5;
  vec2 parity = (1. - 2. * mod(creaseIdx, 2.));
  slope = sign(dx) * (1. - smoothstep(0., foldWidth, abs(dx))) * parity;
  dark = smoothstep(0., foldWidth * .5, abs(dx));
  lift = pow(1. - clamp(abs(dx) / foldWidth, 0., 1.), vec2(LIFT_SHARPNESS)) * parity;
}

vec3 blendMultiply(vec3 base, vec3 blend) {
  return base * blend;
}
vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
  return blendMultiply(base, blend) * opacity + base * (1. - opacity);
}

void main() {

  vec2 imageUV = v_imageUV;
  vec2 fromCenter = imageUV - .5;
  vec2 patternUV = v_imageUV - .5;
  patternUV *= 5. * vec2(u_imageAspectRatio, 1.);

  float pattern = 0.;
  float radialDistortion = 0.;
  float xDistortion = 0.;
  float yShift = 0.;
  float scaleDistortion = 0.;

  float drops = 0.;
  if (u_drops > 0.) {
    drops = getDrops(patternUV * 2.);
  }

  float grazing = 0.7;
  float lightRad = radians(u_angle);
  vec2 lightDir = vec2(sin(lightRad), -cos(lightRad));
  vec2 relief = vec2(0.);
  float reliefAmount = 0.;
  float creaseInk = 1.;
  float creaseWear = 0.;
  vec2 foldFlow = vec2(0.);

  if (u_folds > 0.) {
    float foldRad = 4. * u_seed;
    float foldCos = cos(foldRad), foldSin = sin(foldRad);
    vec2 foldsUV = mat2(foldCos, foldSin, -foldSin, foldCos) * (patternUV * .18) +
      .012 * (smoothNoise(patternUV * .015 + u_seed) - .5);
    vec4 folds = getFolds(foldsUV);

    vec2 foldTilt = .5 * u_folds * folds.xy;
    foldTilt -= (1. - FOLD_LIT_GAIN) * max(dot(foldTilt, lightDir), 0.) * lightDir;
    relief += foldTilt;
    reliefAmount += .5 * u_folds;
    foldFlow = folds.w * foldTilt;

    scaleDistortion = .15 * clamp(5. * folds.z, 0., 1.) * u_folds;
  }

  if (u_creases > 0.) {
    vec2 uv = 1. + patternUV * .2 + .03 * foldFlow;

    // x drives the creases running vertically, y the ones running across them.
    vec2 slope, dark, lift;
    getCreases(uv, vec2(1. - 2. * u_creaseOffsetX, 1. - 2. * u_creaseOffsetY),
      vec2(mix(3., .5, u_creaseSizeX), mix(3., .5, u_creaseSizeY)), slope, dark, lift);

    relief += u_creases * slope;
    reliefAmount += 1. * u_creases;
    vec2 ink = mix(vec2(.9), vec2(1.), dark);
    creaseInk *= ink.x * ink.y;
    creaseWear = max(creaseWear, max(1. - dark.x, 1. - dark.y) * u_creases);
    vec2 dropMask = mix(vec2(1.), dark, u_creases);
    drops *= dropMask.x * dropMask.y;

    yShift += .022 * u_creases * lift.x * abs(lightDir.x);
    patternUV.y += yShift;

    float xFan = 2. * (imageUV.x - .5) * abs(lightDir.y);
    xDistortion -= .02 * u_creases * lift.y * xFan;
    patternUV.x -= .022 * u_creases * lift.y * xFan;
  }

  float unlit = SHADING_SCALE * cos(grazing);
  float lit = unlit;

  if (reliefAmount > 0.) {
    float slope = clamp(dot(relief, lightDir), -1.2, 1.2);
    lit = SHADING_SCALE * max(cos(slope + grazing), 0.);

    pattern += (clamp(reliefAmount, 0., 1.) * unlit + (lit - unlit)) * creaseInk;
  }

  patternUV += GRAIN_DRAG * foldFlow;

  float detailGain = (1. + CREASE_WEAR * creaseWear);

  if (u_roughness > 0.) {
    float roughness = getRoughness(200. * patternUV);
    roughness *= u_roughness * detailGain;
    pattern += roughness;
    radialDistortion += .02 * roughness;
  }

  if (u_fiber > 0.) {
    float fiber = getFiber(10. * patternUV);
    fiber *= u_fiber * detailGain;
    pattern += fiber;
    radialDistortion += .02 * fiber;
  }

  if (u_drops > 0.) {
    drops *= u_drops;
    pattern += drops;
    xDistortion += .03 * drops;
  }

  vec3 bgColor = u_colorBack.rgb;
  float bgOpacity = u_colorBack.a;

  vec3 shadowColor = u_colorShadow.rgb;
  float shadowOpacity = u_colorShadow.a;

  imageUV = .5 + fromCenter * (1. - u_distortion * scaleDistortion);
  imageUV -= u_distortion * vec2(xDistortion, -yShift);
  vec2 dc = imageUV - .5;
  float r2 = dot(dc, dc);
  imageUV = .5 + dc * (1. - abs(u_distortion) * radialDistortion * r2);

  float patternAlpha = clamp(shadowOpacity * pattern, 0., 1.);

  vec3 pic = vec3(0.);
  float imageFootprint = 0.;

  if (u_isImage) {
    float frame = getUvFrame(imageUV, .005);
    vec4 image = texture(u_image, imageUV);

    float maxC = max(max(image.r, image.g), image.b);
    float minC = min(min(image.r, image.g), image.b);
    float sat = maxC > 0. ? (maxC - minC) / maxC : 0.;
    float midC = image.r + image.g + image.b - maxC - minC;
    float secondaryness = maxC > minC ? (midC - minC) / (maxC - minC) : 0.;
    float satDampen = sat * (1. - .5 * secondaryness);

    float lum = dot(vec3(.2126, .7152, .0722), image.rgb);

    vec3 ink = mix(vec3(1.), shadowColor, patternAlpha);
    pic = blendMultiply(image.rgb, ink, u_blending);

    float darkDampen = 1. - lum;
    float dampen = mix(0., .7, u_blending) * max(satDampen, darkDampen);
    pic = mix(pic, vec3(1.), .4 * pow(dampen, 2. + 3. * pattern));
    pic = clamp(pic, 0., 1.);

    imageFootprint = frame * image.a;
  }

  float imageAlpha = imageFootprint;

  vec3 overlay = pic * imageAlpha + shadowColor * patternAlpha * (1. - imageAlpha);
  float overlayAlpha = imageAlpha + patternAlpha * (1. - imageAlpha);

  vec3 color = overlay + bgColor * bgOpacity * (1. - overlayAlpha);
  float opacity = overlayAlpha + bgOpacity * (1. - overlayAlpha);

  if (u_clip && u_isImage) {
    color *= imageFootprint;
    opacity *= imageFootprint;
  }

  fragColor = vec4(color, opacity);
}
`;

export interface PaperTextureUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_isImage: boolean;
  u_noiseTexture?: HTMLImageElement;
  u_colorShadow: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_roughness: number;
  u_roughnessSize: number;
  u_fiber: number;
  u_fiberSize: number;
  u_folds: number;
  u_foldCount: number;
  u_creases: number;
  u_creaseSizeX: number;
  u_creaseSizeY: number;
  u_creaseOffsetX: number;
  u_creaseOffsetY: number;
  u_angle: number;
  u_drops: number;
  u_seed: number;
  u_blending: number;
  u_distortion: number;
  u_clip: boolean;
}

export interface PaperTextureParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorShadow?: string;
  colorBack?: string;
  roughness?: number;
  roughnessSize?: number;
  fiber?: number;
  fiberSize?: number;
  folds?: number;
  foldCount?: number;
  creases?: number;
  creaseSizeX?: number;
  creaseSizeY?: number;
  creaseOffsetX?: number;
  creaseOffsetY?: number;
  angle?: number;
  drops?: number;
  seed?: number;
  blending?: number;
  distortion?: number;
  clip?: boolean;
}

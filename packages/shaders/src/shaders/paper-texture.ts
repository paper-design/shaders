import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { rotation2, declarePI } from '../shader-utils.js';

export const paperTextureMeta = {
  maxFoldCount: 20,
} as const;

/**
 * A static texture built from multiple noise layers, usable for realistic paper and cardboard surfaces.
 * Can be used as an image filter or as a standalone texture.
 *
 * Fragment shader uniforms:
 * - u_image (sampler2D): Optional source image texture
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorFront (vec4): Foreground color in RGBA
 * - u_colorBack (vec4): Background color in RGBA
 * - u_roughness (float): Hi-freq grain-like distortion intensity (0 to 1)
 * - u_roughnessSize (float): Scale of the roughness noise (0 to 1)
 * - u_fiber (float): Curly-shaped noise intensity (0 to 1)
 * - u_fiberSize (float): Curly-shaped noise scale (0 to 1)
 * - u_crumples (float): Cell-based crumple pattern intensity (0 to 1)
 * - u_crumpleSize (float): Cell-based crumple pattern scale (0 to 1)
 * - u_folds (float): Depth of the folds (0 to 1)
 * - u_foldType (float): Type of folds pattern (0 = radial folds, 1 = creases)
 * - u_foldCount (float): Size/frequency of folds or creases (0 to 1)
 * - u_foldsShape (float): Shape/width of the folds (0 to 1)
 * - u_drops (float): Visibility of speckle / drop pattern (0 to 1)
 * - u_seed (float): Seed applied to folds, crumples and dots (0 to 1000)
 * - u_fade (float): Large-scale noise mask applied to the pattern (0 to 1)
 * - u_blending (float): Amount of image-to-paper blending, 0 for original color, 1 for mix with colorBack (0 to 1)
 * - u_distortion (float): Amount of distortion of the image by the paper normals (0 to 1)
 * - u_background (bool): Shows or hides the paper texture outside the image frame
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

uniform vec2 u_resulution;
uniform vec4 u_colorFront;
uniform vec4 u_colorBack;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_roughness;
uniform float u_fiber;
uniform float u_fiberSize;
uniform float u_crumples;
uniform float u_crumpleSize;
uniform float u_folds;
uniform float u_foldType;
uniform float u_foldCount;
uniform float u_foldsShape;
uniform float u_drops;
uniform float u_seed;
uniform float u_fade;
uniform float u_blending;
uniform float u_distortion;
uniform float u_roughnessSize;
uniform bool u_background;
uniform sampler2D u_noiseTexture;

in vec2 v_imageUV;
out vec4 fragColor;

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
float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

${ declarePI }
${ rotation2 }
float randomR(vec2 p) {
  vec2 uv = floor(p) / 100. + .5;
  return texture(u_noiseTexture, fract(uv)).r;
}
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}
float getFadeMask(vec2 n) {
  float total = 0.0, amplitude = .4;
  for (int i = 0; i < 2; i++) {
    total += valueNoise(n) * amplitude;
    n *= 1.99;
    amplitude *= 0.65;
  }
  return total;
}

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
    float freq = pow(2.1, absIdx);
    vec2 qx = size * px * freq;
    float qy = size * py * freq;

    float wi = 1.;
    if (i == 0) wi = 1. - fade;
    if (i == 4) wi = fade;

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
  return 3. * dx * dx;
}

float getFiber(vec2 p) {
  float size = mix(2., .4, u_fiberSize);
  float w = max(length(dFdx(p)), length(dFdy(p)));
  float level = -log2(w + 1e-8);
  float baseLevel = floor(level) - 3.;
  float fade = fract(level);

  vec2 grad = vec2(0.);
  float scale = 1.;
  float amp = 1.;
  for (int i = 0; i < 5; i++) {
    float absIdx = baseLevel + float(i);
    float freq = pow(1.7, absIdx);
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

  return min(1., .5 * length(grad));
}

vec2 randomGB(vec2 p) {
  vec2 uv = floor(p) / 50. + .5;
  return texture(u_noiseTexture, fract(uv)).gb;
}

float getCrumples(vec2 uv) {
  vec2 t = uv * .5;
  vec2 p = floor(t);
  vec2 wsum = vec2(0.), cl = vec2(0.);
  for (int y = -1; y < 2; y += 1) {
    for (int x = -1; x < 2; x += 1) {
      vec2 b = vec2(float(x), float(y));
      vec2 q = b + p;
      vec2 qm = mod(q, 8.);
      vec2 c = q + randomGB(qm + u_seed);
      float val = .5 + .5 * sin((qm.x + qm.y * 5.) * 8.);
      vec2 r = c - t;
      float wy = sst(0., 1., 1. - abs(r.y));
      wy *= wy; wy *= wy; wy *= wy; wy *= wy;  // pow16
      vec2 w = smoothstep(0., 1., 1. - abs(vec2(r.x, r.x - .0125)));
      w *= w; w *= w; w *= w; w *= w;  // pow16
      w *= wy;
      cl += val * w; 
      wsum += w;
    }
  }
  vec2 n = cl / wsum;
  return 4. * (n.y - n.x);
}

float getDrops(vec2 uv) {
  vec2 iDropsUV = floor(uv);
  vec2 fDropsUV = fract(uv);
  float dropsMinDist = 1.;
  for (int y = -1; y < 2; y += 1) {
    for (int x = -1; x < 2; x += 1) {
      vec2 neighbor = vec2(float(y), float(x));
      vec2 offset = randomGB(iDropsUV + neighbor);
      offset = .5 + .5 * sin(10. * u_seed + TWO_PI * offset);
      vec2 pos = neighbor + offset - fDropsUV;
      float dist = length(pos);
      dropsMinDist = min(dropsMinDist, dropsMinDist*dist);
    }
  }
  return 1. - lst(.05, .09, sqrt(dropsMinDist));
}

vec4 getFolds(vec2 uv1, vec2 uv2) {
  vec3 pp1 = vec3(0.), pp2 = vec3(0.);
  float l1 = 9., l2 = 9.;
  float cellRand = 0.;
  for (int i = 0; i < ${ paperTextureMeta.maxFoldCount }; i++) {
    if (float(i) >= u_foldCount) break;
    vec2 rand = randomGB(vec2(float(i), float(i) * u_seed));
    float an = rand.x * TWO_PI;
    vec2 p = vec2(cos(an), sin(an)) * rand.y;
    float dist1 = distance(uv1, p);
    if (dist1 < l1) {
      l1 = dist1;
      pp1 = vec3(uv1.x - p.x, dist1, rand.y);
    }
    float dist2 = distance(uv2, p);
    if (dist2 < l2) {
      l2 = dist2;
      pp2 = vec3(uv2.x - p.x, dist2, rand.y);
      cellRand = .5 * (rand.x + rand.y);
    }
  }
  float mult2 = mix(.22, .02, 1.);
  return vec4(
    mix(pp1.x, .17 * pp1.z, pow(pp1.y, mult2)),
    mix(pp2.x, .18 * pp2.z, pow(pp2.y, mult2)),
    .2 * pp2.y,
    cellRand
  );
}

vec3 getGrid(vec2 uv) {
  float gridX = fract(uv.x * u_foldCount + .5 * mod(u_foldCount, 2.));
  float dx = gridX - .5;
  float foldWidth = mix(.1, .45, u_foldsShape);
  float foldAmount = 1. - smoothstep(0., foldWidth, abs(dx));
  float angle = sign(dx) * 1.1345 * foldAmount;
  float creaseDark = smoothstep(0., foldWidth * .5, abs(dx));
  float grid = max(-.5 * sin(angle) + .5 * cos(angle), 0.) * mix(.9, 1., creaseDark);
  return vec3(grid, creaseDark, abs(dx));
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

  float ySide = (imageUV.y - .5);
  float ySidePower = sign(ySide) * mix(1., .7, step(0., ySide)) * abs(ySide);

  float pattern = 0.;
  float radialDistortion = 0.;
  float xDistortion = 0.;
  float yDistortion = 0.;
  float scaleDistortion = 0.;

  float fade = u_fade * getFadeMask(.3 * patternUV + 10. * u_seed);
  fade = clamp(8. * fade * fade * fade, 0., 1.);

  float drops = getDrops(patternUV * 2.);
  drops = mix(drops, 0., fade);

  float foldsPattern = 0.;
  if (u_foldType < .5) {
    vec2 foldsUV1 = rotate(patternUV * .18, 4. * u_seed);
    vec2 foldsUV2 = foldsUV1 + .02 * sin(2. * u_seed) * (texture(u_noiseTexture, fract(patternUV * .02 + u_seed)).rg - .5);
    vec4 foldsRaw = getFolds(foldsUV1, foldsUV2);
    vec4 radialFolds = vec4(clamp(5. * foldsRaw.xyz, 0., 1.), foldsRaw.w);
    radialFolds.xyz = mix(radialFolds.xyz, vec3(.5), .4 * fade);
    foldsPattern = radialFolds.x + radialFolds.y;

    pattern += u_folds * foldsPattern;
    
    vec2 fromCenter = imageUV - .5;
    scaleDistortion = .22 * radialFolds.z;
    scaleDistortion *= u_folds;
  } else {
    vec3 creasesResult = getGrid(imageUV + .5);
    foldsPattern = creasesResult.x;
    drops *= mix(1., creasesResult.y, u_folds);

    pattern += u_folds * foldsPattern;
    float distortBase = mix(pow(creasesResult.y, .2), creasesResult.z, pow(u_foldsShape, 3.));
    yDistortion -= mix(.1, .02, u_foldCount / float(${ paperTextureMeta.maxFoldCount })) * (1. - distortBase);
    patternUV.y -= yDistortion * ySidePower;
  }
  
  vec2 roughnessUV = 200. * patternUV;
  vec2 fiberUV = 10. * patternUV;
  float roughness = getRoughness(roughnessUV);
  float fiber = getFiber(fiberUV);
  fiber *= mix(1., .5, fade);
  roughness *= mix(1., .5, fade);

  fiber *= u_fiber;
  pattern += fiber;
  radialDistortion += .02 * fiber;

  roughness *= u_roughness;
  pattern += roughness;
  radialDistortion += .02 * roughness;

  vec2 crumplesUV = mix(14.4, .64, pow(u_crumpleSize, .3)) * patternUV - 32. * u_seed;
  float crumples = clamp(.2 + getCrumples(crumplesUV), 0., 1.);
  crumples = mix(crumples, 0., fade);

  pattern += u_crumples * crumples;
  yDistortion -= .01 * u_crumples * (crumples - .25);

  drops *= u_drops;
  pattern += drops;
  xDistortion += .03 * drops;

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  imageUV = .5 + fromCenter * (1. + u_distortion * scaleDistortion);
  imageUV.x += u_distortion * xDistortion;
  imageUV.y -= u_distortion * yDistortion * ySidePower;
  vec2 dc = imageUV - .5;
  float r2 = dot(dc, dc);
  imageUV = .5 + dc * (1. - abs(u_distortion) * radialDistortion * r2);

  float frameSoftness = .002 + .005 * abs(u_distortion) * (.7 * u_fiber + u_roughness + .2 * u_crumples);
  float frame = getUvFrame(imageUV, frameSoftness);
  vec4 image = texture(u_image, imageUV);
  frame *= image.a;
  frame = mix(frame, 0., .2 * fade);

  vec3 color = fgColor * pattern;
  float opacity = fgOpacity * pattern;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  float maxC = max(max(image.r, image.g), image.b);
  float minC = min(min(image.r, image.g), image.b);
  float sat = maxC > 0. ? (maxC - minC) / maxC : 0.;
  float midC = image.r + image.g + image.b - maxC - minC;
  float secondaryness = maxC > minC ? (midC - minC) / (maxC - minC) : 0.;
  float satDampen = sat * (1. - .5 * secondaryness);
  float darkDampen = 1. - dot(vec3(.2126, .7152, .0722), image.rgb);
  float dampen = mix(0., .7, u_blending) * max(satDampen, darkDampen);

  vec3 pic = blendMultiply(image.rgb, color, u_blending);
  pic = mix(pic, vec3(1.), .4 * pow(dampen, 2. + 3. * pattern));

  color = mix(color, pic, frame);

  if (!u_background) {
    opacity *= frame;
    color *= frame;
  }

  fragColor = vec4(color, opacity);
}
`;

export interface PaperTextureUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_noiseTexture?: HTMLImageElement;
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_roughness: number;
  u_roughnessSize: number;
  u_fiber: number;
  u_fiberSize: number;
  u_crumples: number;
  u_folds: number;
  u_foldType: number;
  u_foldCount: number;
  u_foldsShape: number;
  u_fade: number;
  u_crumpleSize: number;
  u_drops: number;
  u_seed: number;
  u_blending: number;
  u_distortion: number;
  u_background: boolean;
}

export interface PaperTextureParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorFront?: string;
  colorBack?: string;
  roughness?: number;
  roughnessSize?: number;
  fiber?: number;
  fiberSize?: number;
  crumples?: number;
  folds?: number;
  foldType?: PaperTextureFoldType;
  foldCount?: number;
  foldsShape?: number;
  fade?: number;
  crumpleSize?: number;
  drops?: number;
  seed?: number;
  blending?: number;
  distortion?: number;
  background?: boolean;
}

export type PaperTextureFoldType = 'folds' | 'creases';

export const PaperTextureFoldTypes: Record<PaperTextureFoldType, number> = {
  folds: 0,
  creases: 1,
};

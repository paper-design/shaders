import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { rotation2, declarePI } from '../shader-utils.js';

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
 * - u_roughnessSize (float): Scale of the roughness pattern (0 to 1)
 * - u_fiber (float): Curly-shaped noise intensity (0 to 1)
 * - u_fiberSize (float): Curly-shaped noise scale (0 to 1)
 * - u_crumples (float): Cell-based crumple pattern intensity (0 to 1)
 * - u_crumpleSize (float): Cell-based crumple pattern scale (0 to 1)
 * - u_folds (float): Depth of the folds (0 to 1)
 * - u_foldType (float): Type of folds pattern (0 = radial folds, 1 = creases)
 * - u_foldCount (float): Number of folds or creases (1 to 20)
 * - u_foldsShape (float): Shape/width of the folds (0 to 1)
 * - u_drops (float): Visibility of speckle / drop pattern (0 to 1)
 * - u_seed (float): Seed applied to folds, crumples and dots (0 to 1000)
 * - u_fade (float): Large-scale noise mask applied to the pattern (0 to 1)
 * - u_blending (float): Amount of image-to-paper blending, 0 for original color, 1 for mix with colorBack (0 to 1)
 * - u_distortion (float): Amount of distortion of the image by the paper normals (0 to 1)
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

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_roughnessSize;
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

uniform sampler2D u_noiseTexture;

in vec2 v_imageUV;
out vec4 fragColor;

float getUvFrame(vec2 uv) {
  float aa = .01 * u_distortion;
  float left = smoothstep(0., aa, uv.x);
  float right = 1. - smoothstep(1. - aa, 1., uv.x);
  float bottom = smoothstep(0., aa, uv.y);
  float top = 1. - smoothstep(1. - aa, 1., uv.y);
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

vec2 getRoughnessFiber(vec2 pR, vec2 pF) {
  float roughDx = 0.;
  vec2 fiberGrad = vec2(0.);
  pR *= .1;
  float scaleR = .1;
  float scaleF = 1.;
  float amplitude = 1.;
  float c = 0.7648;  // cos(0.7)
  float s = 0.6442;  // sin(0.7)
  float rc = 1., rs = 0.;  // accumulated rotation
  for (int i = 0; i < 4; i++) {
    if (i < 3) {
      vec2 ipR = floor(pR);
      vec2 fpR = fract(pR);
      vec4 uvR = fract(vec4(ipR, ipR + 1.) / 50. + .5);
      float aR = texture(u_noiseTexture, uvR.xy).r;
      float bR = texture(u_noiseTexture, uvR.xw).r;
      float cR = texture(u_noiseTexture, uvR.zy).r;
      float dR = texture(u_noiseTexture, uvR.zw).r;
      roughDx += scaleR * mix(cR - aR, dR - bR, fpR.y);
      pR *= 2.1;
      scaleR *= 2.1;
    }
    pF = vec2(c * pF.x - s * pF.y, s * pF.x + c * pF.y);
    float rc2 = rc * c - rs * s;
    rs = rs * c + rc * s;
    rc = rc2;
    vec2 ipF = floor(pF);
    vec2 fpF = fract(pF);
    vec4 uvF = fract(vec4(ipF, ipF + 1.) / 50. + .5);
    float aF = texture(u_noiseTexture, uvF.xy).b;
    float bF = texture(u_noiseTexture, uvF.zy).b;
    float cF = texture(u_noiseTexture, uvF.xw).b;
    float dF = texture(u_noiseTexture, uvF.zw).b;
    vec2 u = fpF * fpF * (3. - 2. * fpF);
    vec2 du = 6. * fpF * (1. - fpF);
    float dxF = du.x * mix(bF - aF, dF - cF, u.y);
    float dyF = du.y * mix(cF - aF, dF - bF, u.x);
    fiberGrad += amplitude * scaleF * vec2(rc * dxF + rs * dyF, -rs * dxF + rc * dyF);
    pF *= 2.;
    scaleF *= 2.;
    amplitude *= 0.6;
  }
  return vec2(roughDx, length(fiberGrad));
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

vec2 getFolds(vec2 uv1, vec2 uv2) {
  vec3 pp1 = vec3(0.), pp2 = vec3(0.);
  float l1 = 9., l2 = 9.;
  for (int i = 0; i < 15; i++) {
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
    }
  }
  float mult2 = mix(.22, .02, u_foldsShape);
  return vec2(
    mix(pp1.x, .17 * pp1.z, pow(pp1.y, mult2)),
    mix(pp2.x, .18 * pp2.z, pow(pp2.y, mult2))
  );
}

vec2 getGrid(vec2 uv) {
  float gridX = fract(uv.x * .1 * u_foldCount + .5);
  float dx = gridX - .5;
  float foldWidth = u_foldsShape;
  float foldAmount = 1. - smoothstep(0., foldWidth, abs(dx));
  float angle = sign(dx) * 1.1345 * foldAmount;
  float creaseDark = smoothstep(0., foldWidth * .5, abs(dx));
  float grid = max(-.5 * sin(angle) + .5 * cos(angle), 0.) * mix(.9, 1., creaseDark);
  return vec2(grid, creaseDark);
}

vec3 blendMultiply(vec3 base, vec3 blend) {
  return base * blend;
}
vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
  return blendMultiply(base, blend) * opacity + base * (1. - opacity);
}

void main() {

  vec2 imageUV = v_imageUV;
  vec2 patternUV = v_imageUV - .5;
  patternUV *= 5. * vec2(u_imageAspectRatio, 1.);

  float pattern = 0.;
  float distortionPatternRadial = 0.;
  float distortionPatternLinear = 0.;

  float fade = u_fade * getFadeMask(.3 * patternUV + 10. * u_seed);
  fade = clamp(8. * fade * fade * fade, 0., 1.);

  vec2 roughnessUV = mix(330., 100., u_roughnessSize) * patternUV;
  vec2 fiberUV = mix(22., 4., u_fiberSize) * patternUV;
  vec2 rf = getRoughnessFiber(roughnessUV, fiberUV);
  float roughness = clamp(5. * rf.x, 0., 1.);
  float fiber = clamp(rf.y - 1., -1., 1.);
  fiber *= mix(1., .5, fade);
  roughness *= mix(1., .5, fade);

  fiber *= (.05 + u_fiber);
  pattern += fiber;
  distortionPatternRadial += .06 * fiber;

  roughness *= (.05 + u_roughness);
  pattern += roughness;
  distortionPatternRadial += .05 * roughness;

  vec2 crumplesUV = mix(14.4, .64, pow(u_crumpleSize, .3)) * patternUV - 32. * u_seed;
  float crumples = clamp(.2 + getCrumples(crumplesUV), 0., 1.);
  crumples = mix(crumples, 0., fade);
  
  pattern += u_crumples * crumples;
  distortionPatternLinear -= .08 * u_crumples * (crumples - .25);

  float drops = getDrops(patternUV * 2.);
  drops = mix(drops, 0., fade);

  float foldsPattern = 0.;
  if (u_foldType < .5) {
    vec2 foldsUV1 = rotate(patternUV * .18, 4. * u_seed);
    vec2 foldsUV2 = foldsUV1 + .015 * sin(2. * u_seed) * (texture(u_noiseTexture, fract(patternUV * .02 + u_seed)).rg - .5);
    vec2 radialFolds = clamp(5. * getFolds(foldsUV1, foldsUV2), 0., 1.);
    radialFolds = mix(radialFolds, vec2(0.), fade);
    foldsPattern = radialFolds.x + radialFolds.y;

    pattern += u_folds * foldsPattern;
    distortionPatternRadial += .2 * u_folds * (foldsPattern - 1.);
  } else {
    vec2 creasesResult = clamp(getGrid(patternUV), 0., 1.);
    foldsPattern = creasesResult.x * mix(1., .0, fade);
    drops *= mix(1., creasesResult.y, u_folds);

    pattern += u_folds * foldsPattern;
    distortionPatternLinear += .03 * u_folds * (pow(creasesResult.y, .2) - .5);
  }

  drops *= u_drops;
  pattern += drops;
  distortionPatternLinear += .03 * drops;

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  imageUV.y += u_distortion * distortionPatternLinear;

  vec2 dc = imageUV - .5;
  float r2 = dot(dc, dc);
  imageUV = .5 + dc * (1. - u_distortion * distortionPatternRadial * r2);

  float frame = getUvFrame(imageUV, u_distortion);
  vec4 image = texture(u_image, imageUV);
  frame *= image.a;

  vec3 color = fgColor * pattern;
  float opacity = fgOpacity * pattern;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  float lum = dot(vec3(.2126, .7152, .0722), image.rgb);
  vec3 pic = (1. + .6 * u_blending * (1. - lum)) * blendMultiply(image.rgb, pow(color, vec3(4. - 3. * lum)), u_blending);
  
  color = mix(color, pic, frame);

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
}

export type PaperTextureFoldType = 'folds' | 'creases';

export const PaperTextureFoldTypes: Record<PaperTextureFoldType, number> = {
  folds: 0,
  creases: 1,
};

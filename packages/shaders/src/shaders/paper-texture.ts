import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declareImageFrame, declareRotate, declarePI, declareValueNoise, declareFiberNoise } from '../shader-utils.js';

/**
 * Mimicking paper texture with a combination of noises
 *
 * Uniforms:
 *
 * - u_noiseTexture (sampler2D): pre-computed randomizer source
 *
 */

// language=GLSL
export const paperTextureFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_contrast;
uniform float u_roughness;
uniform float u_fiber;
uniform float u_fiberScale;
uniform float u_crumples;
uniform float u_foldsNumber;
uniform float u_folds;
uniform float u_crumplesScale;
uniform float u_drops;
uniform float u_seed;
uniform float u_blur;

uniform sampler2D u_noiseTexture;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareRotate}
${declareImageFrame}


float random(vec2 p) {
  vec2 uv = floor(p) / 100. + .5;
  return texture(u_noiseTexture, fract(uv)).r;
}
${declareValueNoise}
float fbm(in vec2 n) {
  float total = 0.0, amplitude = .4;
  for (int i = 0; i < 3; i++) {
    total += valueNoise(n) * amplitude;
    n *= 1.99;
    amplitude *= 0.65;
  }
  return total;
}


float roughness_hash(vec2 p) {
  vec2 uv = floor(p) / 50. + .5;
  return texture(u_noiseTexture, fract(uv)).g;
}

float roughness_fbm(vec2 p) {
  p *= .1;
  float o = 0.;
  for (float i = 0.; ++i < 4.; p *= 2.1) {
    vec4 w = vec4(floor(p), ceil(p));
    vec2 f = fract(p);
    o += mix(
      mix(roughness_hash(w.xy), roughness_hash(w.xw), f.y),
      mix(roughness_hash(w.zy), roughness_hash(w.zw), f.y),
      f.x);
    o += .2 / exp(2. * abs(sin(.2 * p.x + .5 * p.y)));
  }
  return o / 3.;
}

${declareFiberNoise}

vec2 crumpled_noise(vec2 p) {
  vec2 uv = floor(p) / 50. + .5;
  return texture(u_noiseTexture, fract(uv)).gb;
}

float crumpled_voronoi2(vec2 t, float pw) {
  vec2 p = floor(t);
  float wsum = 0.;
  float cl = 0.;
  for (int y = -1; y < 2; y += 1) {
    for (int x = -1; x < 2; x += 1) {
      vec2 b = vec2(float(x), float(y));
      vec2 q = b + p;
      vec2 q2 = q - floor(q / 8.) * 8.;
      vec2 c = q + crumpled_noise(q2);
      vec2 r = c - t;

      float w = pow(smoothstep(0., 1., 1. - abs(r.x)), pw) * pow(smoothstep(0., 1., 1. - abs(r.y)), pw);

      cl += (.5 + .5 * sin((q2.x + q2.y * 5.) * 8.)) * w;
      wsum += w;
    }
  }
  return pow(cl / wsum, .5) * 2.;
}

float crumpled(vec2 uv) {
  return crumpled_voronoi2(uv * .25, 16.) * crumpled_voronoi2(uv * .5, 2.);
}


vec2 folds(vec2 uv) {
    vec3 pp = vec3(0.);
    float l = 9.;
    for (float i = 0.; i < 15.; i++) {
      if (i >= u_foldsNumber) break;
      vec2 rand = crumpled_noise(vec2(i, i * u_seed));
      float an = rand.x * TWO_PI;
      vec2 p = vec2(cos(an), sin(an)) * rand.y;
      float dist = distance(uv, p);
      l = min(l, dist);
      
      if (l == dist) {
        pp.xy = (uv - p.xy);
        pp.z = dist;
      }
    }
    return mix(pp.xy, vec2(0.), pow(pp.z, .25));
}

void main() {

  vec2 imageUV = v_imageUV;
  vec2 patternUV = v_imageUV - .5;
  patternUV = 5. * (patternUV * vec2(u_imageAspectRatio, 1.));

  vec2 roughnessUv = 1.5 * (gl_FragCoord.xy - .5 * u_resolution) / u_pixelRatio;
  float roughness = roughness_fbm(roughnessUv + vec2(1., 0.)) - roughness_fbm(roughnessUv - vec2(1., 0.));

  float crumplesSeed = .01 * u_seed;
  vec2 crumplesUV = fract(patternUV * .1 * u_crumplesScale + crumplesSeed) * 32.;
  float crumples = crumpled(crumplesUV + vec2(.05, 0.)) - crumpled(crumplesUV);

  vec2 fiberUV = 10. * u_fiberScale * patternUV;
  float fiber = fiberNoise(fiberUV, vec2(0.));
  fiber = .5 * (fiber - 1.);

  vec2 normal = vec2(0.);
  vec2 normalImage = vec2(0.);

  vec2 foldsUV = patternUV * .12;
  foldsUV = rotate(foldsUV, 4. * u_seed);
  vec2 w = folds(foldsUV);
  foldsUV = rotate(foldsUV + .007 * cos(u_seed), .01 * sin(u_seed));
  vec2 w2 = folds(foldsUV);

  vec2 dropsUV = patternUV * 2.;
  vec2 iDropsUV = floor(dropsUV);
  vec2 fDropsUV = fract(dropsUV);
  float dropsMinDist = 1.;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 neighbor = vec2(float(i), float(j));
      vec2 offset = crumpled_noise(iDropsUV + neighbor);
      offset = .5 + .5 * sin(10. * u_seed + TWO_PI * offset);
      vec2 pos = neighbor + offset - fDropsUV;
      float dist = length(pos);
      dropsMinDist = min(dropsMinDist, dropsMinDist*dist);
    }
  }
  float drops = 1. - smoothstep(.05, .09, pow(dropsMinDist, .5));
  
  normal.xy += u_folds * min(5. * u_contrast, 1.) * 4. * max(vec2(0.), w + w2);
  normalImage.xy += u_folds * 2. * w;

  normal.xy += u_crumples * crumples;
  normalImage.xy += 1.5 * u_crumples * crumples;

  normal.xy += 3. * u_drops * drops;
  normalImage.xy += .2 * u_drops * drops;

  float blur = u_blur * 2. * smoothstep(0., 1., fbm(.17 * patternUV + 10. * u_seed));
  normal *= (1. - blur);

  normal.xy += u_roughness * 1.5 * roughness;
  normal.xy += u_fiber * fiber * (1. - .5 * blur);
  
  normalImage += .2 * u_roughness * 1.5 * roughness;
  normalImage += .2 * u_fiber * fiber * (1. - .5 * blur);

  vec3 lightPos = vec3(1., 2., 1.);
  float res = clamp(dot(normalize(vec3(normal, 9.5 - 9. * pow(u_contrast, .1))), normalize(lightPos)), 0., 1.);

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);
  
  color -= .007 * u_drops * drops;

  imageUV += .02 * normalImage;
  vec4 image = texture(u_image, imageUV);
  image.rgb += .5 * (res - .6);

  float frame = getUvFrame(imageUV);
  color.rgb = mix(color, image.rgb, min(.8 * frame, image.a));

  fragColor = vec4(color, opacity);
}
`;

export interface PaperTextureUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_noiseTexture?: HTMLImageElement;
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_contrast: number;
  u_roughness: number;
  u_fiber: number;
  u_fiberScale: number;
  u_crumples: number;
  u_foldsNumber: number;
  u_folds: number;
  u_blur: number;
  u_crumplesScale: number;
  u_drops: number;
  u_seed: number;
}

export interface PaperTextureParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string | undefined;
  colorFront?: string;
  colorBack?: string;
  contrast?: number;
  roughness?: number;
  fiber?: number;
  fiberScale?: number;
  crumples?: number;
  foldsNumber?: number;
  folds?: number;
  blur?: number;
  crumplesScale?: number;
  drops?: number;
  seed?: number;
}

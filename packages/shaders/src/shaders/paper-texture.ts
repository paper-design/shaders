import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, rotation2, declarePI, fiberNoise, textureRandomizerR } from '../shader-utils.js';

/**
 * A static texture built from multiple noise layers, usable for realistic paper and cardboard surfaces.
 * Can be used as an image filter or as a standalone texture.
 *
 * Fragment shader uniforms:
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_image (sampler2D): Optional source image texture
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorFront (vec4): Foreground color in RGBA
 * - u_colorBack (vec4): Background color in RGBA
 * - u_contrast (float): Blending behavior, sharper vs smoother color transitions (0 to 1)
 * - u_roughness (float): Pixel noise, related to canvas and not scalable (0 to 1)
 * - u_fiber (float): Curly-shaped noise intensity (0 to 1)
 * - u_fiberSize (float): Curly-shaped noise scale (0 to 1)
 * - u_crumples (float): Cell-based crumple pattern intensity (0 to 1)
 * - u_crumpleSize (float): Cell-based crumple pattern scale (0 to 1)
 * - u_folds (float): Depth of the folds (0 to 1)
 * - u_foldCount (float): Number of folds (1 to 15)
 * - u_fade (float): Big-scale noise mask applied to the pattern (0 to 1)
 * - u_drops (float): Visibility of speckle pattern (0 to 1)
 * - u_seed (float): Seed applied to folds, crumples and dots (0 to 1000)
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

// language=WGSL
export const paperTextureFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorFront: vec4f,
  u_colorBack: vec4f,
  u_contrast: f32,
  u_roughness: f32,
  u_fiber: f32,
  u_fiberSize: f32,
  u_crumples: f32,
  u_crumpleSize: f32,
  u_folds: f32,
  u_foldCount: f32,
  u_drops: f32,
  u_seed: f32,
  u_fade: f32,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

@group(1) @binding(0) var u_image_tex: texture_2d<f32>;
@group(1) @binding(1) var u_image_samp: sampler;
@group(1) @binding(2) var u_noiseTexture_tex: texture_2d<f32>;
@group(1) @binding(3) var u_noiseTexture_samp: sampler;

${vertexOutputStruct}

fn fwidth_f32(v: f32) -> f32 {
  return abs(dpdx(v)) + abs(dpdy(v));
}

fn getUvFrame(uv: vec2f) -> f32 {
  let aax = 2.0 * fwidth_f32(uv.x);
  let aay = 2.0 * fwidth_f32(uv.y);

  let left   = smoothstep(0.0, aax, uv.x);
  let right  = 1.0 - smoothstep(1.0 - aax, 1.0, uv.x);
  let bottom = smoothstep(0.0, aay, uv.y);
  let top    = 1.0 - smoothstep(1.0 - aay, 1.0, uv.y);

  return left * right * bottom * top;
}

${ declarePI }
${ rotation2 }
${ textureRandomizerR }

fn valueNoise(st: vec2f) -> f32 {
  let i = floor(st);
  let f = fract(st);
  let a = randomR(i);
  let b = randomR(i + vec2f(1.0, 0.0));
  let c = randomR(i + vec2f(0.0, 1.0));
  let d = randomR(i + vec2f(1.0, 1.0));
  let u_val = f * f * (vec2f(3.0) - 2.0 * f);
  let x1 = mix(a, b, u_val.x);
  let x2 = mix(c, d, u_val.x);
  return mix(x1, x2, u_val.y);
}

fn fbm(n_in: vec2f) -> f32 {
  var n = n_in;
  var total: f32 = 0.0;
  var amplitude: f32 = 0.4;
  for (var i: i32 = 0; i < 3; i++) {
    total += valueNoise(n) * amplitude;
    n *= 1.99;
    amplitude *= 0.65;
  }
  return total;
}

fn randomG(p: vec2f) -> f32 {
  let uv = floor(p) / 50.0 + vec2f(0.5);
  return textureSampleLevel(u_noiseTexture_tex, u_noiseTexture_samp, fract(uv), 0.0).g;
}

fn roughnessFn(p_in: vec2f) -> f32 {
  var p = p_in * 0.1;
  var o: f32 = 0.0;
  for (var i: f32 = 1.0; i < 4.0; i += 1.0) {
    let w = vec4f(floor(p), ceil(p));
    let f = fract(p);
    o += mix(
      mix(randomG(w.xy), randomG(vec2f(w.x, w.w)), f.y),
      mix(randomG(vec2f(w.z, w.y)), randomG(w.zw), f.y),
      f.x);
    o += 0.2 / exp(2.0 * abs(sin(0.2 * p.x + 0.5 * p.y)));
    p *= 2.1;
  }
  return o / 3.0;
}

${ fiberNoise }

fn randomGB(p: vec2f) -> vec2f {
  let uv = floor(p) / 50.0 + vec2f(0.5);
  return textureSampleLevel(u_noiseTexture_tex, u_noiseTexture_samp, fract(uv), 0.0).gb;
}

fn crumpledNoise(t: vec2f, pw: f32) -> f32 {
  let p = floor(t);
  var wsum: f32 = 0.0;
  var cl: f32 = 0.0;
  for (var y: i32 = -1; y < 2; y += 1) {
    for (var x: i32 = -1; x < 2; x += 1) {
      let b = vec2f(f32(x), f32(y));
      let q = b + p;
      let q2 = q - floor(q / 8.0) * 8.0;
      let c = q + randomGB(q2);
      let r = c - t;
      let w = pow(smoothstep(0.0, 1.0, 1.0 - abs(r.x)), pw) * pow(smoothstep(0.0, 1.0, 1.0 - abs(r.y)), pw);
      cl += (0.5 + 0.5 * sin((q2.x + q2.y * 5.0) * 8.0)) * w;
      wsum += w;
    }
  }
  return pow(select(0.0, cl / wsum, wsum != 0.0), 0.5) * 2.0;
}

fn crumplesShape(uv: vec2f) -> f32 {
  return crumpledNoise(uv * 0.25, 16.0) * crumpledNoise(uv * 0.5, 2.0);
}

fn foldsFn(uv: vec2f) -> vec2f {
  var pp = vec3f(0.0);
  var l: f32 = 9.0;
  for (var i: f32 = 0.0; i < 15.0; i += 1.0) {
    if (i < u.u_foldCount) {
      let rand = randomGB(vec2f(i, i * u.u_seed));
      let an = rand.x * TWO_PI;
      let p = vec2f(cos(an), sin(an)) * rand.y;
      let dist = distance(uv, p);
      l = min(l, dist);

      if (l == dist) {
        pp = vec3f((uv - p.xy), dist);
      }
    }
  }
  return mix(pp.xy, vec2f(0.0), pow(pp.z, 0.25));
}

fn dropsFn(uv: vec2f) -> f32 {
  let iDropsUV = floor(uv);
  let fDropsUV = fract(uv);
  var dropsMinDist: f32 = 1.0;
  for (var j: i32 = -1; j <= 1; j++) {
    for (var i: i32 = -1; i <= 1; i++) {
      let neighbor = vec2f(f32(i), f32(j));
      var offset = randomGB(iDropsUV + neighbor);
      offset = vec2f(0.5) + 0.5 * sin(10.0 * u.u_seed + TWO_PI * offset);
      let pos = neighbor + offset - fDropsUV;
      let dist = length(pos);
      dropsMinDist = min(dropsMinDist, dropsMinDist * dist);
    }
  }
  return 1.0 - smoothstep(0.05, 0.09, pow(dropsMinDist, 0.5));
}

fn lst(edge0: f32, edge1: f32, x: f32) -> f32 {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {

  var imageUV = input.v_imageUV;
  var patternUV = input.v_imageUV - vec2f(0.5);
  patternUV = 5.0 * (patternUV * vec2f(u.u_imageAspectRatio, 1.0));

  let fragCoord = vec2f(input.position.x, u.u_resolution.y - input.position.y);
  let roughnessUv = 1.5 * (fragCoord - 0.5 * u.u_resolution) / u.u_pixelRatio;
  let roughness = roughnessFn(roughnessUv + vec2f(1.0, 0.0)) - roughnessFn(roughnessUv - vec2f(1.0, 0.0));

  let crumplesUV = fract(patternUV * 0.02 / u.u_crumpleSize - vec2f(u.u_seed)) * 32.0;
  var crumples = u.u_crumples * (crumplesShape(crumplesUV + vec2f(0.05, 0.0)) - crumplesShape(crumplesUV));

  let fiberUV = 2.0 / u.u_fiberSize * patternUV;
  var fiber = fiberNoise(fiberUV, vec2f(0.0));
  fiber = 0.5 * u.u_fiber * (fiber - 1.0);

  var normal = vec2f(0.0);
  var normalImage = vec2f(0.0);

  var foldsUV = patternUV * 0.12;
  foldsUV = rotate(foldsUV, 4.0 * u.u_seed);
  var w = foldsFn(foldsUV);
  foldsUV = rotate(foldsUV + vec2f(0.007 * cos(u.u_seed)), 0.01 * sin(u.u_seed));
  var w2 = foldsFn(foldsUV);

  var drops = u.u_drops * dropsFn(patternUV * 2.0);

  var fade = u.u_fade * fbm(0.17 * patternUV + vec2f(10.0 * u.u_seed));
  fade = clamp(8.0 * fade * fade * fade, 0.0, 1.0);

  w = mix(w, vec2f(0.0), fade);
  w2 = mix(w2, vec2f(0.0), fade);
  crumples = mix(crumples, 0.0, fade);
  drops = mix(drops, 0.0, fade);
  fiber *= mix(1.0, 0.5, fade);
  var roughnessMut = roughness * mix(1.0, 0.5, fade);

  normal += u.u_folds * min(5.0 * u.u_contrast, 1.0) * 4.0 * max(vec2f(0.0), w + w2);
  normalImage += u.u_folds * 2.0 * w;

  normal += vec2f(crumples);
  normalImage += 1.5 * vec2f(crumples);

  normal += 3.0 * vec2f(drops);
  normalImage += 0.2 * vec2f(drops);

  normal += u.u_roughness * 1.5 * vec2f(roughnessMut);
  normal += vec2f(fiber);

  normalImage += u.u_roughness * 0.75 * vec2f(roughnessMut);
  normalImage += 0.2 * vec2f(fiber);

  let lightPos = vec3f(1.0, 2.0, 1.0);
  let res = dot(normalize(vec3f(normal, 9.5 - 9.0 * pow(u.u_contrast, 0.1))), normalize(lightPos));

  let fgColor = u.u_colorFront.rgb * u.u_colorFront.a;
  let fgOpacity = u.u_colorFront.a;
  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
  let bgOpacity = u.u_colorBack.a;

  imageUV += 0.02 * normalImage;
  let frame = getUvFrame(imageUV);
  var image = textureSampleLevel(u_image_tex, u_image_samp, imageUV, 0.0);
  image = vec4f(image.rgb + 0.6 * pow(u.u_contrast, 0.4) * (res - 0.7), image.a);

  let frameMasked = frame * image.a;

  var color = fgColor * res;
  var opacity = fgOpacity * res;

  color += bgColor * (1.0 - opacity);
  opacity += bgOpacity * (1.0 - opacity);
  opacity = mix(opacity, 1.0, frameMasked);

  color -= 0.007 * vec3f(drops);

  color = mix(color, image.rgb, frameMasked);

  return vec4f(color, opacity);
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
  u_fiberSize: number;
  u_crumples: number;
  u_foldCount: number;
  u_folds: number;
  u_fade: number;
  u_crumpleSize: number;
  u_drops: number;
  u_seed: number;
}

export interface PaperTextureParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorFront?: string;
  colorBack?: string;
  contrast?: number;
  roughness?: number;
  fiber?: number;
  fiberSize?: number;
  crumples?: number;
  foldCount?: number;
  folds?: number;
  fade?: number;
  crumpleSize?: number;
  drops?: number;
  seed?: number;
}

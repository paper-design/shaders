import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, rotation2, colorBandingFix } from '../shader-utils.js';

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

// language=WGSL
export const warpFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorsCount: f32,
  u_proportion: f32,
  u_softness: f32,
  u_shape: f32,
  u_shapeScale: f32,
  u_distortion: f32,
  u_swirl: f32,
  u_swirlIterations: f32,
  u_colors: array<vec4f, ${ warpMeta.maxColorCount }>,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

@group(1) @binding(0) var u_noiseTexture_tex: texture_2d<f32>;
@group(1) @binding(1) var u_noiseTexture_samp: sampler;

${vertexOutputStruct}

${ declarePI }
${ rotation2 }

fn randomG(p: vec2f) -> f32 {
  let uv = floor(p) / 100.0 + vec2f(0.5);
  return textureSampleLevel(u_noiseTexture_tex, u_noiseTexture_samp, fract(uv), 0.0).g;
}

fn valueNoise(st: vec2f) -> f32 {
  let i = floor(st);
  let f = fract(st);
  let a = randomG(i);
  let b = randomG(i + vec2f(1.0, 0.0));
  let c = randomG(i + vec2f(0.0, 1.0));
  let d = randomG(i + vec2f(1.0, 1.0));
  let u_val = f * f * (vec2f(3.0) - 2.0 * f);
  let x1 = mix(a, b, u_val.x);
  let x2 = mix(c, d, u_val.x);
  return mix(x1, x2, u_val.y);
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  var uv = input.v_patternUV;
  uv *= 0.5;

  const firstFrameOffset: f32 = 118.0;
  let t = 0.0625 * (u.u_time + firstFrameOffset);

  let n1 = valueNoise(uv * 1.0 + vec2f(t));
  let n2 = valueNoise(uv * 2.0 - vec2f(t));
  let angle = n1 * TWO_PI;
  uv = vec2f(uv.x + 4.0 * u.u_distortion * n2 * cos(angle), uv.y);
  uv = vec2f(uv.x, uv.y + 4.0 * u.u_distortion * n2 * sin(angle));

  let swirl = u.u_swirl;
  for (var i: i32 = 1; i <= 20; i++) {
    if (i >= i32(u.u_swirlIterations)) { break; }
    let iFloat = f32(i);
    uv = vec2f(uv.x + swirl / iFloat * cos(t + iFloat * 1.5 * uv.y), uv.y);
    uv = vec2f(uv.x, uv.y + swirl / iFloat * cos(t + iFloat * 1.0 * uv.x));
  }

  let proportion = clamp(u.u_proportion, 0.0, 1.0);

  var shape: f32 = 0.0;
  if (u.u_shape < 0.5) {
    let checksShape_uv = uv * (0.5 + 3.5 * u.u_shapeScale);
    shape = 0.5 + 0.5 * sin(checksShape_uv.x) * cos(checksShape_uv.y);
    shape += 0.48 * sign(proportion - 0.5) * pow(abs(proportion - 0.5), 0.5);
  } else if (u.u_shape < 1.5) {
    let stripesShape_uv = uv * (2.0 * u.u_shapeScale);
    let f = fract(stripesShape_uv.y);
    shape = smoothstep(0.0, 0.55, f) * (1.0 - smoothstep(0.45, 1.0, f));
    shape += 0.48 * sign(proportion - 0.5) * pow(abs(proportion - 0.5), 0.5);
  } else {
    let shapeScaling = 5.0 * (1.0 - u.u_shapeScale);
    let e0 = 0.45 - shapeScaling;
    let e1 = 0.55 + shapeScaling;
    shape = smoothstep(min(e0, e1), max(e0, e1), 1.0 - uv.y + 0.3 * (proportion - 0.5));
  }

  let mixer = shape * (u.u_colorsCount - 1.0);
  var gradient = u.u_colors[0];
  gradient = vec4f(gradient.rgb * gradient.a, gradient.a);
  let aa = fwidth(shape);
  for (var i: i32 = 1; i < ${ warpMeta.maxColorCount }; i++) {
    if (i < i32(u.u_colorsCount)) {
      var m = clamp(mixer - f32(i - 1), 0.0, 1.0);

      let localMixerStart = floor(m);
      let softness = 0.5 * u.u_softness + fwidth(m);
      let smoothed = smoothstep(max(0.0, 0.5 - softness - aa), min(1.0, 0.5 + softness + aa), m - localMixerStart);
      let stepped = localMixerStart + smoothed;

      m = mix(stepped, m, u.u_softness);

      var c = u.u_colors[i];
      c = vec4f(c.rgb * c.a, c.a);
      gradient = mix(gradient, c, m);
    }
  }

  var color = gradient.rgb;
  let opacity = gradient.a;

  ${ colorBandingFix }

  return vec4f(color, opacity);
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
}

export const WarpPatterns = {
  checks: 0,
  stripes: 1,
  edge: 2,
} as const;

export type WarpPattern = keyof typeof WarpPatterns;

import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import {
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, rotation2, proceduralHash21 } from '../shader-utils.js';

export const meshGradientMeta = {
  maxColorCount: 10,
} as const;

/**
 * A flowing composition of color spots, moving along distinct trajectories
 * and transformed by organic distortion.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_colors (vec4[]): Up to 10 color spots in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_distortion (float): Power of organic noise distortion (0 to 1)
 * - u_swirl (float): Power of vortex distortion (0 to 1)
 * - u_grainMixer (float): Strength of grain distortion applied to shape edges (0 to 1)
 * - u_grainOverlay (float): Post-processing black/white grain overlay (0 to 1)
 *
 * Vertex shader outputs (used in fragment shader):
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
 *
 */

export const meshGradientFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorsCount: f32,
  u_distortion: f32,
  u_swirl: f32,
  u_grainMixer: f32,
  u_grainOverlay: f32,
  u_colors: array<vec4f, ${meshGradientMeta.maxColorCount}>,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

${declarePI}
${rotation2}
${proceduralHash21}

fn valueNoise(st: vec2f) -> f32 {
  let i = floor(st);
  let f = fract(st);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  let u_val = f * f * (vec2f(3.0) - 2.0 * f);
  let x1 = mix(a, b, u_val.x);
  let x2 = mix(c, d, u_val.x);
  return mix(x1, x2, u_val.y);
}

fn noise(n: vec2f, seedOffset: vec2f) -> f32 {
  return valueNoise(n + seedOffset);
}

fn getPosition(i: i32, t: f32) -> vec2f {
  let fi = f32(i);
  let a = fi * 0.37;
  let b = 0.6 + fract(fi / 3.0) * 0.9;
  let c_val = 0.8 + fract(f32(i + 1) / 4.0);

  let x = sin(t * b + a);
  let y = cos(t * c_val + a * 1.5);

  return vec2f(0.5) + vec2f(0.5) * vec2f(x, y);
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  var uv = input.v_objectUV;
  uv += vec2f(0.5);
  let grainUV = uv * 1000.0;

  let grain = noise(grainUV, vec2f(0.0));
  let mixerGrain = 0.4 * u.u_grainMixer * (grain - 0.5);

  let firstFrameOffset: f32 = 41.5;
  let t = 0.5 * (u.u_time + firstFrameOffset);

  let radius = smoothstep(0.0, 1.0, length(uv - vec2f(0.5)));
  let center = 1.0 - radius;
  for (var i: f32 = 1.0; i <= 2.0; i += 1.0) {
    uv.x += u.u_distortion * center / i * sin(t + i * 0.4 * smoothstep(0.0, 1.0, uv.y)) * cos(0.2 * t + i * 2.4 * smoothstep(0.0, 1.0, uv.y));
    uv.y += u.u_distortion * center / i * cos(t + i * 2.0 * smoothstep(0.0, 1.0, uv.x));
  }

  var uvRotated = uv;
  uvRotated -= vec2f(0.5);
  let angle = 3.0 * u.u_swirl * radius;
  uvRotated = rotate(uvRotated, -angle);
  uvRotated += vec2f(0.5);

  var color = vec3f(0.0);
  var opacity: f32 = 0.0;
  var totalWeight: f32 = 0.0;

  for (var i: i32 = 0; i < ${meshGradientMeta.maxColorCount}; i++) {
    if (i >= i32(u.u_colorsCount)) { break; }

    let pos = getPosition(i, t) + vec2f(mixerGrain);
    let colorFraction = u.u_colors[i].rgb * u.u_colors[i].a;
    let opacityFraction = u.u_colors[i].a;

    var dist = length(uvRotated - pos);
    dist = pow(dist, 3.5);
    let weight = 1.0 / (dist + 1e-3);
    color += colorFraction * weight;
    opacity += opacityFraction * weight;
    totalWeight += weight;
  }

  color = color / max(1e-4, totalWeight);
  opacity = opacity / max(1e-4, totalWeight);

  let grainOverlayBase = valueNoise(rotate(grainUV, 1.0) + vec2f(3.0));
  var grainOverlay = mix(grainOverlayBase, valueNoise(rotate(grainUV, 2.0) + vec2f(-1.0)), 0.5);
  grainOverlay = pow(grainOverlay, 1.3);

  let grainOverlayV = grainOverlay * 2.0 - 1.0;
  let grainOverlayColor = vec3f(step(0.0, grainOverlayV));
  var grainOverlayStrength = u.u_grainOverlay * abs(grainOverlayV);
  grainOverlayStrength = pow(grainOverlayStrength, 0.8);
  color = mix(color, grainOverlayColor, 0.35 * grainOverlayStrength);

  opacity += 0.5 * grainOverlayStrength;
  opacity = clamp(opacity, 0.0, 1.0);

  return vec4f(color, opacity);
}
`;

export interface MeshGradientUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_distortion: number;
  u_swirl: number;
  u_grainMixer: number;
  u_grainOverlay: number;
}

export interface MeshGradientParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  distortion?: number;
  swirl?: number;
  grainMixer?: number;
  grainOverlay?: number;
}

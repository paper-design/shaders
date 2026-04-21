import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, textureRandomizerGB } from '../shader-utils.js';

export const voronoiMeta = {
  maxColorCount: 5,
} as const;

/**
 * Anti-aliased animated Voronoi pattern with smooth and customizable edges.
 *
 * Double-pass Voronoi pattern cell edges.
 * Original algorithm: https://www.shadertoy.com/view/ldl3W8
 *
 * Note: gaps can't be removed completely due to natural artifacts of Voronoi cells borders
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_scale (float): Overall zoom level, used for anti-aliasing calculations
 * - u_colors (vec4[]): Up to 5 base cell colors in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_stepsPerColor (float): Number of extra colors between base colors, 1 = N colors, 2 = 2×N, etc. (1 to 3)
 * - u_colorGlow (vec4): Color tint for radial inner shadow inside cells in RGBA, effective with glow > 0
 * - u_colorGap (vec4): Color used for cell borders/gaps in RGBA
 * - u_distortion (float): Strength of noise-driven displacement of cell centers (0 to 0.5)
 * - u_gap (float): Width of the border/gap between cells (0 to 0.1)
 * - u_glow (float): Strength of the radial inner shadow inside cells (0 to 1)
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
export const voronoiFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorsCount: f32,
  u_stepsPerColor: f32,
  u_colorGlow: vec4f,
  u_colorGap: vec4f,
  u_distortion: f32,
  u_gap: f32,
  u_glow: f32,
  u_colors: array<vec4f, ${voronoiMeta.maxColorCount}>,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

@group(1) @binding(0) var u_noiseTexture_tex: texture_2d<f32>;
@group(1) @binding(1) var u_noiseTexture_samp: sampler;

${vertexOutputStruct}

${declarePI}
${textureRandomizerGB}

fn voronoi(x: vec2f, t: f32) -> vec4f {
  let ip = floor(x);
  let fp = fract(x);

  var mg: vec2f;
  var mr: vec2f;
  var md: f32 = 8.0;
  var rand: f32 = 0.0;

  for (var j: i32 = -1; j <= 1; j++) {
    for (var i: i32 = -1; i <= 1; i++) {
      let g = vec2f(f32(i), f32(j));
      let o_raw = randomGB(ip + g);
      let raw_hash = o_raw.x;
      let o = vec2f(0.5) + u.u_distortion * sin(vec2f(t) + TWO_PI * o_raw);
      let r = g + o - fp;
      let d = dot(r, r);

      if (d < md) {
        md = d;
        mr = r;
        mg = g;
        rand = raw_hash;
      }
    }
  }

  md = 8.0;
  for (var j2: i32 = -2; j2 <= 2; j2++) {
    for (var i2: i32 = -2; i2 <= 2; i2++) {
      let g = mg + vec2f(f32(i2), f32(j2));
      let o_raw2 = randomGB(ip + g);
      let o = vec2f(0.5) + u.u_distortion * sin(vec2f(t) + TWO_PI * o_raw2);
      let r = g + o - fp;
      if (dot(mr - r, mr - r) > 0.00001) {
        md = min(md, dot(0.5 * (mr + r), normalize(r - mr)));
      }
    }
  }

  return vec4f(md, mr, rand);
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  var shape_uv = input.v_patternUV;
  shape_uv *= 1.25;

  let t = u.u_time;

  let voronoiRes = voronoi(shape_uv, t);

  let shape = clamp(voronoiRes.w, 0.0, 1.0);
  var mixer = shape * (u.u_colorsCount - 1.0);
  mixer = (shape - 0.5 / u.u_colorsCount) * u.u_colorsCount;
  let steps = max(1.0, u.u_stepsPerColor);

  var gradient = u.u_colors[0];
  gradient = vec4f(gradient.rgb * gradient.a, gradient.a);
  for (var i: i32 = 1; i < ${voronoiMeta.maxColorCount}; i++) {
    if (i >= i32(u.u_colorsCount)) { break; }
    var localT = clamp(mixer - f32(i - 1), 0.0, 1.0);
    localT = round(localT * steps) / steps;
    var c = u.u_colors[i];
    c = vec4f(c.rgb * c.a, c.a);
    gradient = mix(gradient, c, localT);
  }

  if ((mixer < 0.0) || (mixer > (u.u_colorsCount - 1.0))) {
    var localT2 = mixer + 1.0;
    if (mixer > (u.u_colorsCount - 1.0)) {
      localT2 = mixer - (u.u_colorsCount - 1.0);
    }
    localT2 = round(localT2 * steps) / steps;
    var cFst = u.u_colors[0];
    cFst = vec4f(cFst.rgb * cFst.a, cFst.a);
    var cLast = u.u_colors[i32(u.u_colorsCount - 1.0)];
    cLast = vec4f(cLast.rgb * cLast.a, cLast.a);
    gradient = mix(cLast, cFst, localT2);
  }

  let cellColor = gradient.rgb;
  let cellOpacity = gradient.a;

  var glows = length(voronoiRes.yz * u.u_glow);
  glows = pow(glows, 1.5);

  var color = mix(cellColor, u.u_colorGlow.rgb * u.u_colorGlow.a, u.u_colorGlow.a * glows);
  var opacity = cellOpacity + u.u_colorGlow.a * glows;

  let edge_raw = voronoiRes.x;
  let smoothEdge = 0.02 / (2.0 * u.u_scale) * (1.0 + 0.5 * u.u_gap);
  let edge = smoothstep(u.u_gap - smoothEdge, u.u_gap + smoothEdge, edge_raw);

  color = mix(u.u_colorGap.rgb * u.u_colorGap.a, color, edge);
  opacity = mix(u.u_colorGap.a, opacity, edge);

  return vec4f(color, opacity);
}
`;

export interface VoronoiUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_stepsPerColor: number;
  u_colorGap: [number, number, number, number];
  u_colorGlow: [number, number, number, number];
  u_distortion: number;
  u_gap: number;
  u_glow: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface VoronoiParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  stepsPerColor?: number;
  colorGap?: string;
  colorGlow?: string;
  distortion?: number;
  gap?: number;
  glow?: number;
}

import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, simplexNoise, glslMod, declarePI, rotation2, colorBandingFix } from '../shader-utils.js';

export const swirlMeta = {
  maxColorCount: 10,
} as const;

/**
 * Animated bands of color twisting and bending, producing spirals, arcs, and flowing circular patterns.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colors (vec4[]): Up to 10 stripe colors in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_bandCount (float): Number of color bands, 0 = concentric ripples (0 to 15)
 * - u_twist (float): Vortex power, 0 = straight sectoral shapes (0 to 1)
 * - u_center (float): How far from the center the swirl colors begin to appear (0 to 1)
 * - u_proportion (float): Blend point between colors, 0.5 = equal distribution (0 to 1)
 * - u_softness (float): Color transition sharpness, 0 = hard edge, 1 = smooth gradient (0 to 1)
 * - u_noise (float): Strength of noise distortion, no effect with noiseFrequency = 0 (0 to 1)
 * - u_noiseFrequency (float): Noise frequency, no effect with noise = 0 (0 to 1)
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

export const swirlFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorBack: vec4f,
  u_colorsCount: f32,
  u_bandCount: f32,
  u_twist: f32,
  u_center: f32,
  u_proportion: f32,
  u_softness: f32,
  u_noise: f32,
  u_noiseFrequency: f32,
  u_colors: array<vec4f, ${swirlMeta.maxColorCount}>,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

${declarePI}
${glslMod}
${simplexNoise}
${rotation2}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let shape_uv = input.v_objectUV;

  var l = length(shape_uv);
  l = max(1e-4, l);

  let t = u.u_time;

  let angle = ceil(u.u_bandCount) * atan2(shape_uv.y, shape_uv.x) + t;
  let angle_norm = angle / TWO_PI;

  let twist = 3.0 * clamp(u.u_twist, 0.0, 1.0);
  let offset = pow(l, -twist) + angle_norm;

  var shape = fract(offset);
  shape = 1.0 - abs(2.0 * shape - 1.0);
  shape += u.u_noise * snoise(15.0 * pow(u.u_noiseFrequency, 2.0) * shape_uv);

  let mid = smoothstep(0.2, 0.2 + 0.8 * u.u_center, pow(l, twist));
  shape = mix(0.0, shape, mid);

  let proportion = clamp(u.u_proportion, 0.0, 1.0);
  var exponent = mix(0.25, 1.0, proportion * 2.0);
  exponent = mix(exponent, 10.0, max(0.0, proportion * 2.0 - 1.0));
  shape = pow(shape, exponent);

  let mixer = shape * u.u_colorsCount;
  var gradient = u.u_colors[0];
  gradient = vec4f(gradient.rgb * gradient.a, gradient.a);

  var outerShape: f32 = 0.0;
  for (var i: i32 = 1; i < ${swirlMeta.maxColorCount + 1}; i++) {
    if (i <= i32(u.u_colorsCount)) {
      var m = clamp(mixer - f32(i - 1), 0.0, 1.0);
      let aa = fwidth(m);
      m = smoothstep(0.5 - 0.5 * u.u_softness - aa, 0.5 + 0.5 * u.u_softness + aa, m);

      if (i == 1) {
        outerShape = m;
      }

      var c = u.u_colors[i - 1];
      c = vec4f(c.rgb * c.a, c.a);
      gradient = mix(gradient, c, m);
    }
  }

  let midAA = 0.1 * fwidth(pow(l, -twist));
  let outerMid = smoothstep(0.2, 0.2 + midAA, pow(l, twist));
  outerShape = mix(0.0, outerShape, outerMid);

  var color = gradient.rgb * outerShape;
  var opacity = gradient.a * outerShape;

  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u.u_colorBack.a * (1.0 - opacity);

  ${colorBandingFix}

  return vec4f(color, opacity);
}
`;

export interface SwirlUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_bandCount: number;
  u_twist: number;
  u_center: number;
  u_proportion: number;
  u_softness: number;
  u_noiseFrequency: number;
  u_noise: number;
}

export interface SwirlParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  bandCount?: number;
  twist?: number;
  center?: number;
  proportion?: number;
  softness?: number;
  noiseFrequency?: number;
  noise?: number;
}

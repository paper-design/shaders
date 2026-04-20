import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, simplexNoise, glslMod, colorBandingFix } from '../shader-utils.js';

export const simplexNoiseMeta = {
  maxColorCount: 10,
} as const;

/**
 * A multi-color gradient mapped into smooth, animated curves built as a combination of 2 Simplex noises.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_scale (float): Overall zoom level, used for anti-aliasing calculations
 * - u_colors (vec4[]): Up to 10 base colors in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_stepsPerColor (float): Number of extra colors between base colors, 1 = N colors, 2 = 2×N, etc. (1 to 10)
 * - u_softness (float): Color transition sharpness, 0 = hard edge, 1 = smooth gradient (0 to 1)
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

export const simplexNoiseFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorsCount: f32,
  u_stepsPerColor: f32,
  u_softness: f32,
  u_colors: array<vec4f, ${simplexNoiseMeta.maxColorCount}>,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

${glslMod}
${simplexNoise}

fn getNoise(uv: vec2f, t: f32) -> f32 {
  var noise = 0.5 * snoise(uv - vec2f(0.0, 0.3 * t));
  noise += 0.5 * snoise(2.0 * uv + vec2f(0.0, 0.32 * t));
  return noise;
}

fn steppedSmooth(m: f32, steps: f32, softness: f32, fw_m: f32) -> f32 {
  let stepT = floor(m * steps) / steps;
  let f = m * steps - floor(m * steps);
  let fw = steps * fw_m;
  let smoothed = smoothstep(0.5 - softness, min(1.0, 0.5 + softness + fw), f);
  return stepT + smoothed / steps;
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  var shape_uv = input.v_patternUV;
  shape_uv *= 0.1;

  let t = 0.2 * u.u_time;

  let shape = 0.5 + 0.5 * getNoise(shape_uv, t);

  let u_extraSides = true;

  var mixer = shape * (u.u_colorsCount - 1.0);
  if (u_extraSides == true) {
    mixer = (shape - 0.5 / u.u_colorsCount) * u.u_colorsCount;
  }

  let steps = max(1.0, u.u_stepsPerColor);
  let mixerFw = fwidth(mixer);

  var gradient = u.u_colors[0];
  gradient = vec4f(gradient.rgb * gradient.a, gradient.a);
  for (var i: i32 = 1; i < ${simplexNoiseMeta.maxColorCount}; i++) {
    if (i < i32(u.u_colorsCount)) {
      var localM = clamp(mixer - f32(i - 1), 0.0, 1.0);
      localM = steppedSmooth(localM, steps, 0.5 * u.u_softness, mixerFw);

      var c = u.u_colors[i];
      c = vec4f(c.rgb * c.a, c.a);
      gradient = mix(gradient, c, localM);
    }
  }

  if (u_extraSides == true) {
    if ((mixer < 0.0) || (mixer > (u.u_colorsCount - 1.0))) {
      var localM2 = mixer + 1.0;
      if (mixer > (u.u_colorsCount - 1.0)) {
        localM2 = mixer - (u.u_colorsCount - 1.0);
      }
      localM2 = steppedSmooth(localM2, steps, 0.5 * u.u_softness, mixerFw);
      var cFst = u.u_colors[0];
      cFst = vec4f(cFst.rgb * cFst.a, cFst.a);
      var cLast = u.u_colors[i32(u.u_colorsCount - 1.0)];
      cLast = vec4f(cLast.rgb * cLast.a, cLast.a);
      gradient = mix(cLast, cFst, localM2);
    }
  }

  var color = gradient.rgb;
  let opacity = gradient.a;

  ${colorBandingFix}

  return vec4f(color, opacity);
}
`;

export interface SimplexNoiseUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_stepsPerColor: number;
  u_softness: number;
}

export interface SimplexNoiseParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  stepsPerColor?: number;
  softness?: number;
}

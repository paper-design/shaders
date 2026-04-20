import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import {
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, rotation2, proceduralHash21, glslMod } from '../shader-utils.js';

export const staticRadialGradientMeta = {
  maxColorCount: 10,
} as const;

/**
 * Radial gradient with up to 10 blended colors, featuring advanced mixing modes, focal point controls,
 * shape distortion, and grain effects.
 *
 * Fragment shader uniforms:
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colors (vec4[]): Up to 10 gradient colors in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_radius (float): Size of the shape (0 to 3)
 * - u_focalDistance (float): Distance of the focal point from center (0 to 3)
 * - u_focalAngle (float): Angle of the focal point in degrees, effective with focalDistance > 0 (0 to 360)
 * - u_falloff (float): Gradient decay, 0 = linear gradient (-1 to 1)
 * - u_mixing (float): Blending behavior, 0 = hard stripes, 1 = smooth gradient (0 to 1)
 * - u_distortion (float): Strength of radial distortion (0 to 1)
 * - u_distortionShift (float): Radial distortion offset, effective with distortion > 0 (-1 to 1)
 * - u_distortionFreq (float): Radial distortion frequency, effective with distortion > 0 (0 to 20)
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

export const staticRadialGradientFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorBack: vec4f,
  u_colorsCount: f32,
  u_radius: f32,
  u_focalDistance: f32,
  u_focalAngle: f32,
  u_falloff: f32,
  u_mixing: f32,
  u_distortion: f32,
  u_distortionShift: f32,
  u_distortionFreq: f32,
  u_grainMixer: f32,
  u_grainOverlay: f32,
  u_colors: array<vec4f, ${staticRadialGradientMeta.maxColorCount}>,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

${declarePI}
${rotation2}
${proceduralHash21}
${glslMod}

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

fn getPosition(idx: i32, t: f32) -> vec2f {
  let fi = f32(idx);
  let a = fi * 0.37;
  let b = 0.6 + glsl_mod_f32(fi, 3.0) * 0.3;
  let c_val = 0.8 + glsl_mod_f32(f32(idx + 1), 4.0) * 0.25;

  let x = sin(t * b + a);
  let y = cos(t * c_val + a * 1.5);

  return vec2f(0.5) + 0.5 * vec2f(x, y);
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let uv = 2.0 * input.v_objectUV;
  let grainUV = uv * 1000.0;

  let center = vec2f(0.0);
  let angleRad = -radians(u.u_focalAngle + 90.0);
  let focalPoint = vec2f(cos(angleRad), sin(angleRad)) * u.u_focalDistance;
  let radius = u.u_radius;

  let c_to_uv = uv - center;
  let f_to_uv = uv - focalPoint;
  let f_to_c = center - focalPoint;
  let r = length(c_to_uv);

  let fragAngle = atan2(c_to_uv.y, c_to_uv.x);
  let angleDiff = fract((fragAngle - angleRad + PI) / TWO_PI) * TWO_PI - PI;

  let halfAngle = acos(clamp(radius / max(u.u_focalDistance, 1e-4), 0.0, 1.0));
  let e0 = 0.6 * PI;
  let e1 = halfAngle;
  let lo = min(e0, e1);
  let hi = max(e0, e1);
  let s = smoothstep(lo, hi, abs(angleDiff));
  let isInSector = select(s, 1.0 - s, e1 >= e0);

  let qa = dot(f_to_uv, f_to_uv);
  let qb = -2.0 * dot(f_to_uv, f_to_c);
  let qc = dot(f_to_c, f_to_c) - radius * radius;

  let discriminant = qb * qb - 4.0 * qa * qc;
  var t: f32 = 1.0;

  if (discriminant >= 0.0) {
    let sqrtD = sqrt(discriminant);
    let div = max(1e-4, 2.0 * qa);
    let t0 = (-qb - sqrtD) / div;
    let t1 = (-qb + sqrtD) / div;
    t = max(t0, t1);
    if (t < 0.0) { t = 0.0; }
  }

  let dist = length(f_to_uv);
  let normalized = dist / max(1e-4, length(f_to_uv * t));
  var shape = clamp(normalized, 0.0, 1.0);

  let falloffMapped = mix(0.2 + 0.8 * max(0.0, u.u_falloff + 1.0), mix(1.0, 15.0, u.u_falloff * u.u_falloff), step(0.0, u.u_falloff));

  let falloffExp = mix(falloffMapped, 1.0, shape);
  shape = pow(shape, falloffExp);
  shape = 1.0 - clamp(shape, 0.0, 1.0);

  let outerMask: f32 = 0.002;
  var outer = 1.0 - smoothstep(radius - outerMask, radius + outerMask, r);
  outer = mix(outer, 1.0, isInSector);

  shape = mix(0.0, shape, outer);
  shape *= 1.0 - smoothstep(radius - 0.01, radius, r);

  let angle = atan2(f_to_uv.y, f_to_uv.x);
  shape -= pow(u.u_distortion, 2.0) * shape * pow(abs(sin(PI * clamp(length(f_to_uv) - 0.2 + u.u_distortionShift, 0.0, 1.0))), 4.0) * (sin(u.u_distortionFreq * angle) + cos(floor(0.65 * u.u_distortionFreq) * angle));

  let grain = noise(grainUV, vec2f(0.0));
  let mixerGrain = 0.4 * u.u_grainMixer * (grain - 0.5);

  let mixer = shape * u.u_colorsCount + mixerGrain;
  var gradient = u.u_colors[0];
  gradient = vec4f(gradient.rgb * gradient.a, gradient.a);

  var outerShape: f32 = 0.0;
  for (var i: i32 = 1; i < ${staticRadialGradientMeta.maxColorCount + 1}; i++) {
    if (i <= i32(u.u_colorsCount)) {
      let mLinear = clamp(mixer - f32(i - 1), 0.0, 1.0);

      let aa = fwidth(mLinear);
      let width = min(u.u_mixing, 0.5);
      let tVal = clamp((mLinear - (0.5 - width - aa)) / (2.0 * width + 2.0 * aa), 0.0, 1.0);
      let p = mix(2.0, 1.0, clamp((u.u_mixing - 0.5) * 2.0, 0.0, 1.0));
      var m = select(
        1.0 - 0.5 * pow(2.0 * (1.0 - tVal), p),
        0.5 * pow(2.0 * tVal, p),
        tVal < 0.5
      );

      let quadBlend = clamp((u.u_mixing - 0.5) * 2.0, 0.0, 1.0);
      m = mix(m, m * m, 0.5 * quadBlend);

      if (i == 1) {
        outerShape = m;
      }

      var c = u.u_colors[i - 1];
      c = vec4f(c.rgb * c.a, c.a);
      gradient = mix(gradient, c, m);
    }
  }

  var color = gradient.rgb * outerShape;
  var opacity = gradient.a * outerShape;

  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u.u_colorBack.a * (1.0 - opacity);

  var grainOverlay = valueNoise(rotate(grainUV, 1.0) + vec2f(3.0));
  grainOverlay = mix(grainOverlay, valueNoise(rotate(grainUV, 2.0) + vec2f(-1.0)), 0.5);
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

export interface StaticRadialGradientUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_radius: number;
  u_focalDistance: number;
  u_focalAngle: number;
  u_falloff: number;
  u_mixing: number;
  u_distortion: number;
  u_distortionShift: number;
  u_distortionFreq: number;
  u_grainMixer: number;
  u_grainOverlay: number;
}

export interface StaticRadialGradientParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  radius?: number;
  focalDistance?: number;
  focalAngle?: number;
  falloff?: number;
  mixing?: number;
  distortion?: number;
  distortionShift?: number;
  distortionFreq?: number;
  grainMixer?: number;
  grainOverlay?: number;
}

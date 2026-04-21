import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, textureRandomizerR, colorBandingFix } from '../shader-utils.js';

export const smokeRingMeta = {
  maxColorCount: 10,
  maxNoiseIterations: 8,
} as const;

/**
 * Radial multi-colored gradient shaped with layered noise for a natural, smoky aesthetic.
 *
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colors (vec4[]): Up to 10 gradient colors in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_thickness (float): Thickness of the ring shape (0.01 to 1)
 * - u_radius (float): Radius of the ring shape (0 to 1)
 * - u_innerShape (float): Ring inner fill amount (0 to 4)
 * - u_noiseIterations (float): Number of noise layers, more layers gives more details (1 to 8)
 * - u_noiseScale (float): Noise frequency (0.01 to 5)
 * - u_noiseTexture (sampler2D): Pre-computed randomizer source texture
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

// language=WGSL
export const smokeRingFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorBack: vec4f,
  u_colorsCount: f32,
  u_thickness: f32,
  u_radius: f32,
  u_innerShape: f32,
  u_noiseScale: f32,
  u_noiseIterations: f32,
  u_colors: array<vec4f, ${smokeRingMeta.maxColorCount}>,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

@group(1) @binding(0) var u_noiseTexture_tex: texture_2d<f32>;
@group(1) @binding(1) var u_noiseTexture_samp: sampler;

${vertexOutputStruct}

${declarePI}
${textureRandomizerR}

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

fn fbm(n0_in: vec2f, n1_in: vec2f) -> vec2f {
  var n0 = n0_in;
  var n1 = n1_in;
  var total = vec2f(0.0);
  var amplitude: f32 = 0.4;
  for (var i: i32 = 0; i < ${smokeRingMeta.maxNoiseIterations}; i++) {
    if (i >= i32(u.u_noiseIterations)) { break; }
    total.x += valueNoise(n0) * amplitude;
    total.y += valueNoise(n1) * amplitude;
    n0 *= 1.99;
    n1 *= 1.99;
    amplitude *= 0.65;
  }
  return total;
}

fn getNoise(uv: vec2f, pUv: vec2f, t: f32) -> f32 {
  let pUvLeft = pUv + 0.03 * t;
  let period = max(abs(u.u_noiseScale * TWO_PI), 1e-6);
  let pUvRight = vec2f(fract(pUv.x / period) * period, pUv.y) + 0.03 * t;
  let noiseVal = fbm(pUvLeft, pUvRight);
  return mix(noiseVal.y, noiseVal.x, smoothstep(-0.25, 0.25, uv.x));
}

fn getRingShape(uv: vec2f) -> f32 {
  let radius = u.u_radius;
  let thickness = u.u_thickness;

  let distance_val = length(uv);
  var ringValue = 1.0 - smoothstep(radius, radius + thickness, distance_val);
  ringValue *= smoothstep(radius - pow(u.u_innerShape, 3.0) * thickness, radius, distance_val);

  return ringValue;
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  var shape_uv = input.v_objectUV;

  let t = u.u_time;

  let cycleDuration: f32 = 3.0;
  let period2 = 2.0 * cycleDuration;
  let localTime1 = fract((0.1 * t + cycleDuration) / period2) * period2;
  let localTime2 = fract((0.1 * t) / period2) * period2;
  let timeBlend = 0.5 + 0.5 * sin(0.1 * t * PI / cycleDuration - 0.5 * PI);

  let atg = atan2(shape_uv.y, shape_uv.x) + 0.001;
  let l = length(shape_uv);
  let radialOffset = 0.5 * l - inverseSqrt(max(1e-4, l));
  let polar_uv1 = vec2f(atg, localTime1 - radialOffset) * u.u_noiseScale;
  let polar_uv2 = vec2f(atg, localTime2 - radialOffset) * u.u_noiseScale;

  let noise1 = getNoise(shape_uv, polar_uv1, t);
  let noise2 = getNoise(shape_uv, polar_uv2, t);

  let noiseVal = mix(noise1, noise2, timeBlend);

  shape_uv *= (0.8 + 1.2 * noiseVal);

  let ringShape = getRingShape(shape_uv);

  let mixer = ringShape * ringShape * (u.u_colorsCount - 1.0);
  let idxLast = i32(u.u_colorsCount) - 1;
  var gradient = u.u_colors[idxLast];
  gradient = vec4f(gradient.rgb * gradient.a, gradient.a);
  for (var i: i32 = ${smokeRingMeta.maxColorCount} - 2; i >= 0; i--) {
    let localT = clamp(mixer - f32(idxLast - i - 1), 0.0, 1.0);
    var c = u.u_colors[i];
    c = vec4f(c.rgb * c.a, c.a);
    gradient = mix(gradient, c, localT);
  }

  var color = gradient.rgb * ringShape;
  var opacity = gradient.a * ringShape;

  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u.u_colorBack.a * (1.0 - opacity);

  ${colorBandingFix}

  return vec4f(color, opacity);
}
`;

export interface SmokeRingUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_noiseScale: number;
  u_thickness: number;
  u_radius: number;
  u_innerShape: number;
  u_noiseIterations: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface SmokeRingParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  noiseScale?: number;
  thickness?: number;
  radius?: number;
  innerShape?: number;
  noiseIterations?: number;
}

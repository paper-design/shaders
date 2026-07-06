import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, rotation2, textureRandomizerR, colorBandingFix, proceduralHash11 } from '../shader-utils.js';

export const godRaysMeta = {
  maxColorCount: 5,
} as const;

/**
 * Animated rays of light radiating from the center, blended with up to 5 colors.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colorBloom (vec4): Color overlay blended with the rays in RGBA
 * - u_colors (vec4[]): Up to 5 ray colors in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_bloom (float): Strength of the bloom/overlay effect, 0 = alpha blend, 1 = additive blend (0 to 1)
 * - u_intensity (float): Visibility/strength of the rays (0 to 1)
 * - u_density (float): The number of rays (0 to 1)
 * - u_spotty (float): The length of the rays, higher = more spots/shorter rays (0 to 1)
 * - u_midSize (float): Size of the circular glow shape in the center (0 to 1)
 * - u_midIntensity (float): Brightness/intensity of the central glow (0 to 1)
 * - u_noiseTexture (sampler2D): Pre-computed randomizer source texture
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_objectUV (vec2): Object box UV coordinates with global sizing (scale, rotation, offsets, etc) applied
 *
 * The rays are adjustable by size, density, brightness and center glow.
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
export const godRaysFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorsCount: f32,
  u_density: f32,
  u_spotty: f32,
  u_midSize: f32,
  u_midIntensity: f32,
  u_intensity: f32,
  u_bloom: f32,
  u_colorBack: vec4f,
  u_colorBloom: vec4f,
  u_colors: array<vec4f, ${ godRaysMeta.maxColorCount }>,
}
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(1) @binding(0) var u_noiseTexture_tex: texture_2d<f32>;
@group(1) @binding(1) var u_noiseTexture_samp: sampler;

${vertexOutputStruct}

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

${ proceduralHash11 }

fn raysShape(uv: vec2f, r: f32, freq: f32, intensity_val: f32, radius: f32) -> f32 {
  let a = atan2(uv.y, uv.x);
  let left = vec2f(a * freq, r);
  let right = vec2f(fract(a / TWO_PI) * TWO_PI * freq, r);
  let n_left = pow(valueNoise(left), intensity_val);
  let n_right = pow(valueNoise(right), intensity_val);
  let shape = mix(n_right, n_left, smoothstep(-0.15, 0.15, uv.x));
  return shape;
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let shape_uv = input.v_objectUV;

  let t = 0.2 * u.u_time;

  let radius = length(shape_uv);
  let spots = 6.5 * abs(u.u_spotty);

  let intensity = 4.0 - 3.0 * clamp(u.u_intensity, 0.0, 1.0);

  let delta = 1.0 - smoothstep(0.0, 1.0, radius);

  let midSize = 10.0 * abs(u.u_midSize);
  let ms_lo = 0.02 * midSize;
  let ms_hi = max(midSize, 1e-6);
  var middleShape = pow(u.u_midIntensity, 0.3) * (1.0 - smoothstep(ms_lo, ms_hi, 3.0 * radius));
  middleShape = pow(middleShape, 5.0);

  var accumColor = vec3f(0.0);
  var accumAlpha: f32 = 0.0;

  for (var i: i32 = 0; i < ${ godRaysMeta.maxColorCount }; i++) {
    if (i >= i32(u.u_colorsCount)) { break; }

    let rotatedUV = rotate(shape_uv, f32(i) + 1.0);

    let r1 = radius * (1.0 + 0.4 * f32(i)) - 3.0 * t;
    let r2 = 0.5 * radius * (1.0 + spots) - 2.0 * t;
    let density_val = 6.0 * u.u_density + step(0.5, u.u_density) * pow(4.5 * (u.u_density - 0.5), 4.0);
    let f = mix(1.0, 3.0 + 0.5 * f32(i), hash11(f32(i) * 15.0)) * density_val;

    var ray = raysShape(rotatedUV, r1, 5.0 * f, intensity, radius);
    ray *= raysShape(rotatedUV, r2, 4.0 * f, intensity, radius);
    ray += (1.0 + 4.0 * ray) * middleShape;
    ray = clamp(ray, 0.0, 1.0);

    let srcAlpha = u.u_colors[i].a * ray;
    let srcColor = u.u_colors[i].rgb * srcAlpha;

    let alphaBlendColor = accumColor + (1.0 - accumAlpha) * srcColor;
    let alphaBlendAlpha = accumAlpha + (1.0 - accumAlpha) * srcAlpha;

    let addBlendColor = accumColor + srcColor;
    let addBlendAlpha = accumAlpha + srcAlpha;

    accumColor = mix(alphaBlendColor, addBlendColor, u.u_bloom);
    accumAlpha = mix(alphaBlendAlpha, addBlendAlpha, u.u_bloom);
  }

  let overlayAlpha = u.u_colorBloom.a;
  let overlayColor = u.u_colorBloom.rgb * overlayAlpha;

  let colorWithOverlay = accumColor + accumAlpha * overlayColor;
  accumColor = mix(accumColor, colorWithOverlay, u.u_bloom);

  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;

  var color = accumColor + (1.0 - accumAlpha) * bgColor;
  var opacity = accumAlpha + (1.0 - accumAlpha) * u.u_colorBack.a;
  color = clamp(color, vec3f(0.0), vec3f(1.0));
  opacity = clamp(opacity, 0.0, 1.0);

  ${ colorBandingFix }

  return vec4f(color, opacity);
}
`;

export interface GodRaysUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colorBloom: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_spotty: number;
  u_midSize: number;
  u_midIntensity: number;
  u_density: number;
  u_intensity: number;
  u_bloom: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface GodRaysParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colorBloom?: string;
  colors?: string[];
  spotty?: number;
  midSize?: number;
  midIntensity?: number;
  density?: number;
  intensity?: number;
  bloom?: number;
}

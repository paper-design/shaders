import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, rotation2, glslMod, simplexNoise } from '../shader-utils.js';

/**
 * Water-like surface distortion with natural caustic realism. Works as an image filter or standalone animated texture.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_image (sampler2D): Optional source image texture
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colorHighlight (vec4): Highlight color in RGBA
 * - u_highlights (float): Coloring added over image/background following caustic shape (0 to 1)
 * - u_layering (float): Power of 2nd layer of caustic distortion (0 to 1)
 * - u_edges (float): Caustic distortion power on the image edges (0 to 1)
 * - u_waves (float): Additional distortion based on simplex noise, independent from caustic (0 to 1)
 * - u_caustic (float): Power of caustic distortion (0 to 1)
 * - u_size (float): Pattern scale relative to the image (0.01 to 7)
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

export const waterFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorBack: vec4f,
  u_colorHighlight: vec4f,
  u_size: f32,
  u_highlights: f32,
  u_layering: f32,
  u_edges: f32,
  u_caustic: f32,
  u_waves: f32,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

@group(1) @binding(0) var u_image_tex: texture_2d<f32>;
@group(1) @binding(1) var u_image_samp: sampler;

${declarePI}
${rotation2}
${glslMod}
${simplexNoise}

fn fwidth_f32(x: f32) -> f32 {
  return abs(dpdx(x)) + abs(dpdy(x));
}

fn getUvFrame(uv: vec2f) -> f32 {
  let aax = 2.0 * fwidth_f32(uv.x);
  let aay = 2.0 * fwidth_f32(uv.y);

  let left   = smoothstep(0.0, aax, uv.x);
  let right = 1.0 - smoothstep(1.0 - aax, 1.0, uv.x);
  let bottom = smoothstep(0.0, aay, uv.y);
  let top = 1.0 - smoothstep(1.0 - aay, 1.0, uv.y);

  return left * right * bottom * top;
}

fn rotate2D(r: f32) -> mat2x2f {
  return mat2x2f(cos(r), sin(r), -sin(r), cos(r));
}

fn getCausticNoise(uv_in: vec2f, t: f32, scale_in: f32) -> f32 {
  var uv = uv_in;
  var scale = scale_in;
  var n = vec2f(0.1);
  var N_val = vec2f(0.1);
  let m = rotate2D(0.5);
  for (var j: i32 = 0; j < 6; j++) {
    uv = m * uv;
    n = m * n;
    let q = uv * scale + vec2f(f32(j)) + n + (0.5 + 0.5 * f32(j)) * (glsl_mod_f32(f32(j), 2.0) - 1.0) * t;
    n += sin(q);
    N_val += cos(q) / scale;
    scale *= 1.1;
  }
  return (N_val.x + N_val.y + 1.0);
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  var imageUV = input.v_imageUV;
  var patternUV = input.v_imageUV - vec2f(0.5);
  patternUV = (patternUV * vec2f(u.u_imageAspectRatio, 1.0));
  patternUV /= (0.01 + 0.09 * u.u_size);

  let t = u.u_time;

  let wavesNoise = snoise((0.3 + 0.1 * sin(t)) * 0.1 * patternUV + vec2f(0.0, 0.4 * t));

  var causticNoise = getCausticNoise(patternUV + u.u_waves * vec2f(1.0, -1.0) * wavesNoise, 2.0 * t, 1.5);

  causticNoise += u.u_layering * getCausticNoise(patternUV + 2.0 * u.u_waves * vec2f(1.0, -1.0) * wavesNoise, 1.5 * t, 2.0);
  causticNoise = causticNoise * causticNoise;

  var edgesDistortion = smoothstep(0.0, 0.1, imageUV.x);
  edgesDistortion *= smoothstep(0.0, 0.1, imageUV.y);
  edgesDistortion *= (smoothstep(1.0, 1.1, imageUV.x) + (1.0 - smoothstep(0.8, 0.95, imageUV.x)));
  edgesDistortion *= (1.0 - smoothstep(0.9, 1.0, imageUV.y));
  edgesDistortion = mix(edgesDistortion, 1.0, u.u_edges);

  let causticNoiseDistortion = 0.02 * causticNoise * edgesDistortion;

  let wavesDistortion = 0.1 * u.u_waves * wavesNoise;

  imageUV += vec2f(wavesDistortion, -wavesDistortion);
  imageUV += (u.u_caustic * causticNoiseDistortion);

  let frame = getUvFrame(imageUV);

  let image = textureSampleLevel(u_image_tex, u_image_samp, imageUV, 0.0);
  var backColor = u.u_colorBack;
  backColor = vec4f(backColor.rgb * backColor.a, backColor.a);

  var color = mix(backColor.rgb, image.rgb, image.a * frame);
  var opacity = backColor.a + image.a * frame;

  causticNoise = max(-0.2, causticNoise);

  var hightlight = 0.025 * u.u_highlights * causticNoise;
  hightlight *= u.u_colorHighlight.a;
  color = mix(color, u.u_colorHighlight.rgb, 0.05 * u.u_highlights * causticNoise);
  opacity += hightlight;

  color += vec3f(hightlight * (0.5 + 0.5 * wavesNoise));
  opacity += hightlight * (0.5 + 0.5 * wavesNoise);

  opacity = clamp(opacity, 0.0, 1.0);

  return vec4f(color, opacity);
}
`;

export interface WaterUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorBack: [number, number, number, number];
  u_colorHighlight: [number, number, number, number];
  u_highlights: number;
  u_layering: number;
  u_edges: number;
  u_caustic: number;
  u_waves: number;
  u_size: number;
}

export interface WaterParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorBack?: string;
  colorHighlight?: string;
  highlights?: number;
  layering?: number;
  edges?: number;
  caustic?: number;
  waves?: number;
  size?: number;
}

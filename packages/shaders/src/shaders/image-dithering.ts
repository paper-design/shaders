import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, proceduralHash21, declarePI } from '../shader-utils.js';

/**
 * A dithering image filter with support for 4 dithering modes and multiple color palettes
 * (2-color, 3-color, and multicolor options, using either predefined colors or colors sampled
 * from the original image).
 *
 * SIZING NOTE: This shader performs sizing in the fragment shader (not vertex shader) to keep
 * u_pxSize in consistent actual pixels. The pixel grid is computed from gl_FragCoord before any
 * transforms, so scaling/rotating only affects the underlying image.
 * No vertex shader outputs (v_imageUV, v_objectUV, etc.) are used.
 *
 * Fragment shader uniforms:
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
 * - u_image (sampler2D): Source image texture
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorFront (vec4): Foreground color in RGBA
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colorHighlight (vec4): Secondary foreground color in RGBA (set same as colorFront for classic 2-color dithering)
 * - u_originalColors (bool): Use the original colors of the image instead of the color palette
 * - u_inverted (bool): Inverts the image luminance, doesn't affect the color scheme; not effective at zero contrast
 * - u_type (float): Dithering type (1 = random, 2 = 2x2 Bayer, 3 = 4x4 Bayer, 4 = 8x8 Bayer)
 * - u_pxSize (float): Pixel size of dithering grid (0.5 to 20)
 * - u_colorSteps (float): Number of colors to use, applies to both color modes (1 to 7)
 *
 */

export const imageDitheringFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorFront: vec4f,
  u_colorBack: vec4f,
  u_colorHighlight: vec4f,
  u_type: f32,
  u_pxSize: f32,
  u_originalColors: f32,
  u_inverted: f32,
  u_colorSteps: f32,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

@group(1) @binding(0) var u_image_tex: texture_2d<f32>;
@group(1) @binding(1) var u_image_samp: sampler;

${proceduralHash21}
${declarePI}

fn getUvFrame(uv: vec2f, pad: vec2f) -> f32 {
  let aa: f32 = 0.0001;

  let left   = smoothstep(-pad.x, -pad.x + aa, uv.x);
  let right  = smoothstep(1.0 + pad.x, 1.0 + pad.x - aa, uv.x);
  let bottom = smoothstep(-pad.y, -pad.y + aa, uv.y);
  let top    = smoothstep(1.0 + pad.y, 1.0 + pad.y - aa, uv.y);

  return left * right * bottom * top;
}

fn getImageUV(uv_in: vec2f) -> vec2f {
  let boxOrigin = vec2f(0.5 - u.u_originX, u.u_originY - 0.5);
  let r = u.u_rotation * PI / 180.0;
  let graphicRotation = mat2x2f(cos(r), sin(r), -sin(r), cos(r));
  let graphicOffset = vec2f(-u.u_offsetX, u.u_offsetY);

  var imageBoxSize: vec2f;
  if (u.u_fit == 1.0) { // contain
    imageBoxSize = vec2f(min(u.u_resolution.x / u.u_imageAspectRatio, u.u_resolution.y) * u.u_imageAspectRatio, 0.0);
  } else if (u.u_fit == 2.0) { // cover
    imageBoxSize = vec2f(max(u.u_resolution.x / u.u_imageAspectRatio, u.u_resolution.y) * u.u_imageAspectRatio, 0.0);
  } else {
    imageBoxSize = vec2f(min(10.0, 10.0 / u.u_imageAspectRatio * u.u_imageAspectRatio), 0.0);
  }
  imageBoxSize = vec2f(imageBoxSize.x, imageBoxSize.x / u.u_imageAspectRatio);
  let imageBoxScale = u.u_resolution.xy / imageBoxSize;

  var imageUV = uv_in;
  imageUV *= imageBoxScale;
  imageUV += boxOrigin * (imageBoxScale - vec2f(1.0));
  imageUV += graphicOffset;
  imageUV /= u.u_scale;
  imageUV = vec2f(imageUV.x * u.u_imageAspectRatio, imageUV.y);
  imageUV = graphicRotation * imageUV;
  imageUV = vec2f(imageUV.x / u.u_imageAspectRatio, imageUV.y);

  imageUV += vec2f(0.5);

  return imageUV;
}

const bayer2x2 = array<i32, 4>(0, 2, 3, 1);
const bayer4x4 = array<i32, 16>(
0, 8, 2, 10,
12, 4, 14, 6,
3, 11, 1, 9,
15, 7, 13, 5
);

const bayer8x8 = array<i32, 64>(
0, 32, 8, 40, 2, 34, 10, 42,
48, 16, 56, 24, 50, 18, 58, 26,
12, 44, 4, 36, 14, 46, 6, 38,
60, 28, 52, 20, 62, 30, 54, 22,
3, 35, 11, 43, 1, 33, 9, 41,
51, 19, 59, 27, 49, 17, 57, 25,
15, 47, 7, 39, 13, 45, 5, 37,
63, 31, 55, 23, 61, 29, 53, 21
);

fn getBayerValue(uv: vec2f, size: i32) -> f32 {
  let pos = vec2i(fract(uv / f32(size)) * f32(size));
  let index = pos.y * size + pos.x;

  if (size == 2) {
    return f32(bayer2x2[index]) / 4.0;
  } else if (size == 4) {
    return f32(bayer4x4[index]) / 16.0;
  } else if (size == 8) {
    return f32(bayer8x8[index]) / 64.0;
  }
  return 0.0;
}


@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {

  let pxSize = u.u_pxSize * u.u_pixelRatio;
  var pxSizeUV = input.position.xy - 0.5 * u.u_resolution;
  pxSizeUV /= pxSize;
  let canvasPixelizedUV = (floor(pxSizeUV) + vec2f(0.5)) * pxSize;
  let normalizedUV = canvasPixelizedUV / u.u_resolution;

  let imageUV = getImageUV(normalizedUV);
  let ditheringNoiseUV = canvasPixelizedUV;
  let image = textureSampleLevel(u_image_tex, u_image_samp, imageUV, 0.0);
  let frame = getUvFrame(imageUV, pxSize / u.u_resolution);

  let type_val = i32(floor(u.u_type));
  var dithering: f32 = 0.0;

  let lum_raw = dot(vec3f(0.2126, 0.7152, 0.0722), image.rgb);
  let lum = select(lum_raw, 1.0 - lum_raw, u.u_inverted > 0.5);

  if (type_val == 1) {
    dithering = step(hash21(ditheringNoiseUV), lum);
  } else if (type_val == 2) {
    dithering = getBayerValue(pxSizeUV, 2);
  } else if (type_val == 3) {
    dithering = getBayerValue(pxSizeUV, 4);
  } else {
    dithering = getBayerValue(pxSizeUV, 8);
  }

  let colorSteps = max(floor(u.u_colorSteps), 1.0);
  var color = vec3f(0.0);
  var opacity: f32 = 1.0;

  dithering -= 0.5;
  var brightness = clamp(lum + dithering / colorSteps, 0.0, 1.0);
  brightness = mix(0.0, brightness, frame);
  brightness = mix(0.0, brightness, image.a);
  var quantLum = floor(brightness * colorSteps + 0.5) / colorSteps;
  quantLum = mix(0.0, quantLum, frame);

  if (u.u_originalColors > 0.5) {
    let normColor = image.rgb / max(lum, 0.001);
    color = normColor * quantLum;

    let quantAlpha = floor(image.a * colorSteps + 0.5) / colorSteps;
    opacity = mix(quantLum, 1.0, quantAlpha);
  } else {
    let fgColor = u.u_colorFront.rgb * u.u_colorFront.a;
    var fgOpacity = u.u_colorFront.a;
    let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
    let bgOpacity = u.u_colorBack.a;
    let hlColor = u.u_colorHighlight.rgb * u.u_colorHighlight.a;
    let hlOpacity = u.u_colorHighlight.a;

    let fgColorMixed = mix(fgColor, hlColor, step(1.02 - 0.02 * u.u_colorSteps, brightness));
    fgOpacity = mix(fgOpacity, hlOpacity, step(1.02 - 0.02 * u.u_colorSteps, brightness));

    color = fgColorMixed * quantLum;
    opacity = fgOpacity * quantLum;
    color += bgColor * (1.0 - opacity);
    opacity += bgOpacity * (1.0 - opacity);
  }

  return vec4f(color, opacity);
}
`;

export interface ImageDitheringUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string;
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_colorHighlight: [number, number, number, number];
  u_type: (typeof DitheringTypes)[DitheringType];
  u_pxSize: number;
  u_colorSteps: number;
  u_originalColors: boolean;
  u_inverted: boolean;
}

export interface ImageDitheringParams extends ShaderSizingParams, ShaderMotionParams {
  image: HTMLImageElement | string;
  colorFront?: string;
  colorBack?: string;
  colorHighlight?: string;
  type?: DitheringType;
  size?: number;
  colorSteps?: number;
  originalColors?: boolean;
  inverted?: boolean;
}

export const DitheringTypes = {
  'random': 1,
  '2x2': 2,
  '4x4': 3,
  '8x8': 4,
} as const;

export type DitheringType = keyof typeof DitheringTypes;

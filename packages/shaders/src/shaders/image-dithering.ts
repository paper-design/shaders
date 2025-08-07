import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingUV, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declareImageUV, declareRandom } from '../shader-utils.js';

/**
 */

// language=GLSL
export const imageDitheringFragmentShader: string = `#version 300 es
precision lowp float;

uniform float u_time;
uniform mediump vec2 u_resolution;
uniform mediump float u_pixelRatio;
uniform mediump float u_originX;
uniform mediump float u_originY;
uniform mediump float u_worldWidth;
uniform mediump float u_worldHeight;
uniform mediump float u_fit;

uniform mediump float u_scale;
uniform mediump float u_rotation;
uniform mediump float u_offsetX;
uniform mediump float u_offsetY;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;

uniform sampler2D u_image;
uniform mediump float u_imageAspectRatio;

uniform float u_type;
uniform float u_pxSize;
uniform bool u_ownPalette;
uniform float u_colorSteps;

out vec4 fragColor;

${declareImageUV}
${declareRandom}

const int bayer2x2[4] = int[4](0, 2, 3, 1);
const int bayer4x4[16] = int[16](
  0,  8,  2, 10,
 12,  4, 14,  6,
  3, 11,  1,  9,
 15,  7, 13,  5
);

const int bayer8x8[64] = int[64](
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv, int size) {
  ivec2 pos = ivec2(mod(uv, float(size)));
  int index = pos.y * size + pos.x;

  if (size == 2) {
    return float(bayer2x2[index]) / 4.0;
  } else if (size == 4) {
    return float(bayer4x4[index]) / 16.0;
  } else if (size == 8) {
    return float(bayer8x8[index]) / 64.0;
  }
  return 0.0;
}


void main() {

  #define USE_IMAGE_SIZING
  #define USE_PIXELIZATION
  ${sizingUV}

  vec2 dithering_uv = pxSizeUv;
  vec2 ditheringNoise_uv = uv;
  
  vec4 image = texture(u_image, imageUV);
  float frame = getUvFrame(imageUV);
//  if (frame < .05) discard;
  
  int type = int(floor(u_type));
  float dithering = 0.0;

  switch (type) {
    case 1: {
      dithering = step(random(ditheringNoise_uv), image.r);
    } break;
    case 2:
      dithering = getBayerValue(dithering_uv, 2);
      break;
    case 3:
      dithering = getBayerValue(dithering_uv, 4);
      break;
    default:
      dithering = getBayerValue(dithering_uv, 8);
      break;
  }

  float lum = dot(vec3(.2126, .7152, .0722), image.rgb);

  float steps = max(floor(u_colorSteps), 1.);
  float ditherAmount = 1.0 / (steps);
  
  vec3 color = vec3(0.0);
  float opacity = 1.;

  if (u_ownPalette == true) {
    dithering -= .5;
    float brightness = clamp(lum + dithering * ditherAmount, 0.0, 1.0);
    brightness = mix(0.0, brightness, frame);
    float quantLum = floor(brightness * steps + 0.5) / steps;
    vec3 normColor = image.rgb / max(lum, 0.001);
    color = normColor * quantLum;

    float quantAlpha = floor(image.a * steps + 0.5) / steps;
    opacity = mix(quantLum, 1., frame * quantAlpha);
  } else {
    dithering -= .5;
    float brightness = clamp(lum + dithering * ditherAmount, 0.0, 1.0);
    brightness = mix(0.0, brightness, frame);
    float quantLum = floor(brightness * steps + 0.5) / steps;

    vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
    float fgOpacity = u_colorFront.a;
    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    float bgOpacity = u_colorBack.a;

    color = fgColor * quantLum;
    opacity = fgOpacity * quantLum;
    color += bgColor * (1.0 - opacity);
    opacity += bgOpacity * (1.0 - opacity);
  }


  fragColor = vec4(color, opacity);
}
`;

export interface ImageDitheringUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_type: (typeof DitheringTypes)[DitheringType];
  u_pxSize: number;
  u_colorSteps: number;
  u_ownPalette: boolean;
}

export interface ImageDitheringParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string | undefined;
  colorFront?: string;
  colorBack?: string;
  type?: DitheringType;
  pxSize?: number;
  colorSteps?: number;
  ownPalette?: boolean;
}

export const DitheringTypes = {
  'random': 1,
  '2x2': 2,
  '4x4': 3,
  '8x8': 4,
} as const;

export type DitheringType = keyof typeof DitheringTypes;

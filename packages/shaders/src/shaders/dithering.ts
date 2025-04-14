import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingUniformsDeclaration,
  sizingPatternUV,
  sizingSquareUV,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
import { declareSimplexNoise, declarePI, declareRandom } from '../shader-utils';

/**
 * Stepped Simplex Noise by Ksenia Kondrashova
 * Calculates a combination of 2 simplex noises with result rendered as
 * an X-stepped 5-colored gradient
 *
 * Uniforms include:
 * u_color1 - the first gradient color
 * u_color2 - the second gradient color
 * u_color3 - the third gradient color
 * u_color4 - the fourth gradient color
 * u_color5 - the fifth gradient color
 * u_steps_number - the number of solid colors to show as a stepped gradient
 */
export const ditheringFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform sampler2D u_image;
uniform float u_image_width;
uniform float u_image_height;

${sizingUniformsDeclaration}

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform float u_shape;
uniform float u_type;
uniform float u_pxSize;
uniform bool u_pxRounded;

out vec4 fragColor;

${declareSimplexNoise}
${declarePI}
${declareRandom}

float get_noise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

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
  ivec2 pos = ivec2(uv) % size;
  int index = (pos.y % size) * size + (pos.x % size);

  if (size == 2) {
    return float(bayer2x2[index]) / 4.0;
  } else if (size == 4) {
    return float(bayer4x4[index]) / 16.0;
  } else if (size == 8) {
    return float(bayer8x8[index]) / 64.0;
  }
  return 0.0;
}

#define USE_PX_ROUNDING

void main() {

  float t = .5 * u_time;

  float pxSize = 0.;
  if (u_pxRounded == true) {
    pxSize = u_pxSize;
  }

  vec2 shape_uv = vec2(0.);
  vec2 dithering_uv = vec2(0.);
  vec2 ditheringNoise_uv = vec2(0.);
  if (u_shape < 3.5) {
    ${sizingPatternUV}
    shape_uv = uv;
    dithering_uv = pxSizeUv;
    ditheringNoise_uv = roundedUv;
  } else {
    ${sizingSquareUV}
    shape_uv = uv;
    dithering_uv = pxSizeUv;
    ditheringNoise_uv = roundedUv;
  }

  float shape = 0.;
  if (u_shape < 1.5) {
    // Simplex noise
    shape_uv *= .001;

    shape = 0.5 + 0.5 * get_noise(shape_uv, t);
    shape = smoothstep(0.3, 0.9, shape);

  } else if (u_shape < 2.5) {
    // Warp
    shape_uv *= .003;

    for (float i = 1.0; i < 6.0; i++) {
      shape_uv.x += 0.6 / i * cos(i * 2.5 * shape_uv.y + t);
      shape_uv.y += 0.6 / i * cos(i * 1.5 * shape_uv.x + t);
    }

    shape = .15 / abs(sin(t - shape_uv.y - shape_uv.x));
    shape = smoothstep(0.02, 1., shape);

  } else if (u_shape < 3.5) {
    // Grid
    shape_uv *= .05;

    float stripeIdx = floor(2. * shape_uv.x / TWO_PI);
    float rand = fract(sin(stripeIdx * 12.9898) * 43758.5453);

    float speed = sign(rand - .5) * ceil(2. + rand);
    shape = sin(shape_uv.x) * cos(shape_uv.y + speed * t);
    shape = pow(shape, 6.);

  } else if (u_shape < 4.5) {
    // Sine wave
    shape_uv *= 4.;

    float wave = cos(.5 * shape_uv.x - 2. * t) * sin(1.5 * shape_uv.x + t) * (.75 + .25 * cos(3. * t));
    shape = 1. - smoothstep(-1., 1., shape_uv.y + wave);

  } else if (u_shape < 5.5) {
    // Ripple

    float dist = length(shape_uv);
    float waves = sin(pow(dist, 1.7) * 7. - 3. * t) * .5 + .5;
    shape = waves;

  } else if (u_shape < 6.5) {
    // Swirl

    float l = length(shape_uv);
    float angle = 6. * atan(shape_uv.y, shape_uv.x) + 4. * t;
    float angle_norm = angle / TWO_PI;
    float twist = 1.2;
    float offset = pow(l, -twist) + angle_norm;
    float stripe_map = fract(offset);
    float mid = smoothstep(0., 1., pow(l, twist));
    shape = mix(0., stripe_map, mid);

  } else {
    // Sphere
    shape_uv *= 2.;

    vec3 pos = vec3(shape_uv, sqrt(1. - pow(length(shape_uv), 2.)));
    vec3 lightPos = normalize(vec3(cos(1.5 * t), .8, sin(1.25 * t)));
    shape = .5 + .5 * dot(lightPos, pos);
  }


  int type = int(floor(u_type));
  float dithering = 0.0;

  switch (type) {
    case 1: {
      dithering = step(random(ditheringNoise_uv), shape);
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

  dithering -= .5;
  float res = step(.5, shape + dithering);

  vec4 color = mix(u_color1, u_color2, res);
  fragColor = color;
}
`;

export interface DitheringUniforms extends ShaderSizingUniforms {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_shape: number;
  u_type: number;
  u_pxSize: number;
  u_pxRounded: boolean;

  u_image: HTMLImageElement | null;
}

export interface DitheringParams extends ShaderSizingParams, ShaderMotionParams {
  color1?: string;
  color2?: string;
  shape?: number;
  type?: number;
  pxSize?: number;
  pxRounded?: boolean;
  image?: HTMLImageElement | null;
}

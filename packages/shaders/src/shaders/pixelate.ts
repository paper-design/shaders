import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms, sizingVariablesDeclaration } from '../shader-sizing.js';
import { declarePI, declareRandom, declareRotate } from '../shader-utils.js';

/**
 * Basic pixelation effect.
 */
export const pixelateFragmentShader: string = `#version 300 es
  precision mediump float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_pixelRatio;

  uniform sampler2D u_image;
  uniform float u_image_aspect_ratio;

  uniform float u_size_x;
  uniform float u_size_y;

  ${sizingVariablesDeclaration}
  ${declarePI}
  ${declareRotate}
  ${declareRandom}

  out vec4 fragColor;

  float uvFrame(vec2 uv) {
    return step(1e-3, uv.x) * step(uv.x, 1. - 1e-3) * step(1e-3, uv.y) * step(uv.y, 1. - 1e-3);
  }

  void main() {
    vec2 imageUV = v_responsiveUV + .5;
    float screenRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
    float imageRatio = u_image_aspect_ratio;

    vec2 ratio = (screenRatio > imageRatio) ? vec2(screenRatio / imageRatio, 1.) : vec2(1., imageRatio / screenRatio);

    imageUV.y = 1. - imageUV.y;

    imageUV -= .5;
    imageUV *= ratio;
    imageUV += .5;

    float frame = uvFrame(imageUV);
    if (frame < .05) discard;

    vec2 size = vec2(u_size_x, u_size_y) * ratio;

    fragColor = texture(u_image, ((floor((imageUV * u_resolution) / size) * size) + size * .5) / u_resolution);
  }
`;

export interface PixelateUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | null;
  u_size_x: number;
  u_size_y: number;
}

export interface PixelateParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string | null;
  sizeX?: number;
  sizeY?: number;
}

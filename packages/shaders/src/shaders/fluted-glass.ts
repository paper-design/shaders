import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';

/**
 */
export const flutedGlassFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform sampler2D u_image;
uniform float u_image_aspect_ratio;

${sizingVariablesDeclaration}

out vec4 fragColor;

float uvFrame(vec2 uv) {
  return step(1e-3, uv.x) * step(uv.x, 1. - 1e-3) * step(1e-3, uv.y) * step(uv.y, 1. - 1e-3);
}

void main() {
  vec2 patternUV = v_patternUV;

  vec2 imageUV = v_responsiveUV + .5;
  float screenRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  float imageRatio = u_image_aspect_ratio;

  imageUV.y = 1. - imageUV.y;

  imageUV -= .5;
  if (screenRatio > imageRatio) {
    imageUV.x = imageUV.x * screenRatio / imageRatio;
  } else {
    imageUV.y = imageUV.y * imageRatio / screenRatio;
  }
  imageUV += .5;

  vec4 imgTexture = texture(u_image, imageUV);
  vec3 color = imgTexture.rgb;
  float opacity = uvFrame(imageUV);
  
  fragColor = vec4(color, opacity);
}
`;

export interface FlutedGlassUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | null;
}

export interface FlutedGlassParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | null;
}

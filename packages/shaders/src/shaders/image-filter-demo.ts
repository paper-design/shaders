import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declareSimplexNoise, declarePI, declareRandom } from '../shader-utils';

/**
 */
export const imageFilterDemoFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform sampler2D u_image;
uniform float u_image_width;
uniform float u_image_height;

uniform float u_pxSize;

${sizingVariablesDeclaration}

out vec4 fragColor;

void main() {

  vec2 object_uv = v_objectUV - .5;
  vec2 pattern_uv = v_patternUV;
  
  vec2 image_uv = object_uv;
  image_uv.y = 1. - image_uv.y;

  float pxSize = u_pxSize * u_pixelRatio;
  pxSize = 1000. / pxSize;
  
  image_uv = floor(image_uv * pxSize) / pxSize;

  vec4 color = texture(u_image, image_uv);
  
  color.a *= step(object_uv.x, 0.);
  color.a *= step(.0, object_uv.x + 1.);
  
  fragColor = color;
}
`;

export interface ImageFilterDemoUniforms extends ShaderSizingUniforms {
  u_pxSize: number;
  u_image: HTMLImageElement | null;
}

export interface ImageFilterDemoParams extends ShaderSizingParams, ShaderMotionParams {
  pxSize?: number;
  image?: HTMLImageElement | null;
}

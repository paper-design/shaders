import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingUV, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';

/**


 Uniforms:
 - u_colorBack, u_colorFront, u_colorHighlight (RGBA)
 (u_colorHighlight to be the lightest parts of u_colorFront pixels)
 - pxSize: px size set relative to canvas resolution
 */

// language=GLSL
export const imageGooeyDotsFragmentShader: string = `#version 300 es
precision lowp float;

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

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorHighlight;
uniform float u_threshold;
uniform float u_testScd;

uniform sampler2D u_image;
uniform mediump float u_imageAspectRatio;

uniform float u_pxSize;

out vec4 fragColor;

float getUvFrame(vec2 uv, vec2 px) {
  float left   = step(-px.x, uv.x);
  float right  = step(uv.x, 1.);
  float bottom = step(-px.y, uv.y);
  float top    = step(uv.y, 1. + px.y);

  return left * right * bottom * top;
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

vec2 getImageUV(vec2 uv) {
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  vec2 imageUV = uv;
  imageUV *= imageBoxScale;
  imageUV += boxOrigin * (imageBoxScale - 1.);
  imageUV += graphicOffset;
  imageUV /= u_scale;
  imageUV.x *= u_imageAspectRatio;
  imageUV = graphicRotation * imageUV;
  imageUV.x /= u_imageAspectRatio;

  imageUV += .5;
  imageUV.y = 1. - imageUV.y;
  
  return imageUV;
}

float getBall(vec2 uv, float r) {
  float d = length(uv - .5);
  d = 1. - sst(0., .5, d);
  return d * r;
}

float getLum(vec2 uv_i, float pxSize) {
  uv_i *= pxSize;
  uv_i += .5 * pxSize;
  uv_i /= u_resolution.xy;
  vec2 basePxSizeImageUV = getImageUV(uv_i);
  vec4 imageBaseGrid = texture(u_image, basePxSizeImageUV);
  return dot(vec3(.2126, .7152, .0722), imageBaseGrid.rgb);
}


void main() {
  
  float basePxSize = u_pxSize * u_pixelRatio;
  vec2 basePxSizeUV = gl_FragCoord.xy;
  basePxSizeUV -= .5 * u_resolution;
  basePxSizeUV += .25 * basePxSize;
  basePxSizeUV /= basePxSize;

  vec2 basePxSizeUV_i = floor(basePxSizeUV);
  float lum[9];
  int index = 0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = basePxSizeUV_i + vec2(float(x), float(y));
      lum[index] = getLum(offset, basePxSize);
      index++;
    }
  }

  float doublePxSize = u_pxSize * u_pixelRatio * 2.;
  vec2 doublePxSizeUV = gl_FragCoord.xy;
  doublePxSizeUV -= .5 * u_resolution;
  
  float lumDoubleGrid = 0.;
  vec2 doublePxSizeUV_f = vec2(0.);
  {
    vec2 uv = doublePxSizeUV;
    uv += 3. / 4. * basePxSize;
    uv /= doublePxSize;
    doublePxSizeUV_f = fract(uv + .0001);

    float sx = step(.25, doublePxSizeUV_f.x) + step(.75, doublePxSizeUV_f.x);
    float sy = step(.25, doublePxSizeUV_f.y) + step(.75, doublePxSizeUV_f.y);
    int idx = int(8.0 - sx - 3.0 * sy);
    lumDoubleGrid = lum[idx];
  }

  float lumDoubleGridCopy = 0.;
  vec2 doublePxSizeUVCopy_f = vec2(0.);
  {
    vec2 uv = doublePxSizeUV;
    uv -= 1. / 4. * basePxSize;
    uv /= doublePxSize;
    doublePxSizeUVCopy_f = fract(uv + .0001);

    float sx = step(.25, doublePxSizeUVCopy_f.x) + step(.75, doublePxSizeUVCopy_f.x);
    float sy = step(.25, doublePxSizeUVCopy_f.y) + step(.75, doublePxSizeUVCopy_f.y);
    int idx = int(8.0 - sx - 3.0 * sy);
    lumDoubleGridCopy = lum[idx];
  }
  
  float ball = getBall(doublePxSizeUV_f, lumDoubleGrid);
  float ballCopy = getBall(doublePxSizeUVCopy_f, lumDoubleGridCopy);

  float res = ball;
  res += ballCopy;
  float controur = sst(u_threshold - fwidth(res), u_threshold + fwidth(res), res);
  res = controur;
  
  vec3 color = vec3(res);
//  color.r += lum[4];
  float opacity = 1.;

  fragColor = vec4(color, opacity);
}
`;

export interface ImageGooeyDotsUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_pxSize: number;
  u_threshold: number;
  u_testScd: number;
}

export interface ImageGooeyDotsParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorFront?: string;
  colorBack?: string;
  size?: number;
  threshold?: number;
  testScd?: number;
}

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

float ball(vec2 uv, float r) {
  return 1. - pow(sst(0., mix(0., .6, r), length(uv - .5)), .5);
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

  vec2 basePxSizeUV_i   = floor(basePxSizeUV);
  vec2 basePxSizeUV_i_l = basePxSizeUV_i - vec2(-1.0, 0.0);
  vec2 basePxSizeUV_i_r = basePxSizeUV_i - vec2(1.0, 0.0);
  vec2 basePxSizeUV_i_t = basePxSizeUV_i - vec2(0.0, 1.0);
  vec2 basePxSizeUV_i_b = basePxSizeUV_i - vec2(0.0, -1.0);
  vec2 basePxSizeUV_i_lt = basePxSizeUV_i - vec2(-1.0, 1.0);
  vec2 basePxSizeUV_i_rt = basePxSizeUV_i - vec2(1.0, 1.0);
  vec2 basePxSizeUV_i_lb = basePxSizeUV_i - vec2(-1.0, -1.0);
  vec2 basePxSizeUV_i_rb = basePxSizeUV_i - vec2(1.0, -1.0);
  
  float lum_c  = getLum(basePxSizeUV_i, basePxSize);
  float lum_l  = getLum(basePxSizeUV_i_l, basePxSize);
  float lum_r  = getLum(basePxSizeUV_i_r, basePxSize);
  float lum_t  = getLum(basePxSizeUV_i_t, basePxSize);
  float lum_b  = getLum(basePxSizeUV_i_b, basePxSize);
  float lum_lt = getLum(basePxSizeUV_i_lt, basePxSize);
  float lum_rt = getLum(basePxSizeUV_i_rt, basePxSize);
  float lum_lb = getLum(basePxSizeUV_i_lb, basePxSize);
  float lum_rb = getLum(basePxSizeUV_i_rb, basePxSize);
  
  

  float doublePxSize = u_pxSize * u_pixelRatio * 2.;
  vec2 doublePxSizeUV = gl_FragCoord.xy;
  doublePxSizeUV -= .5 * u_resolution;
  doublePxSizeUV += 1. / 4. * doublePxSize;
  doublePxSizeUV += 1. / 8. * doublePxSize;
  doublePxSizeUV /= doublePxSize;
  
  vec2 doublePxSizeUV_f = fract(doublePxSizeUV);


  bool leftBand   = (doublePxSizeUV_f.x <  0.25);
  bool rightBand  = (doublePxSizeUV_f.x >  0.75);
  bool centerX    = !leftBand && !rightBand;
  bool bottomBand = (doublePxSizeUV_f.y <  0.25);
  bool topBand    = (doublePxSizeUV_f.y >  0.75);
  bool centerY    = !bottomBand && !topBand;

  float lumDoubleGrid = lum_c;
  float test = 0.;
  if (leftBand && bottomBand) {
    lumDoubleGrid = lum_lb;
  } else if (centerX && bottomBand) {
    lumDoubleGrid = lum_b;
  } else if (rightBand && bottomBand) {
    lumDoubleGrid = lum_rb;
  } else if (leftBand && centerY) {
    lumDoubleGrid = lum_l;
  } else if (centerX && centerY) {
    lumDoubleGrid = lum_c;
  } else if (rightBand && centerY) {
    lumDoubleGrid = lum_r;
  } else if (leftBand && topBand) {
    lumDoubleGrid = lum_lt;
  } else if (centerX && topBand) {
    lumDoubleGrid = lum_t;
  } else if (rightBand && topBand) {
    lumDoubleGrid = lum_rt;
  }


  float res_c = ball(doublePxSizeUV_f, lumDoubleGrid);
  res_c = sst(.0, .0, res_c);
  
  vec3 color = vec3(lum_c);
  color.b = res_c;
  color.r = mix(color.r, 1., test);
  float opacity = 1.;

  fragColor = vec4(color, opacity);
}
`;

export interface ImageGooeyDotsUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_pxSize: number;
}

export interface ImageGooeyDotsParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorFront?: string;
  colorBack?: string;
  size?: number;
}

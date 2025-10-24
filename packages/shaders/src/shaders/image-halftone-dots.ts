import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2, proceduralHash21 } from '../shader-utils.js';

/**


 Uniforms:
 - u_colorBack, u_colorFront, u_colorHighlight (RGBA)
 (u_colorHighlight to be the lightest parts of u_colorFront pixels)
 - size: px size set relative to canvas resolution
 */

// language=GLSL
export const imageHalftoneDotsFragmentShader: string = `#version 300 es
precision lowp float;

uniform mediump vec2 u_resolution;
uniform mediump float u_pixelRatio;
uniform mediump float u_originX;
uniform mediump float u_originY;
uniform mediump float u_fit;

uniform mediump float u_scale;
uniform mediump float u_rotation;
uniform mediump float u_offsetX;
uniform mediump float u_offsetY;

uniform float u_time;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_radius;
uniform float u_contrast;

uniform sampler2D u_image;
uniform mediump float u_imageAspectRatio;

uniform float u_size;
uniform float u_grainMixer;
uniform float u_grainOverlay;
uniform float u_grainScale;
uniform bool u_originalColors;
uniform bool u_inverted;
uniform float u_type;

out vec4 fragColor;

${declarePI}
${rotation2}
${proceduralHash21}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

vec2 getPixelizationOffset() {
  vec2 imageBoxSize;
  if (u_fit == 1.) {
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageCenter = (u_resolution - imageBoxSize) * .5;
  return imageCenter;
}

vec2 getImageUV(vec2 uv, vec2 extraScale) {
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  float r = u_rotation * PI / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  vec2 imageBoxSize;
  if (u_fit == 1.) {
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  vec2 imageUV = uv;
  imageUV *= imageBoxScale;
  imageUV += boxOrigin * (imageBoxScale - 1.);
  imageUV += graphicOffset;
  imageUV /= u_scale;
  imageUV *= extraScale;
  imageUV.x *= u_imageAspectRatio;
  imageUV = graphicRotation * imageUV;
  imageUV.x /= u_imageAspectRatio;

  imageUV.y = 1. - imageUV.y;
  
  return imageUV;
}

float getCircle(vec2 uv, float r) {
  r = mix(.5 * u_radius, 0., r);
  float d = length(uv - .5);
  float aa = fwidth(d);
  return 1. - smoothstep(r - aa, r + aa, d);
}

float getCell(vec2 uv) {
  uv *= 2.0;
  uv -= 0.5;
  float insideX = step(0.0, uv.x) * (1.0 - step(1.0, uv.x));
  float insideY = step(0.0, uv.y) * (1.0 - step(1.0, uv.y));
  return insideX * insideY;
}

float getCircleOverflow(vec2 uv, float r) {
  float cell = getCell(uv);

  r = mix(.5 * u_radius, 0., r);
  float rMod = mod(r, .25);
  
  float d = length(uv - .5);
  float aa = fwidth(d);
  float circle = 1. - smoothstep(rMod - aa, rMod + aa, d);
  if (r < .25) {
    return circle;
  } else {
    return cell - circle;
  }
}

float getGooeyBall(vec2 uv, float r) {
  float d = length(uv - .5);
  d = 1. - sst(0., .5, d);
  d = mix(1., .5, r) * pow(d, mix(.2, 10., r));
  return d;
}

float getUvFrame(vec2 uv) {
  float aax = 2. * fwidth(uv.x);
  float aay = 2. * fwidth(uv.y);

  float left   = smoothstep(0., aax, uv.x);
  float right  = smoothstep(1., 1. - aax, uv.x);
  float bottom = smoothstep(0., aay, uv.y);
  float top    = smoothstep(1., 1. - aay, uv.y);

  return left * right * bottom * top;
}

float sigmoid(float x, float k) {
  return 1.0 / (1.0 + exp(-k * (x - 0.5)));
}

float getLumAtPx(vec2 uv, float contrast) {
  vec2 dudx = dFdx(uv);
  vec2 dudy = dFdy(uv);
  vec4 tex = textureGrad(u_image, uv, dudx, dudy);
  
  vec3 color = vec3(
  sigmoid(tex.r, contrast),
  sigmoid(tex.g, contrast),
  sigmoid(tex.b, contrast)
  );
  float lum = dot(vec3(0.2126, 0.7152, 0.0722), color);
  lum = u_inverted ? (1. - lum) : lum;
  return lum;
}

float getLumBall(vec2 uv, float gridSize, vec2 inCellOffset, float contrast, out vec4 ballColor, out float outLum) {
  vec2 p = uv + inCellOffset;
  p /= gridSize;
  vec2 uv_i = floor(p);
  vec2 uv_f = fract(p + .0001);

  vec2 samplePx = uv_i * gridSize - inCellOffset;
  vec2 sampleUV = getImageUV(samplePx / u_resolution.xy, vec2(1.));
  float lum = getLumAtPx(sampleUV, contrast);
  ballColor = texture(u_image, sampleUV);
  ballColor.rgb *= ballColor.a;

  float ball = 0.;
  if (u_type < .5) {
    ball = getCircle(uv_f, lum);
  } else if (u_type < 1.5) {
    ball = getCircleOverflow(uv_f, lum);
  } else if (u_type < 2.5) {
    ball = getGooeyBall(uv_f, lum);
  }

  outLum = lum;
  return ball;
}

void main() {
  float pxSize = u_size * u_pixelRatio;
  float contrast = mix(0., 15., u_contrast);
  
//  vec2 uvNormalised = gl_FragCoord.xy / u_resolution.xy;
//  vec2 uvOriginal = getImageUV(uvNormalised, vec2(1.));
//  vec4 texture = texture(u_image, uvOriginal);
//  float frameOriginal = getUvFrame(uvOriginal);

  
  //
//  float totalShape = 0.;
//  vec3 totalColor = vec3(0.);
//  float totalOpacity = 0.;
//
//  uv += .5 * gridSize;
//
//  vec4 ballColor;
//  float shape;
//  float sampleLum;// NEW: per-sample luminance
//  float lumWeighted = 0.0;// NEW: accumulate lum * shape
//
//  shape = getLumBall(uv, gridSize, vec2(0.), contrast, ballColor, sampleLum);
//  totalColor += ballColor.rgb * shape;
//  totalShape += shape;
//  totalOpacity += ballColor.a * shape;
//  lumWeighted += sampleLum * shape;
//
//  shape = getLumBall(uv, gridSize, vec2(2., 0.) * pxSize, contrast, ballColor, sampleLum);
//  totalColor += ballColor.rgb * shape;
//  totalShape += shape;
//  totalOpacity += ballColor.a * shape;
//  lumWeighted += sampleLum * shape;
//
//  shape = getLumBall(uv, gridSize, vec2(0., 2.) * pxSize, contrast, ballColor, sampleLum);
//  totalColor += ballColor.rgb * shape;
//  totalShape += shape;
//  totalOpacity += ballColor.a * shape;
//  lumWeighted += sampleLum * shape;
//
//  shape = getLumBall(uv, gridSize, vec2(2.) * pxSize, contrast, ballColor, sampleLum);
//  totalColor += ballColor.rgb * shape;
//  totalShape += shape;
//  totalOpacity += ballColor.a * shape;
//  lumWeighted += sampleLum * shape;
//
//  if (u_type != 1.) {
//      shape = getLumBall(uv, gridSize, vec2(1.) * pxSize, contrast, ballColor, sampleLum);
//      totalColor += ballColor.rgb * shape;
//      totalShape += shape;
//      totalOpacity += ballColor.a * shape;
//      lumWeighted += sampleLum * shape;
//
//      shape = getLumBall(uv, gridSize, vec2(1., 3.) * pxSize, contrast, ballColor, sampleLum);
//      totalColor += ballColor.rgb * shape;
//      totalShape += shape;
//      totalOpacity += ballColor.a * shape;
//      lumWeighted += sampleLum * shape;
//
//      shape = getLumBall(uv, gridSize, vec2(3., 1.) * pxSize, contrast, ballColor, sampleLum);
//      totalColor += ballColor.rgb * shape;
//      totalShape += shape;
//      totalOpacity += ballColor.a * shape;
//      lumWeighted += sampleLum * shape;
//
//      shape = getLumBall(uv, gridSize, vec2(3.) * pxSize, contrast, ballColor, sampleLum);
//      totalColor += ballColor.rgb * shape;
//      totalShape += shape;
//      totalOpacity += ballColor.a * shape;
//      lumWeighted += sampleLum * shape;
//  }
//  
//  totalShape *= texture.a;
//
//  const float eps = 1e-4;
//  
//  totalColor /= max(totalShape, eps);
//  totalOpacity /= max(totalShape, eps);
//
//  float avgLum = lumWeighted / max(totalShape, eps);
//
//  float finalShape = 0.;
//  if (u_type < .5) {
//    finalShape = min(1., totalShape);
//  } else if (u_type < 1.5) {
//    finalShape = min(1., totalShape);
//  } else if (u_type < 2.5) {
//    float aa = fwidth(totalShape);
//    float r = 1. - u_radius;
//    finalShape = smoothstep(r - aa, r + aa, totalShape);
////    finalShape = totalShape;
//  }
//
//  vec2 dudx = dFdx(uvOriginal);
//  vec2 dudy = dFdy(uvOriginal);
//  vec2 grainUV = getImageUV(uvNormalised, .6 / vec2(length(dudx), length(dudy)));
//  float grain = valueNoise(grainUV);
//  grain = smoothstep(.55, .7 + .2 * u_grainMixer, grain);
//  grain *= u_grainMixer;
//  finalShape = mix(finalShape, 0., grain);
//
//  vec3 color = vec3(0.);
//  float opacity = 0.;
//  
//  if (u_originalColors == true) {
//    color = totalColor * finalShape;
//    opacity = totalOpacity * finalShape;
//
//    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
//    color = color + bgColor * (1. - opacity);
//    opacity = opacity + u_colorBack.a * (1. - opacity);
//  } else {
//    vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
//    float fgOpacity = u_colorFront.a;
//    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
//    float bgOpacity = u_colorBack.a;
//
//    color = fgColor * finalShape;
//    opacity = fgOpacity * finalShape;
//    color += bgColor * (1. - opacity);
//    opacity += bgOpacity * (1. - opacity);
//  }
//
//  float rr = valueNoise(rotate(grainUV, 1.) + vec2(3.));
//  float gg = valueNoise(rotate(grainUV, 2.) + vec2(-1.));
//  float bb = valueNoise(grainUV + vec2(5.));
//  vec3 grainColor = vec3(rr, gg, bb);
//  color = mix(color, grainColor, .01 + .5 * u_grainOverlay);

//  fragColor = vec4(color, opacity);

  vec2 block = floor((gl_FragCoord.xy - getPixelizationOffset()) / pxSize);
  vec2 pixelizedUv = (block + .5) * pxSize / u_resolution;
  pixelizedUv = getImageUV(pixelizedUv, vec2(1.));

  float lum = getLumAtPx(pixelizedUv, contrast);

  fragColor = vec4(vec3(lum), 1.);
}
`;

export interface ImageHalftoneDotsUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_size: number;
  u_radius: number;
  u_contrast: number;
  u_originalColors: boolean;
  u_inverted: boolean;
  u_grainMixer: number;
  u_grainOverlay: number;
  u_grainScale: number;
  u_type: (typeof ImageHalftoneDotsTypes)[ImageHalftoneDotsType];
}

export interface ImageHalftoneDotsParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorFront?: string;
  colorBack?: string;
  size?: number;
  radius?: number;
  contrast?: number;
  originalColors?: boolean;
  inverted?: boolean;
  grainMixer?: number;
  grainOverlay?: number;
  grainScale?: number;
  type?: ImageHalftoneDotsType;
}

export const ImageHalftoneDotsTypes = {
  classic: 0,
  overflow: 1,
  gooey: 2,
} as const;

export type ImageHalftoneDotsType = keyof typeof ImageHalftoneDotsTypes;

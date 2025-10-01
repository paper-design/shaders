import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingUV, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2 } from '../shader-utils.js';

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

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_threshold;
uniform float u_contrast;

uniform sampler2D u_image;
uniform mediump float u_imageAspectRatio;

uniform float u_pxSize;

out vec4 fragColor;

${ declarePI }
${ rotation2 }

float getUvFrame(vec2 uv, vec2 px) {
  float left   = smoothstep(-.5 * px.x, .5 * px.x, uv.x);
  float right  = smoothstep(1. + .5 * px.x, 1. - .5 * px.x, uv.x);
  float bottom = smoothstep(-.5 * px.y, .5 * px.y, uv.y);
  float top    = smoothstep(1. + .5 * px.y, 1. - .5 * px.y, uv.y);
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
//  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
//  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
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
  d = mix(1., .5, r) * pow(d, mix(.2, 10., r));
  return d;
}

vec2 hash22(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p.yx + 19.19);
  return fract(vec2(p.x * p.y, p.x + p.y));
}

float sigmoid(float x, float k) {
  return 1.0 / (1.0 + exp(-k * (x - 0.5)));
}

float getLumAtPx(vec2 px, float contrast) {
  vec2 uv = getImageUV(px / u_resolution.xy);
  vec4 tex = texture(u_image, uv);
  vec3 color = vec3(
  sigmoid(tex.r, contrast),
  sigmoid(tex.g, contrast),
  sigmoid(tex.b, contrast)
  );
  return dot(vec3(0.2126, 0.7152, 0.0722), color);
}

vec4 getColorAtPx(vec2 px) {
  vec2 uv = getImageUV(px / u_resolution.xy);
  return texture(u_image, uv);
}

float getLumBall(vec2 uv, float pxSize, vec2 offsetPx, float contrast, out vec4 ballColor) {
  vec2 p = uv + offsetPx;
  p /= pxSize;
  vec2 uv_i = floor(p);
  vec2 uv_f = fract(p + .0001);

  vec2 samplePx = uv_i * pxSize - offsetPx;
  float lum = getLumAtPx(samplePx, contrast);
  ballColor = getColorAtPx(samplePx);
  ballColor.rgb *= ballColor.a;// Premultiply alpha

  return getBall(uv_f, lum);
}

void main() {
  float pxSize = u_pxSize * u_pixelRatio * 4.;
  vec2 uv = gl_FragCoord.xy;
  uv -= .5 * u_resolution;
  
  float contrast = mix(0., 12., u_contrast);
  
  vec2 uvOriginal = getImageUV(uv / u_resolution.xy);
  vec4 texture = texture(u_image, uvOriginal);

  vec2 frameUV = getImageUV(uv / u_resolution.xy);
  float frame = getUvFrame(frameUV, pxSize / u_resolution.xy);

  float totalShape = 0.;
  vec3 totalColor = vec3(0.);
  float totalOpacity = 0.;

  float step = .25 * pxSize;
  uv += 2. * step;

  vec4 ballColor;
  float shape;

  shape = getLumBall(uv, pxSize, vec2(0.), contrast,  ballColor);
  totalColor += ballColor.rgb * shape;
  totalShape += shape;
  totalOpacity += ballColor.a * shape;

  shape = getLumBall(uv, pxSize, vec2(step), contrast,  ballColor);
  totalColor += ballColor.rgb * shape;
  totalShape += shape;
  totalOpacity += ballColor.a * shape;

  shape = getLumBall(uv, pxSize, vec2(2. * step, 0.), contrast,  ballColor);
  totalColor += ballColor.rgb * shape;
  totalShape += shape;
  totalOpacity += ballColor.a * shape;

  shape = getLumBall(uv, pxSize, vec2(0., 2. * step), contrast,  ballColor);
  totalColor += ballColor.rgb * shape;
  totalShape += shape;
  totalOpacity += ballColor.a * shape;

  shape = getLumBall(uv, pxSize, vec2(2. * step), contrast,  ballColor);
  totalColor += ballColor.rgb * shape;
  totalShape += shape;
  totalOpacity += ballColor.a * shape;

  shape = getLumBall(uv, pxSize, vec2(step, 3. * step), contrast,  ballColor);
  totalColor += ballColor.rgb * shape;
  totalShape += shape;
  totalOpacity += ballColor.a * shape;

  shape = getLumBall(uv, pxSize, vec2(3. * step, step), contrast,  ballColor);
  totalColor += ballColor.rgb * shape;
  totalShape += shape;
  totalOpacity += ballColor.a * shape;

  shape = getLumBall(uv, pxSize, vec2(3. * step), contrast,  ballColor);
  totalColor += ballColor.rgb * shape;
  totalShape += shape;
  totalOpacity += ballColor.a * shape;

  totalShape *= frame;
  totalShape *= texture.a;

  // Divide by accumulated shape for proper blending
  totalColor /= max(totalShape, 1e-4);
  totalOpacity /= max(totalShape, 1e-4);

  // Apply smooth edge
  float edge_width = fwidth(totalShape);
  float finalShape = smoothstep(u_threshold - edge_width, u_threshold + edge_width, totalShape);

  vec3 color = totalColor * finalShape;
  float opacity = totalOpacity * finalShape;

  // Blend with background
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  fragColor = vec4(color, opacity);
}
`;

export interface ImageGooeyDotsUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_pxSize: number;
  u_threshold: number;
  u_contrast: number;
}

export interface ImageGooeyDotsParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorFront?: string;
  colorBack?: string;
  size?: number;
  threshold?: number;
  contrast?: number;
}

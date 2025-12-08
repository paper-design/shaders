import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2 } from '../shader-utils.js';

// language=GLSL
export const halftoneCmykFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_fit;

uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec4 u_colorBack;
uniform float u_size;
uniform float u_radius;
uniform float u_angleC;
uniform float u_angleM;
uniform float u_angleY;
uniform float u_angleK;
uniform float u_contrast;
uniform float u_grainSize;
uniform float u_grainMixer;

out vec4 fragColor;

${ declarePI }
${ rotation2 }

// simple smooth circle; radius in cell-space (expects local to be in "square" cell space)
float smoothCircle(float r, vec2 p, float softness) {
  float d = length(p);
  return 1.0 - smoothstep(r - softness, r + softness, d);
}

float halftoneDot(float value, vec2 uv, float angle, float freq, float radiusMult) {
  // To make dot cells respect image aspect ratio we work in a scaled UV space
  // where X is multiplied by u_imageAspectRatio so a cell is square in image pixels.
  vec2 scaledUV = uv;
  scaledUV.x *= u_imageAspectRatio;

  vec2 p = scaledUV * freq;
  p = rotate(p, radians(angle));

  // local coordinates in scaled cell space (center at 0)
  vec2 local = fract(p) - .5;

  // move back to unscaled space for radius/distance computations so the radius
  // parameter behaves consistently regardless of image aspect.
  // (local.x is currently in scaled coordinates, divide it back)
  local.x /= u_imageAspectRatio;

  // distance from center (now using correct, circular distance)
  float d = length(local);
  // invert value: in CMYK higher channel = more ink (darker), so larger dot
  float tRadius = radiusMult * (0.5 * value);

  float aa = fwidth(d);
  return 1. - smoothstep(tRadius - aa, tRadius + aa, d);
}

vec4 RGBtoCMYK(vec3 rgb) {
  float k = 1.0 - max(max(rgb.r, rgb.g), rgb.b);
  float denom = 1.0 - k;
  vec3 cmy = vec3(0.0);
  if (denom > 1e-5) {
    cmy = (1.0 - rgb - vec3(k)) / denom;
  }
  return vec4(cmy, k);
}

vec3 CMYKtoRGB(vec4 cmyk) {
  vec3 rgb = vec3(0.);
  rgb.r = 1.0 - min(1.0, cmyk.x + cmyk.w);
  rgb.g = 1.0 - min(1.0, cmyk.y + cmyk.w);
  rgb.b = 1.0 - min(1.0, cmyk.z + cmyk.w);
  return rgb;
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

  imageUV += .5;
  imageUV.y = 1. - imageUV.y;

  return imageUV;
}

float getUvFrame(vec2 uv, vec2 pad) {
  float aa = 0.0001;

  float left   = smoothstep(-pad.x, -pad.x + aa, uv.x);
  float right  = smoothstep(1.0 + pad.x, 1.0 + pad.x - aa, uv.x);
  float bottom = smoothstep(-pad.y, -pad.y + aa, uv.y);
  float top    = smoothstep(1.0 + pad.y, 1.0 + pad.y - aa, uv.y);

  return left * right * bottom * top;
}

void main() {
  vec2 uvNormalised = (gl_FragCoord.xy - .5 * u_resolution) / u_resolution.xy;
  vec2 imageUV = getImageUV(uvNormalised, vec2(1.));

  vec4 src = texture(u_image, imageUV);
  vec3 rgb = src.rgb;

  vec4 cmyk = RGBtoCMYK(rgb);

  float freqBase = max(8.0, u_size * 100.);
  float radiusMult = u_radius;
  radiusMult *= getUvFrame(imageUV, vec2(0.));

  float Cmask = halftoneDot(cmyk.x, imageUV, u_angleC, freqBase, radiusMult);
  float Mmask = halftoneDot(cmyk.y, imageUV, u_angleM, freqBase, radiusMult);
  float Ymask = halftoneDot(cmyk.z, imageUV, u_angleY, freqBase, radiusMult);
  float Kmask = halftoneDot(cmyk.w, imageUV, u_angleK, freqBase, radiusMult);

  float C = clamp(Cmask * cmyk.x, 0.0, 1.0);
  float M = clamp(Mmask * cmyk.y, 0.0, 1.0);
  float Y = clamp(Ymask * cmyk.z, 0.0, 1.0);
  float K = clamp(Kmask * cmyk.w, 0.0, 1.0);

  vec4 outCmyk = vec4(C, M, Y, K);

  vec3 outRgb = CMYKtoRGB(outCmyk);

  fragColor = vec4(outRgb, 1.);
}
`;

export interface HalftoneCmykUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorBack: [number, number, number, number];
  u_size: number;
  u_radius: number;
  u_angleC: number;
  u_angleM: number;
  u_angleY: number;
  u_angleK: number;
  u_contrast: number;
  u_grainSize: number;
  u_grainMixer: number;
}

export interface HalftoneCmykParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorBack?: string;
  size?: number;
  radius?: number;
  angleC?: number;
  angleM?: number;
  angleY?: number;
  angleK?: number;
  contrast?: number;
  grainSize?: number;
  grainMixer?: number;
}

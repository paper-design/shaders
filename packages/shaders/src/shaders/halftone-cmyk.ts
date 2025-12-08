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

float halftoneDot(vec2 p, float radius) {
  vec2 cellCenter = floor(p) + 0.5;
  vec2 d = p - cellCenter;
  float dist = length(d);
  float aa = fwidth(dist);
  return 1. - smoothstep(radius - aa, radius + aa, dist);
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
  vec3 rgb;
  rgb.r = 1.0 - min(1.0, cmyk.x + cmyk.w);
  rgb.g = 1.0 - min(1.0, cmyk.y + cmyk.w);
  rgb.b = 1.0 - min(1.0, cmyk.z + cmyk.w);
  return rgb;
}

void main() {
  vec2 uvNormalised = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.xy;
  vec2 imageUV = getImageUV(uvNormalised, vec2(1.));

  vec4 tex = texture(u_image, imageUV);
  vec3 rgb = tex.rgb;

  float lum = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
  vec4 cmyk = RGBtoCMYK(rgb);
  
  float cellsPerSide = mix(300.0, 7.0, pow(u_size, 0.7));
  float cellSizeY = 1.0 / cellsPerSide;
  vec2 pad = cellSizeY * vec2(1.0 / u_imageAspectRatio, 1.0);
  vec2 pGrid = (imageUV - .5) / pad;

  vec2 pC = rotate(pGrid, radians(u_angleC));
  vec2 pM = rotate(pGrid, radians(u_angleM));
  vec2 pY = rotate(pGrid, radians(u_angleY));
  vec2 pK = rotate(pGrid, radians(u_angleK));

  float baseR = .5 * u_radius;
  float rC = baseR * clamp(cmyk[0], .1, 1.);
  float rM = baseR * clamp(cmyk[1], .1, 1.);
  float rY = baseR * clamp(cmyk[2], .1, 1.);
  float rK = baseR * clamp(cmyk[3], .1, 1.);

  float C = halftoneDot(pC, rC);
  float M = halftoneDot(pM, rM);
  float Y = halftoneDot(pY, rY);
  float K = halftoneDot(pK, rK);

  vec3 col = u_colorBack.rgb;

  vec4 outCmyk = vec4(C, M, Y, K);
  vec3 outRgb = CMYKtoRGB(outCmyk);

  fragColor = vec4(outRgb, 1.0);
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

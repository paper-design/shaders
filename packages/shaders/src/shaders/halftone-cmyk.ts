import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2 } from '../shader-utils.js';

// language=GLSL
export const halftoneCmykFragmentShader: string = `#version 300 es
precision mediump float;

uniform mediump vec2 u_resolution;
uniform mediump float u_pixelRatio;
uniform mediump float u_originX;
uniform mediump float u_originY;
uniform mediump float u_fit;

uniform mediump float u_scale;
uniform mediump float u_rotation;
uniform mediump float u_offsetX;
uniform mediump float u_offsetY;

uniform sampler2D u_image;
uniform mediump float u_imageAspectRatio;

uniform vec4 u_colorBack; // not used for this shader but kept for parity
uniform float u_size;
uniform float u_radius;
uniform vec4 u_angles; // radians for C, M, Y, K
uniform float u_contrast;
uniform float u_grainSize;
uniform float u_grainMixer;

out vec4 fragColor;

${ declarePI }
${ rotation2 }

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}

// simple smooth circle; radius in cell-space
float smoothCircle(float r, vec2 p, float softness) {
  float d = length(p);
  return 1.0 - smoothstep(r - softness, r + softness, d);
}

float hash(vec2 p) {
  // cheap hash for grain
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float grain(vec2 uv) {
  vec2 st = uv * u_grainSize;
  // small fractal-ish mix for nicer noise
  float n = hash(floor(st));
  n = mix(n, hash(floor(st + 1.234)), 0.5);
  return n * 2.0 - 1.0;
}

// Compute a halftone dot for a value [0..1] at uv using a rotated grid.
// freq controls spacing; radiusMult controls dot size relative to cell.
float halftoneDot(float value, vec2 uv, float angle, float freq, float radiusMult) {
  vec2 p = uv * freq;
  p = (rot(angle) * p);
  vec2 local = fract(p) - 0.5;
  // use length of local as distance to center
  float d = length(local);
  // invert value: in CMYK higher channel = more ink (darker), so larger dot
  float tRadius = radiusMult * (0.5 * value);
  // softness relative to cell
  float softness = 0.03;
  return smoothCircle(tRadius, local, softness);
}

vec4 rgb_to_cmyk(vec3 rgb) {
  float k = 1.0 - max(max(rgb.r, rgb.g), rgb.b);
  float denom = 1.0 - k;
  vec3 cmy = vec3(0.0);
  if (denom > 1e-5) {
    cmy = (1.0 - rgb - vec3(k)) / denom;
  }
  return vec4(cmy, k);
}

vec3 cmyk_to_rgb(vec4 cmyk) {
  // simple subtractive conversion: R = 1 - min(1, C + K)
  vec3 rgb;
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

void main() {
  vec2 uvNormalised = (gl_FragCoord.xy - .5 * u_resolution) / u_resolution.xy;
  vec2 imageUV = getImageUV(uvNormalised, vec2(1.));

  // sample source color
  vec4 src = texture(u_image, imageUV);
  vec3 rgb = src.rgb;

  // convert to CMYK
  vec4 cmyk = rgb_to_cmyk(rgb);

  // determine a frequency that scales with u_size and world size for consistent appearance
  float freqBase = max(8.0, u_size * 100.);
  float radiusMult = max(0.1, u_radius * 0.9);

  // compute channel dot masks (use imageUV so rotation centers match image scaling)
  float Cmask = halftoneDot(cmyk.x, imageUV, u_angles.x, freqBase, radiusMult);
  float Mmask = halftoneDot(cmyk.y, imageUV, u_angles.y, freqBase, radiusMult);
  float Ymask = halftoneDot(cmyk.z, imageUV, u_angles.z, freqBase, radiusMult);
  float Kmask = halftoneDot(cmyk.w, imageUV, u_angles.w, freqBase, radiusMult);

  // treat each mask as ink coverage and multiply by channel amount
  float C = clamp(Cmask * cmyk.x, 0.0, 1.0);
  float M = clamp(Mmask * cmyk.y, 0.0, 1.0);
  float Y = clamp(Ymask * cmyk.z, 0.0, 1.0);
  float K = clamp(Kmask * cmyk.w, 0.0, 1.0);

  vec4 outCmyk = vec4(C, M, Y, K);

  // convert back to RGB via subtractive mixing
  vec3 outRgb = cmyk_to_rgb(outCmyk);

  // add subtle grain to emulate printed halftone texture
  float g = grain(imageUV) * u_grainMixer;
  outRgb = clamp(outRgb + g, 0.0, 1.0);

  fragColor = vec4(outRgb, 1.0);
}
`;

export interface HalftoneCmykUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorBack: [number, number, number, number];
  u_size: number;
  u_radius: number;
  u_angles: [number, number, number, number];
  u_contrast: number;
  u_grainSize: number;
  u_grainMixer: number;
}

export interface HalftoneCmykParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorBack?: string;
  size?: number;
  radius?: number;
  angles?: [number, number, number, number];
  contrast?: number;
  grainSize?: number;
  grainMixer?: number;
}

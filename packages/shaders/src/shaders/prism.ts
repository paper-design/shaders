import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';

export const prismMeta = {
  maxColorSteps: 10,
} as const;

/**
 * Prism image filter that samples an image several times along a dispersion axis and gives each
 * sample its own color, the way glass refracts each wavelength by a different amount. The palette
 * is what the image splits into: three colors give a classic lens fringe, two an opposed pair,
 * eight a full spectrum. u_hue turns the palette as a whole, so red/green/blue at 0 becomes
 * cyan/magenta/yellow at 180.
 *
 * The colors work subtractively, like ink rather than light: a sample carries everything its color
 * is missing, so a sample landing on a dark feature takes its own color out of the result and
 * leaves it showing on the neighbours. That is what puts the palette colors on screen for a dark
 * subject on a light ground, which is most photographs. It reverses for a light subject on a dark
 * ground, where the fringes come out complemented.
 *
 * The palette is always evenly spaced hues at full saturation, which is what keeps the maths simple
 * downstream: however many colors there are and wherever u_hue puts them, they cover the wheel, so
 * every channel is carried by some of them and none is carried by all of them. Each channel can
 * then be divided by its own weight, leaving the image untouched where the samples line up
 * (shift = 0) without any risk of a channel dividing a vanishing weight back out of itself.
 *
 * Fragment shader uniforms:
 * - u_image (sampler2D): Source image texture
 * - u_colorSteps (float): Number of colors the image splits into (2 to 10)
 * - u_hue (float): Turns the whole palette around the hue wheel in degrees (0 to 360)
 * - u_shift (float): Distance the outermost samples travel apart,
 *   as a fraction of the image width (0 to 1, mapped to 0 to 10%)
 * - u_shiftBias (float): Warps the dispersion curve, bunching the middle colors toward the last
 *   color (-1) or the first (1); 0 spaces them evenly (-1 to 1)
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_imageUV (vec2): Image UV coordinates with global sizing (rotation, scale, offset, etc) applied
 *
 * Vertex shader uniforms:
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_originX (float): Reference point for positioning world width in the canvas (0 to 1)
 * - u_originY (float): Reference point for positioning world height in the canvas (0 to 1)
 * - u_fit (float): How to fit the rendered shader into the canvas dimensions (0 = none, 1 = contain, 2 = cover)
 * - u_scale (float): Overall zoom level of the graphics (0.01 to 4)
 * - u_rotation (float): Overall rotation angle of the graphics in degrees (0 to 360)
 * - u_offsetX (float): Horizontal offset of the graphics center (-1 to 1)
 * - u_offsetY (float): Vertical offset of the graphics center (-1 to 1)
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 *
 */

// language=GLSL
export const prismFragmentShader: string = `#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform float u_colorSteps;
uniform float u_hue;
uniform float u_shift;
uniform float u_shiftBias;

in vec2 v_imageUV;

out vec4 fragColor;

float getUvFrame(vec2 uv) {
  float aax = 2. * fwidth(uv.x);
  float aay = 2. * fwidth(uv.y);
  float left   = smoothstep(0., aax, uv.x);
  float right  = 1. - smoothstep(1. - aax, 1., uv.x);
  float bottom = smoothstep(0., aay, uv.y);
  float top    = 1. - smoothstep(1. - aay, 1., uv.y);
  return left * right * bottom * top;
}

// Each sample is taken at its own spot, so each one needs its own frame test:
// a shared mask would drag the border pixels sideways instead of fading them out.
vec4 sampleImage(vec2 uv) {
  vec4 color = texture(u_image, uv);
  color.rgb *= color.a;
  return color * getUvFrame(uv);
}

// Full saturation hue wheel, t running 0 to 1 from red back around to red.
vec3 hueColor(float t) {
  return clamp(abs(mod(t * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.);
}

float dispersionCurve(float t) {
  return pow(t, exp2(2. * u_shiftBias));
}

void main() {
  vec2 uv = v_imageUV;
  vec2 axis = vec2(.1 * u_shift, 0.);

  int count = int(u_colorSteps);
  vec3 sum = vec3(0.);
  vec3 weightSum = vec3(0.);
  float opacity = 0.;

  for (int i = 0; i < ${prismMeta.maxColorSteps}; i++) {
    if (i >= count) break;

    // Two different spacings: the colors step around the hue wheel without repeating the one they
    // started on, while their positions run the dispersion axis end to end.
    float hue = u_hue / 360. + float(i) / float(count);
    float t = float(i) / float(count - 1);

    vec4 tap = sampleImage(uv + mix(axis, -axis, dispersionCurve(t)));
    vec3 weight = 1. - hueColor(hue);

    sum += tap.rgb * weight;
    weightSum += weight;
    opacity += tap.a;
  }

  fragColor = vec4(sum / max(weightSum, 1e-4), opacity / float(count));
}
`;

export interface PrismUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorSteps: number;
  u_hue: number;
  u_shift: number;
  u_shiftBias: number;
}

export interface PrismParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorSteps?: number;
  hue?: number;
  shift?: number;
  shiftBias?: number;
}

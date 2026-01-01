import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import {
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing.js';
import {
  simplexNoise,
  declarePI,
  rotation2,
  textureRandomizerR,
  proceduralHash11,
} from '../shader-utils.js';

export const grainGradientImageMeta = {
  maxColorCount: 7,
} as const;

/**
 * Multi-color gradients with grainy, noise-textured distortion applied over an input image,
 * available in 7 animated abstract forms.
 *
 * Note: grains are calculated using gl_FragCoord & u_resolution, meaning grains don't react to scaling and fit
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_originX (float): Reference point for positioning (0 to 1)
 * - u_originY (float): Reference point for positioning (0 to 1)
 * - u_fit (float): Fit mode (0 = none, 1 = contain, 2 = cover)
 * - u_scale (float): Overall zoom level (0.01 to 4)
 * - u_rotation (float): Rotation angle in degrees (0 to 360)
 * - u_offsetX (float): Horizontal offset (-1 to 1)
 * - u_offsetY (float): Vertical offset (-1 to 1)
 * - u_image (sampler2D): Optional source image texture
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colors (vec4[]): Up to 7 gradient colors in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_softness (float): Color transition sharpness, 0 = hard edge, 1 = smooth gradient (0 to 1)
 * - u_intensity (float): Distortion between color bands (0 to 1)
 * - u_noise (float): Grainy noise overlay (0 to 1)
 * - u_shape (float): Shape type (1 = wave, 2 = dots, 3 = truchet, 4 = corners, 5 = ripple, 6 = blob, 7 = sphere)
 * - u_blend (float): Blend amount between image and gradient (0 = image only, 1 = gradient only)
 * - u_noiseTexture (sampler2D): Pre-computed randomizer source texture
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_objectUV (vec2): Object box UV coordinates with global sizing (scale, rotation, offsets, etc) applied (used for shapes 4-7)
 * - v_objectBoxSize (vec2): Size of the object bounding box in pixels
 * - v_patternUV (vec2): UV coordinates for pattern with global sizing (rotation, scale, offset, etc) applied (used for shapes 1-3)
 * - v_patternBoxSize (vec2): Size of the pattern bounding box in pixels
 * - v_imageUV (vec2): UV coordinates for sampling the source image
 *
 */

// language=GLSL
export const grainGradientImageFragmentShader: string = `#version 300 es
precision lowp float;

uniform mediump float u_time;
uniform mediump vec2 u_resolution;
uniform mediump float u_pixelRatio;

uniform sampler2D u_noiseTexture;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${ grainGradientImageMeta.maxColorCount }];
uniform float u_colorsCount;
uniform float u_softness;
uniform float u_intensity;
uniform float u_noise;
uniform float u_shape;
uniform float u_blend;

uniform mediump float u_originX;
uniform mediump float u_originY;
uniform mediump float u_worldWidth;
uniform mediump float u_worldHeight;
uniform mediump float u_fit;

uniform mediump float u_scale;
uniform mediump float u_rotation;
uniform mediump float u_offsetX;
uniform mediump float u_offsetY;

in vec2 v_objectUV;
in vec2 v_patternUV;
in vec2 v_objectBoxSize;
in vec2 v_patternBoxSize;
in vec2 v_imageUV;

out vec4 fragColor;

${ declarePI }
${ simplexNoise }
${ rotation2 }
${ textureRandomizerR }

float valueNoiseR(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}
vec4 fbmR(vec2 n0, vec2 n1, vec2 n2, vec2 n3) {
  float amplitude = 0.2;
  vec4 total = vec4(0.);
  for (int i = 0; i < 3; i++) {
    n0 = rotate(n0, 0.3);
    n1 = rotate(n1, 0.3);
    n2 = rotate(n2, 0.3);
    n3 = rotate(n3, 0.3);
    total.x += valueNoiseR(n0) * amplitude;
    total.y += valueNoiseR(n1) * amplitude;
    total.z += valueNoiseR(n2) * amplitude;
    total.z += valueNoiseR(n3) * amplitude;
    n0 *= 1.99;
    n1 *= 1.99;
    n2 *= 1.99;
    n3 *= 1.99;
    amplitude *= 0.6;
  }
  return total;
}

${ proceduralHash11 }

vec2 truchet(vec2 uv, float idx){
  idx = fract(((idx - .5) * 2.));
  if (idx > 0.75) {
    uv = vec2(1.0) - uv;
  } else if (idx > 0.5) {
    uv = vec2(1.0 - uv.x, uv.y);
  } else if (idx > 0.25) {
    uv = 1.0 - vec2(1.0 - uv.x, uv.y);
  }
  return uv;
}

float getUvFrame(vec2 uv) {
  float aax = 2. * fwidth(uv.x);
  float aay = 2. * fwidth(uv.y);

  float left   = smoothstep(0., aax, uv.x);
  float right = 1.0 - smoothstep(1. - aax, 1., uv.x);
  float bottom = smoothstep(0., aay, uv.y);
  float top = 1.0 - smoothstep(1. - aay, 1., uv.y);

  return left * right * bottom * top;
}

void main() {

  vec2 imageUV = v_imageUV;
  vec2 grain_uv = 1000. * u_blend * v_imageUV;

  float baseNoise = snoise(grain_uv * .5 - .1 * u_time);
  vec4 fbmVals = fbmR(
    .002 * grain_uv + 10.,
    .003 * grain_uv,
    .001 * grain_uv,
    rotate(.4 * grain_uv, 2.)
  );
  float grainDist = baseNoise * snoise(grain_uv * .2 + .1 * u_time) - fbmVals.x - fbmVals.y;
  float rawNoise = .75 * baseNoise - fbmVals.w - fbmVals.z;

  float angle = rawNoise * TWO_PI;
  vec2 dir = vec2(cos(angle), sin(angle));
  imageUV += u_intensity * 0.15 * grainDist * dir;

  float frame = getUvFrame(imageUV);
  vec4 imageColor = texture(u_image, imageUV);

  float lum = dot(imageColor.rgb, vec3(0.299, 0.587, 0.114));
  float grainStrength = (lum - .5);

  vec3 color = imageColor.rgb;
  color += 2. * u_noise * grainStrength * rawNoise;
  color *= frame;

  float opacity = imageColor.a * frame;

  fragColor = vec4(color, opacity);
}
`;

export interface GrainGradientImageUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_softness: number;
  u_intensity: number;
  u_noise: number;
  u_shape: (typeof GrainGradientImageShapes)[GrainGradientImageShape];
  u_blend: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface GrainGradientImageParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorBack?: string;
  colors?: string[];
  softness?: number;
  intensity?: number;
  noise?: number;
  shape?: GrainGradientImageShape;
  blend?: number;
}

export const GrainGradientImageShapes = {
  wave: 1,
  dots: 2,
  truchet: 3,
  corners: 4,
  ripple: 5,
  blob: 6,
  sphere: 7,
};

export type GrainGradientImageShape = keyof typeof GrainGradientImageShapes;

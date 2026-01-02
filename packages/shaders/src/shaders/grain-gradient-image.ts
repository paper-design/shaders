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
} from '../shader-utils.js';


/**
 * Grainy, noise-textured distortion effect applied over an input image.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_image (sampler2D): Source image texture
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_intensity (float): Distortion intensity (0 to 1)
 * - u_grainSize (float): Controls grain size
 * - u_noiseTexture (sampler2D): Pre-computed randomizer source texture
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_imageUV (vec2): UV coordinates for sampling the source image
 *
 */

// language=GLSL
export const grainGradientImageFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;
uniform float u_imageAspectRatio;

uniform sampler2D u_noiseTexture;
uniform sampler2D u_image;

uniform float u_intensity;
uniform float u_grainSize;

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
vec2 fbmR(vec2 n0, vec2 n1) {
  float amplitude = 0.2;
  vec2 total = vec2(0.);
  for (int i = 0; i < 3; i++) {
    n0 = rotate(n0, 0.3);
    n1 = rotate(n1, 0.3);
    total.x += valueNoiseR(n0) * amplitude;
    total.y += valueNoiseR(n1) * amplitude;
    n0 *= 1.99;
    n1 *= 1.99;
    amplitude *= 0.6;
  }
  return total;
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
  vec2 grainSize = mix(2000., 200., u_grainSize) * vec2(1., 1. / u_imageAspectRatio);
  vec2 grainUV = v_imageUV - .5;
  grainUV *= grainSize;
  grainUV += .5;

  float baseNoise = snoise(grainUV * .5 - .1 * u_time);
  vec2 fbmVals = fbmR(
    .002 * grainUV + 10.,
    .003 * grainUV
  );
  float grainDist = baseNoise * snoise(grainUV * .2 + .1 * u_time) - fbmVals.x - fbmVals.y;

  float angle = baseNoise * TWO_PI;
  vec2 dir = vec2(cos(angle), sin(angle));
  imageUV += u_intensity * 0.1 * grainDist * dir;

  float frame = getUvFrame(imageUV);
  vec4 imageColor = texture(u_image, imageUV);
  vec3 color = imageColor.rgb;

  float opacity = imageColor.a * frame;

  fragColor = vec4(color, opacity);
}
`;

export interface GrainGradientImageUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_intensity: number;
  u_grainSize: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface GrainGradientImageParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  intensity?: number;
  grainSize?: number;
}


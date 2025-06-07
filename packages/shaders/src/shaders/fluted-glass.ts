import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, declareRotate, declareRandom } from '../shader-utils.js';

/**
 */
export const flutedGlassFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform sampler2D u_image;
uniform float u_image_aspect_ratio;

uniform float u_grid;
uniform float u_curve;
uniform float u_curveFreq;
uniform float u_gridRotation;
uniform float u_distortion;
uniform float u_distortionType;
uniform float u_skew;
uniform float u_shift;
uniform float u_blur;
uniform float u_frost;
uniform float u_marginLeft;
uniform float u_marginRight;
uniform float u_marginTop;
uniform float u_marginBottom;
uniform float u_gridLinesBrightness;
uniform float u_gridLines;

${sizingVariablesDeclaration}
${declarePI}
${declareRotate}
${declareRandom}

out vec4 fragColor;

vec2 random2(vec2 p) {
  return vec2(random(p), random(200. * p));
}

float uvFrame(vec2 uv) {
  return step(1e-3, uv.x) * step(uv.x, 1. - 1e-3) * step(1e-3, uv.y) * step(uv.y, 1. - 1e-3);
}

float hash(float x) {
  return fract(sin(x) * 43758.5453123);
}

const int MAX_RADIUS = 25;

vec4 getBlur(sampler2D tex, vec2 uv, vec2 texelSize, vec2 dir, float sigma) {
  if (sigma <= .5) return texture(tex, uv);
  int radius = int(min(float(MAX_RADIUS), ceil(3.0 * sigma)));

  float twoSigma2 = 2.0 * sigma * sigma;
  float gaussianNorm = 1.0 / sqrt(TWO_PI * sigma * sigma);

  vec4 sum = texture(tex, uv) * gaussianNorm;
  float weightSum = gaussianNorm;

  for (int i = 1; i <= MAX_RADIUS; i++) {
    if (i > radius) break;

    float x = float(i);
    float w = exp(-(x * x) / twoSigma2) * gaussianNorm;

    vec2 offset = dir * texelSize * x;
    vec4 s1 = texture(tex, uv + offset);
    vec4 s2 = texture(tex, uv - offset);

    sum += (s1 + s2) * w;
    weightSum += 2.0 * w;
  }

  return sum / weightSum;
}

void main() {
  vec2 patternUV = v_patternUV;

  vec2 imageUV = v_responsiveUV + .5;
  float screenRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  float imageRatio = u_image_aspect_ratio;

  imageUV.y = 1. - imageUV.y;

  imageUV -= .5;
  if (screenRatio > imageRatio) {
    imageUV.x *= (screenRatio / imageRatio);
  } else {
    imageUV.y *= (imageRatio / screenRatio);
  }
  imageUV += .5;

  vec2 uv = imageUV;
  float frame = uvFrame(imageUV);
  if (frame < .05) discard;

  float gridNumber = u_grid * u_image_aspect_ratio;

  float mask =
    step(u_marginLeft, imageUV.x) * step(u_marginRight, 1. - imageUV.x)
    * step(u_marginTop, imageUV.y) * step(u_marginBottom, 1. - imageUV.y);

  float patternRotation = u_gridRotation * PI / 180.;
  uv = rotate(uv - vec2(.5), patternRotation);
  uv *= gridNumber;

  float curveX = 15. * u_curveFreq * uv.y / gridNumber;

  float wave = sin(curveX);
  float zigzag = abs(fract(curveX) - .5);

  float curve = mix(wave, zigzag, clamp(u_curve, 1., 2.) - 1.);
  curve *= (clamp(u_curve, 0., 1.) * .2 * gridNumber / u_image_aspect_ratio);

  vec2 uvOrig = uv;
  uv += curve;

  vec2 fractUV = fract(uv);
  vec2 floorUV = floor(uv);

  vec2 fractOrigUV = fract(uvOrig);
  vec2 floorOrigUV = floor(uvOrig);

  float gridLines = pow(fractUV.x, 14.);
  gridLines *= mask;

  float xDistortion = 0.;
  if (u_distortionType == 1.) {
    xDistortion = -pow(1.5 * fractUV.x, 3.) + (.5 + u_shift);
  } else if (u_distortionType == 2.) {
    xDistortion = pow(fractUV.x, 2.) - (.5 + u_shift);
  } else if (u_distortionType == 3.) {
    xDistortion = pow(2. * (fractUV.x - .5), 10.) + .5 - .5 + u_shift;
  } else if (u_distortionType == 4.) {
    xDistortion = sin((fractUV.x + .25 + u_shift) * TWO_PI);
  } else if (u_distortionType == 5.) {
    xDistortion += (.5 + u_shift);
    xDistortion -= pow(abs(fractUV.x), .2) * fractUV.x;
  }

  xDistortion *= u_distortion;

  uv = (floorOrigUV + fractOrigUV) / gridNumber;
  uv.x += xDistortion / gridNumber;

  uv.y += 1.5 * u_skew * xDistortion / gridNumber;

  uv = rotate(uv, -patternRotation) + vec2(.5);

  uv = mix(imageUV, uv, mask);
  float blur = mix(0., u_blur, mask);

  uv += mask * (random2(uv).xy - .5) * .015 * u_frost;

  vec4 color = getBlur(u_image, uv, 1. / u_resolution, vec2(0., 1.), blur);

  vec3 midColor = texture(u_image, vec2(floorUV.x / gridNumber - .5, .4 + .2 * hash(floorUV.x))).rgb;
  vec3 highlight = mix(midColor, vec3(1.), u_gridLinesBrightness);
  color.rgb = mix(color.rgb, highlight, u_gridLines * gridLines);

  float opacity = color.a;
  fragColor = vec4(color.rgb, opacity);
}

`;

export interface FlutedGlassUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | null;
  u_grid: number;
  u_curve: number;
  u_curveFreq: number;
  u_gridRotation: number;
  u_distortion: number;
  u_skew: number;
  u_shift: number;
  u_blur: number;
  u_frost: number;
  u_marginLeft: number;
  u_marginRight: number;
  u_marginTop: number;
  u_marginBottom: number;
  u_gridLines: number;
  u_gridLinesBrightness: number;
  u_distortionType: (typeof GlassDistortionTypes)[GlassDistortion];
}

export interface FlutedGlassParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string | null;
  grid?: number;
  curve?: number;
  curveFreq?: number;
  gridRotation?: number;
  distortion?: number;
  skew?: number;
  shift?: number;
  blur?: number;
  frost?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  gridLines?: number;
  gridLinesBrightness?: number;
  distortionType?: GlassDistortion;
}

export const GlassDistortionTypes = {
  'type #1': 1,
  'type #2': 2,
  'type #3': 3,
  'type #4': 4,
  'type #5': 5,
} as const;

export type GlassDistortion = keyof typeof GlassDistortionTypes;

import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declareImageUV, declarePI, declareRotate, declareRandom } from '../shader-utils.js';

/**
 */

// language=GLSL
export const flutedGlassFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_grid;
uniform float u_gridRotation;
uniform float u_distortion;
uniform float u_distortionShape;
uniform float u_shift;
uniform float u_blur;
uniform float u_frost;
uniform float u_marginLeft;
uniform float u_marginRight;
uniform float u_marginTop;
uniform float u_marginBottom;
uniform float u_gridLines;
uniform float u_gridShape;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareRotate}
${declareRandom}
${declareImageUV}


vec2 random2(vec2 p) {
  return vec2(random(p), random(200. * p));
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
  vec2 imageUV = v_imageUV;
  vec2 patternUV = 100. * v_patternUV;
  
  vec2 uv = imageUV;
  float frame = getUvFrame(imageUV);
  if (frame < .05) discard;

  float gridNumber = u_grid * u_imageAspectRatio;

  float mask =
    step(u_marginLeft, imageUV.x) * step(u_marginRight, 1. - imageUV.x)
    * step(u_marginTop, imageUV.y) * step(u_marginBottom, 1. - imageUV.y);

  float patternRotation = u_gridRotation * PI / 180.;
  uv = rotate(uv - vec2(.5), patternRotation);
  uv *= gridNumber;
  
  float curve = 0.;
  if (u_gridShape > 4.5) {
    // pattern
    curve = .5 + .5 * sin(1.5 * uv.x) * cos(1.5 * uv.y);
  } else if (u_gridShape > 3.5) {
    // zigzag
    curve = 10. * abs(fract(.1 * uv.y) - .5);
  } else if (u_gridShape > 2.5) {
    // wave
    curve = 4. * sin(.23 * uv.y);
  } else if (u_gridShape > 1.5) {
    // lines irregular
    curve = .5 + .5 * sin(.5 * uv.x) * sin(1.7 * uv.x);
  } else {
    // lines
    curve = .2 * gridNumber / u_imageAspectRatio;
  }

  vec2 uvOrig = uv;
  uv += curve;

  vec2 fractUV = fract(uv);
  vec2 floorUV = floor(uv);

  vec2 fractOrigUV = fract(uvOrig);
  vec2 floorOrigUV = floor(uvOrig);

  float gridLines = pow(fractUV.x, 10.);
  gridLines *= mask;

  float xDistortion = 0.;
  if (u_distortionShape == 1.) {
    xDistortion = -pow(1.5 * fractUV.x, 3.) + (.5 + u_shift);
  } else if (u_distortionShape == 2.) {
    xDistortion = 2. * pow(fractUV.x, 2.) - (.5 + u_shift);
  } else if (u_distortionShape == 3.) {
    xDistortion = pow(2. * (fractUV.x - .5), 6.) + .5 - .5 + u_shift;
  } else if (u_distortionShape == 4.) {
    xDistortion = sin((fractUV.x + .25 + u_shift) * TWO_PI);
  } else if (u_distortionShape == 5.) {
    xDistortion += (.5 + u_shift);
    xDistortion -= pow(abs(fractUV.x), .2) * fractUV.x;
    xDistortion *= .33;
  }

  xDistortion *= 3. * u_distortion;

  uv = (floorOrigUV + fractOrigUV) / gridNumber;
  uv.x += xDistortion / gridNumber;
  
  uv = rotate(uv, -patternRotation) + vec2(.5);

  uv = mix(imageUV, uv, mask);
  float blur = mix(0., u_blur, mask);

  uv += mask * (random2(uv).xy - .5) * .03 * u_frost;

  vec4 color = getBlur(u_image, uv, 1. / u_resolution, vec2(0., 1.), blur);

  vec3 midColor = texture(u_image, vec2(floorUV.x / gridNumber - .5, .4 + .7 * hash(floorUV.x))).rgb;
  color.rgb = mix(color.rgb, midColor, u_gridLines * gridLines);

  float opacity = color.a;
  fragColor = vec4(color.rgb, opacity);
}
`;

export interface FlutedGlassUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | null;
  u_grid: number;
  u_gridRotation: number;
  u_distortion: number;
  u_shift: number;
  u_blur: number;
  u_frost: number;
  u_marginLeft: number;
  u_marginRight: number;
  u_marginTop: number;
  u_marginBottom: number;
  u_gridLines: number;
  u_distortionShape: (typeof GlassDistortionShapes)[GlassDistortionShape];
  u_gridShape: (typeof GlassGridShapes)[GlassGridShape];
}

export interface FlutedGlassParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string | null;
  grid?: number;
  gridRotation?: number;
  distortion?: number;
  shift?: number;
  blur?: number;
  frost?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  gridLines?: number;
  distortionShape?: GlassDistortionShape;
  gridShape?: GlassGridShape;
}

export const GlassGridShapes = {
  lines: 1,
  linesIrregular: 2,
  wave: 3,
  zigzag: 4,
  pattern: 5,
} as const;

export const GlassDistortionShapes = {
  'type #1': 1,
  'type #2': 2,
  'type #3': 3,
  'type #4': 4,
  'type #5': 5,
} as const;

export type GlassDistortionShape = keyof typeof GlassDistortionShapes;
export type GlassGridShape = keyof typeof GlassGridShapes;

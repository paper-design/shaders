import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2 } from '../shader-utils.js';

/**
 * Mimicking glass surface distortion over the image by distorting the texture
 * coordinates within line patterns
 *
 * Uniforms:
 * - u_size, u_angle - size and direction of grid relative to the image
 * - u_shape (float used as integer):
 * ---- 1: uniformly spaced stripes
 * ---- 2: randomly spaced stripes
 * ---- 3: sine wave stripes
 * ---- 4: zigzag stripes
 * ---- 5: wave-based pattern
 * - u_distortion - the power of distortion applied along within each stripe
 * - u_distortionShape (float used as integer):
 * ---- 5 shapes available
 * - u_shift - texture shift in direction opposite to the grid
 * - u_blur - one-directional blur applied over the main distortion
 * - u_edges - thin color lines along the grid (independent from distortion)
 * - u_marginLeft, u_marginRight, u_marginTop, u_marginBottom - paddings
 *   within picture to be shown without any distortion
 *
 */

// language=GLSL
export const flutedGlassFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_size;
uniform float u_angle;
uniform float u_edges;
uniform float u_shape;
uniform float u_distortion;
uniform float u_distortionShape;
uniform float u_shift;
uniform float u_blur;
uniform float u_marginLeft;
uniform float u_marginRight;
uniform float u_marginTop;
uniform float u_marginBottom;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${rotation2}

float getUvFrame(vec2 uv) {
  float aax = 2. * fwidth(uv.x);
  float aay = 2. * fwidth(uv.y);

  float left   = smoothstep(0., aax, uv.x);
  float right  = smoothstep(1., 1. - aax, uv.x);
  float bottom = smoothstep(0., aay, uv.y);
  float top    = smoothstep(1., 1. - aay, uv.y);

  return left * right * bottom * top;
}

const int MAX_RADIUS = 50;

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
  
  vec2 uv = imageUV;
  float frame = getUvFrame(imageUV);
  if (frame < .05) discard;

  float effectSize = (.01 + 5. / u_size);

  vec2 sw = vec2(.005 * u_distortion) * vec2(1., u_imageAspectRatio);
  float maskOuter =
    smoothstep(u_marginLeft - sw.x, u_marginLeft, imageUV.x + sw.x) *
    smoothstep(u_marginRight - sw.x, u_marginRight, 1.0 - imageUV.x + sw.x) *
    smoothstep(u_marginTop - sw.y, u_marginTop, imageUV.y + sw.y) *
    smoothstep(u_marginBottom - sw.y, u_marginBottom, 1.0 - imageUV.y + sw.y);
  float mask =
    smoothstep(u_marginLeft, u_marginLeft + sw.x, imageUV.x + sw.x) *
    smoothstep(u_marginRight, u_marginRight + sw.x, 1.0 - imageUV.x + sw.x) *
    smoothstep(u_marginTop, u_marginTop + sw.y, imageUV.y + sw.y) *
    smoothstep(u_marginBottom, u_marginBottom + sw.y, 1.0 - imageUV.y + sw.y);
  float stroke = (1. - mask) * maskOuter;

  float patternRotation = u_angle * PI / 180.;
  uv = rotate(uv - vec2(.5), patternRotation);
  uv *= effectSize;
  
  float curve = 0.;
  if (u_shape > 4.5) {
    // pattern
    curve = .5 + .5 * sin(1.5 * uv.x) * cos(1.5 * uv.y);
  } else if (u_shape > 3.5) {
    // zigzag
    curve = 10. * abs(fract(.1 * uv.y) - .5);
  } else if (u_shape > 2.5) {
    // wave
    curve = 4. * sin(.23 * uv.y);
  } else if (u_shape > 1.5) {
    // lines irregular
    curve = .5 + .5 * sin(.5 * uv.x) * sin(1.7 * uv.x);
  } else {
    // lines
    curve = .2 * effectSize / u_imageAspectRatio;
  }

  vec2 uvOrig = uv;
  uv += curve;

  vec2 fractUV = fract(uv);
  vec2 floorUV = floor(uv);

  vec2 fractOrigUV = fract(uvOrig);
  vec2 floorOrigUV = floor(uvOrig);

  float edges = smoothstep(.85, .95, fractUV.x);
  edges *= mask;

  float xDistortion = 0.;
  if (u_distortionShape == 1.) {
    xDistortion = -pow(1.5 * fractUV.x, 3.) + (.5 + u_shift);
  } else if (u_distortionShape == 2.) {
    xDistortion = 2. * pow(fractUV.x, 2.) - (.5 + u_shift);
  } else if (u_distortionShape == 3.) {
    xDistortion = pow(2. * (fractUV.x - .5), 6.) + .5 - .5 + u_shift;
  } else if (u_distortionShape == 4.) {
    xDistortion = sin((fractUV.x + .25 + u_shift) * TWO_PI);
    xDistortion *= .5;
  } else if (u_distortionShape == 5.) {
    xDistortion += (.5 + u_shift);
    xDistortion -= pow(abs(fractUV.x), .2) * fractUV.x;
    xDistortion *= .33;
  }

  xDistortion *= 3. * u_distortion;

  uv = (floorOrigUV + fractOrigUV) / effectSize;
  uv.x += xDistortion / effectSize;
  uv += pow(stroke, 4.);
  uv.y = mix(uv.y, .0, .4 * u_edges * edges);
  
  uv = rotate(uv, -patternRotation) + vec2(.5);

  uv = mix(imageUV, uv, mask);
  float blur = mix(0., u_blur, mask);
  
  vec4 color = getBlur(u_image, uv, 1. / u_resolution / u_pixelRatio, vec2(0., 1.), blur);

  float opacity = color.a;
  fragColor = vec4(color.rgb, opacity);
}
`;

export interface FlutedGlassUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_size: number;
  u_angle: number;
  u_distortion: number;
  u_shift: number;
  u_blur: number;
  u_marginLeft: number;
  u_marginRight: number;
  u_marginTop: number;
  u_marginBottom: number;
  u_edges: number;
  u_distortionShape: (typeof GlassDistortionShapes)[GlassDistortionShape];
  u_shape: (typeof GlassGridShapes)[GlassGridShape];
  u_noiseTexture?: HTMLImageElement;
}

export interface FlutedGlassParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string | undefined;
  size?: number;
  angle?: number;
  distortion?: number;
  shift?: number;
  blur?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  edges?: number;
  distortionShape?: GlassDistortionShape;
  shape?: GlassGridShape;
}

export const GlassGridShapes = {
  lines: 1,
  linesIrregular: 2,
  wave: 3,
  zigzag: 4,
  pattern: 5,
} as const;

export const GlassDistortionShapes = {
  prism: 1,
  lens: 2,
  contour: 3,
  cascade: 4,
  facete: 5,
} as const;

export type GlassDistortionShape = keyof typeof GlassDistortionShapes;
export type GlassGridShape = keyof typeof GlassGridShapes;

import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingUniformsDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
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
${sizingUniformsDeclaration}

uniform vec4 u_colorBack;
uniform vec4 u_colorHighlight;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_size;
uniform float u_highlights;
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

out vec4 fragColor;

${declarePI}
${rotation2}


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

float getUvFrame(vec2 uv, float test) {
  float aax = max(2. * fwidth(uv.x), test);
  float aay = max(2. * fwidth(uv.y), test);

  float left   = smoothstep(0., aax, uv.x);
  float right  = 1. - smoothstep(1. - aax, 1., uv.x);
  float bottom = smoothstep(0., aay, uv.y);
  float top    = 1. - smoothstep(1. - aay, 1., uv.y);


  return left * right * bottom * top;
}

const int MAX_RADIUS = 50;

vec4 sampleScene(vec2 uv, float test) {
  float frame = getUvFrame(uv, test);
  vec4 img = texture(u_image, uv);
  vec3 imgPM  = img.rgb * img.a;
  vec3 backPM = u_colorBack.rgb * u_colorBack.a;
  float aImgFr = img.a * frame;
  vec3 compRGB = imgPM * frame + backPM * (1. - aImgFr);
  float compA  = aImgFr + u_colorBack.a * (1. - aImgFr);

  return vec4(compRGB, compA);
}

vec4 getBlurScene(vec2 uv, vec2 texelSize, vec2 dir, float sigma, float test) {
  if (sigma <= .5) return sampleScene(uv, test);

  int radius = int(min(float(MAX_RADIUS), ceil(3.0 * sigma)));
  float twoSigma2 = 2.0 * sigma * sigma;
  float gaussianNorm = 1.0 / sqrt(TWO_PI * sigma * sigma);

  vec4 sum = sampleScene(uv, test) * gaussianNorm;
  float weightSum = gaussianNorm;

  for (int i = 1; i <= MAX_RADIUS; i++) {
    if (i > radius) break;

    float x = float(i);
    float w = exp(-(x * x) / twoSigma2) * gaussianNorm;

    vec2 offset = dir * texelSize * x;
    vec4 s1 = sampleScene(uv + offset, test);
    vec4 s2 = sampleScene(uv - offset, test);

    sum += (s1 + s2) * w;
    weightSum += 2.0 * w;
  }
  return sum / weightSum;
}

vec2 rotateAspect(vec2 p, float a, float aspect) {
  p.x *= aspect;
  p = rotate(p, a);
  p.x /= aspect;
  return p;
}

float smoothFract(float x) {
  float f = fract(x);
  float w = fwidth(x);

  float edge = abs(f - 0.5) - 0.5;
  float band = smoothstep(-w, w, edge);

  return mix(f, 1.0 - f, band);
}

void main() {
  
  vec2 uvNormalised = (gl_FragCoord.xy - .5 * u_resolution) / u_resolution.xy;
  vec2 imageUV = getImageUV(uvNormalised, vec2(1.));
  vec2 uvMask = gl_FragCoord.xy / u_resolution.xy;

  vec2 uv = imageUV;

  float effectSize = 1. / pow(.7 * (u_size + .5), 6.);

  vec2 sw = vec2(.005 * u_distortion);
  vec4 margins = .5 * vec4(u_marginLeft, u_marginTop, u_marginRight, u_marginBottom);
  float maskOuter =
    smoothstep(margins[0] - sw.x, margins[0], uvMask.x + sw.x) *
    smoothstep(margins[2] - sw.x, margins[2], 1.0 - uvMask.x + sw.x) *
    smoothstep(margins[1] - sw.y, margins[1], uvMask.y + sw.y) *
    smoothstep(margins[3] - sw.y, margins[3], 1.0 - uvMask.y + sw.y);
  float mask =
    smoothstep(margins[0], margins[0] + sw.x, uvMask.x + sw.x) *
    smoothstep(margins[2], margins[2] + sw.x, 1.0 - uvMask.x + sw.x) *
    smoothstep(margins[1], margins[1] + sw.y, uvMask.y + sw.y) *
    smoothstep(margins[3], margins[3] + sw.y, 1.0 - uvMask.y + sw.y);
  float maskStroke = (1. - mask) * maskOuter;

  float patternRotation = -u_angle * PI / 180.;
  uv = rotateAspect(uv - vec2(.5), patternRotation, u_imageAspectRatio);
  uv *= effectSize;

  float curve = 0.;
  float patternY = uv.y / u_imageAspectRatio;
  if (u_shape > 4.5) {
    // pattern
    curve = .5 + .5 * sin(1.5 * uv.x) * cos(1.5 * patternY);
  } else if (u_shape > 3.5) {
    // zigzag
    curve = 10. * abs(fract(.1 * patternY) - .5);
  } else if (u_shape > 2.5) {
    // wave
    curve = 4. * sin(.23 * patternY);
  } else if (u_shape > 1.5) {
    // lines irregular
    curve = .5 + .5 * sin(.5 * uv.x) * sin(1.7 * uv.x);
  } else {
    // lines
  }
  
  vec2 UvToFract = uv + curve;
  vec2 fractOrigUV = fract(uv);
  vec2 floorOrigUV = floor(uv);

  float x = smoothFract(UvToFract.x);
  float xNonSmooth = fract(UvToFract.x);

  float highlight = x;
  float xDistortion = 0.;
  float fadeX = 1.;
  float frameFade = 0.;

  if (u_distortionShape == 1.) {
    xDistortion = -pow(1.5 * x, 3.);
    xDistortion += (.5 - u_shift);

    frameFade = pow(1.5 * x, 3.);
    highlight = 1. - pow(x, .5);

    float aa = .2;
    fadeX = smoothstep(0., aa, xNonSmooth) * smoothstep(1., 1. - aa, xNonSmooth);
    xDistortion = mix(1., xDistortion, fadeX);

  } else if (u_distortionShape == 2.) {
    xDistortion = 2. * pow(x, 2.);
    xDistortion -= (.5 + u_shift);

    frameFade = pow(abs(x - .5), 4.);
    highlight = 2.4 * pow(abs(x - .4), 2.);

    float aa = .15;
    fadeX = smoothstep(0., aa, xNonSmooth) * smoothstep(1., 1. - aa, xNonSmooth);
    xDistortion = mix(1., xDistortion, fadeX);
    frameFade = mix(1., frameFade, fadeX);
  } else if (u_distortionShape == 3.) {
    xDistortion = pow(2. * (x - .5), 6.);
    highlight = clamp(xDistortion, 0., 1.);
    xDistortion -= .25;
    xDistortion -= u_shift;

    frameFade = 1. - 2. * pow(abs(x - .4), 2.);
    highlight = x * x * x;

    float aa = .1;
    fadeX = smoothstep(0., aa, xNonSmooth) * smoothstep(1., 1. - aa, xNonSmooth);
    xDistortion = mix(1., xDistortion, fadeX);
    frameFade = mix(1., frameFade, fadeX);

  } else if (u_distortionShape == 4.) {
    x = xNonSmooth;
    xDistortion = sin((x + .25) * TWO_PI);
    highlight = pow(.5 + .5 * xDistortion, 2.);
    xDistortion *= .5;
    xDistortion -= u_shift;
    frameFade = .5 + .5 * sin(x * TWO_PI);
  } else if (u_distortionShape == 5.) {
    xDistortion -= pow(abs(x), .2) * x;
    highlight = 1.5 * pow(pow(abs(x), 3.), 2.);
    xDistortion += .33;
    xDistortion -= 3. * u_shift;
    xDistortion *= .33;

    frameFade = .3 * (smoothstep(.0, 1., x));

    float aa = .05;
    fadeX = smoothstep(0., aa, xNonSmooth) * smoothstep(1., 1. - aa, xNonSmooth);
    xDistortion *= fadeX;
  }

  highlight *= mask;
  highlight += .5 * maskStroke;
  highlight = min(highlight, 1.);

  xDistortion *= 3. * u_distortion;
  frameFade *= u_distortion;

  fractOrigUV.x += xDistortion;
  uv = (floorOrigUV + fractOrigUV) / effectSize;
  uv += pow(maskStroke, 4.);


//  float edges = smoothstep(.8, .9, x) * smoothstep(1., .9, x);
//  //  edges = fadeX;
//  //  edges *= mask;
//  uv.y = mix(uv.y, .0, u_edges * edges);

  uv = rotateAspect(uv, -patternRotation, u_imageAspectRatio) + vec2(.5);

  uv = mix(imageUV, uv, mask);
  float blur = mix(0., u_blur, mask);

  vec2 texelSize = 1. / (u_resolution * u_pixelRatio);
  vec4 scenePM = getBlurScene(uv, texelSize, vec2(0., 1.), blur, .1 * frameFade);
  
  vec3 color = scenePM.rgb;
  float opacity = scenePM.a;
  
  highlight *= u_highlights;
  highlight *= u_colorHighlight.a;
  color = mix(color, u_colorHighlight.rgb, .5 * highlight);
  color += .5 * pow(highlight, .5) * u_colorHighlight.rgb;

  opacity += highlight;

  opacity = clamp(opacity, 0., 1.);

  fragColor = vec4(color, opacity);
}
`;

export interface FlutedGlassUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string;
  u_colorBack: [number, number, number, number];
  u_colorHighlight: [number, number, number, number];
  u_highlights: number;
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
  image: HTMLImageElement | string;
  colorBack?: string;
  colorHighlight?: string;
  highlights?: number;
  size?: number;
  angle?: number;
  distortion?: number;
  shift?: number;
  blur?: number;
  margin?: number;
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

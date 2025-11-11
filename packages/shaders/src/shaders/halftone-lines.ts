import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2, simplexNoise, proceduralHash21 } from '../shader-utils.js';

/**
 *
 * Fluid motion imitation applied over user image
 * (animated stripe pattern getting distorted with shape edges)
 *
 * Uniforms:
 * - u_colorBack, u_colorFront (RGBA)
 *
 */

// language=GLSL
export const halftoneLinesFragmentShader: string = `#version 300 es
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

uniform float u_time;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_radius;
uniform float u_contrast;

uniform sampler2D u_image;
uniform mediump float u_imageAspectRatio;

uniform float u_size;
uniform float u_grainMixer;
uniform float u_grainOverlay;
uniform bool u_straight;
uniform bool u_originalColors;
uniform bool u_inverted;
uniform float u_type;

uniform float u_softness;
uniform float u_stripeWidth;
uniform bool u_alphaMask;
uniform float u_wave;
uniform float u_noise;
uniform float u_angle;


${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${rotation2}
${simplexNoise}
${proceduralHash21}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
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

float doubleSNoise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));
  return noise;
}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.x);
  return frame;
}

float blurEdge5x5(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample)
{
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = max(radius, 0.0) * texel;

  // 1D Gaussian coefficients (Pascal row)
  const float a = 1.0;// |offset| = 2
  const float b = 4.0;// |offset| = 1
  const float c = 6.0;// |offset| = 0

  float norm = 256.0;// (a+b+c+b+a)^2 = 16^2
  float sum  = 0.0;

  // y = -2
  {
    float wy = a;
    float row =
    a * texture(tex, uv + vec2(-2.0*r.x, -2.0*r.y)).r +
    b * texture(tex, uv + vec2(-1.0*r.x, -2.0*r.y)).r +
    c * texture(tex, uv + vec2(0.0, -2.0*r.y)).r +
    b * texture(tex, uv + vec2(1.0*r.x, -2.0*r.y)).r +
    a * texture(tex, uv + vec2(2.0*r.x, -2.0*r.y)).r;
    sum += wy * row;
  }

  // y = -1
  {
    float wy = b;
    float row =
    a * texture(tex, uv + vec2(-2.0*r.x, -1.0*r.y)).r +
    b * texture(tex, uv + vec2(-1.0*r.x, -1.0*r.y)).r +
    c * texture(tex, uv + vec2(0.0, -1.0*r.y)).r +
    b * texture(tex, uv + vec2(1.0*r.x, -1.0*r.y)).r +
    a * texture(tex, uv + vec2(2.0*r.x, -1.0*r.y)).r;
    sum += wy * row;
  }

  // y = 0 (use provided centerSample to avoid an extra fetch)
  {
    float wy = c;
    float row =
    a * texture(tex, uv + vec2(-2.0*r.x, 0.0)).r +
    b * texture(tex, uv + vec2(-1.0*r.x, 0.0)).r +
    c * centerSample +
    b * texture(tex, uv + vec2(1.0*r.x, 0.0)).r +
    a * texture(tex, uv + vec2(2.0*r.x, 0.0)).r;
    sum += wy * row;
  }

  // y = +1
  {
    float wy = b;
    float row =
    a * texture(tex, uv + vec2(-2.0*r.x, 1.0*r.y)).r +
    b * texture(tex, uv + vec2(-1.0*r.x, 1.0*r.y)).r +
    c * texture(tex, uv + vec2(0.0, 1.0*r.y)).r +
    b * texture(tex, uv + vec2(1.0*r.x, 1.0*r.y)).r +
    a * texture(tex, uv + vec2(2.0*r.x, 1.0*r.y)).r;
    sum += wy * row;
  }

  // y = +2
  {
    float wy = a;
    float row =
    a * texture(tex, uv + vec2(-2.0*r.x, 2.0*r.y)).r +
    b * texture(tex, uv + vec2(-1.0*r.x, 2.0*r.y)).r +
    c * texture(tex, uv + vec2(0.0, 2.0*r.y)).r +
    b * texture(tex, uv + vec2(1.0*r.x, 2.0*r.y)).r +
    a * texture(tex, uv + vec2(2.0*r.x, 2.0*r.y)).r;
    sum += wy * row;
  }

  return sum / norm;
}

float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = radius * texel;

  float w1 = 1.0, w2 = 2.0, w4 = 4.0;
  float norm = 16.0;
  float sum = w4 * centerSample;

  sum += w2 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;

  sum += w1 * textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;

  return sum / norm;
}

float blurEdge3x3_G(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = radius * texel;

  float w1 = 1.0, w2 = 2.0, w4 = 4.0;
  float norm = 16.0;
  float sum = w4 * centerSample;

  sum += w2 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).g;
  sum += w2 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).g;
  sum += w2 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).g;
  sum += w2 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).g;

  sum += w1 * textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).g;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).g;
  sum += w1 * textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).g;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).g;

  return sum / norm;
}

vec3 hsv2rgb(vec3 c){
  vec3 p = abs(fract(c.x + vec3(0., 2./3., 1./3.))*6.-3.);
  return c.z * mix(vec3(1.), clamp(p-1., 0., 1.), c.y);
}

float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

float sigmoid(float x, float k) {
  return 1.0 / (1.0 + exp(-k * (x - 0.5)));
}

float getLumAtPx(vec2 uv, float contrast) {
  vec4 tex = texture(u_image, uv);
  vec3 color = vec3(
  sigmoid(tex.r, contrast),
  sigmoid(tex.g, contrast),
  sigmoid(tex.b, contrast)
  );
  float lum = dot(vec3(0.2126, 0.7152, 0.0722), color);
  lum = mix(1., lum, tex.a);
  lum = u_inverted ? (1. - lum) : lum;
  return lum;
}

float blendOverlay(float base, float blend) {
  return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
  return vec3(blendOverlay(base.r, blend.r), blendOverlay(base.g, blend.g), blendOverlay(base.b, blend.b));
}

vec3 blendHardLight(vec3 base, vec3 blend) {
  return blendOverlay(blend, base);
}

vec3 blendHardLight(vec3 base, vec3 blend, float opacity) {
  return (blendHardLight(base, blend) * opacity + base * (1.0 - opacity));
}


void main() {

  vec2 uv = gl_FragCoord.xy - .5 * u_resolution;

  vec2 uvNormalised = uv / u_resolution.xy;
  vec2 uvOriginal = getImageUV(uvNormalised, vec2(1.));

  float contrast = mix(0., 15., u_contrast);
  if (u_originalColors == true) {
    contrast = mix(.1, 4., pow(u_contrast, 2.));
  }

  float lum = getLumAtPx(uvOriginal, contrast);


  float t = .3 * (u_time);

  float edge = lum;

  vec3 color = vec3(0.);

  float opacity = 1.;

  float frame = getImgFrame(v_imageUV, 0.);
  edge = mix(1., edge, frame);

  uv = v_objectUV;
  vec2 p = uv;
  float angle = -u_angle * PI / 180.;
  p = rotate(p, angle);
  p *= u_size;

  float n = doubleSNoise(uv, u_time);

  float wave = (.3 * cos(.3 * p.x + .2 * p.y + u_time) - .6 * sin(.6 * p.y + u_time));
  wave *= u_wave;
  
  p.y += n * 10. * u_noise;
  p.y -= wave;

  vec2 d = abs(fract(p) - .5);
  vec2 aa = 2. * fwidth(p);
  float w = 0.;
  float wMax = .5 - aa.y;
  w = edge;
  
  w = min(w, wMax);
//  float lineDist = d.y;
//  float sdf = w - lineDist;
//  float afwidth  = fwidth(sdf);
//  afwidth = max(afwidth, 1e-4);
//  float line = smoothstep(0., afwidth, sdf);
  
  float line = d.y;
  line = 1. - sst(w, w + aa.y, line);

  float stripeId = floor(p.y);
  float hue = fract(stripeId * 0.161803);
  vec3 stripeColor = hsv2rgb(vec3(hue, .5, .7));

//  color = mix(u_colorBack.rgb, stripeColor, line);
  color = mix(u_colorBack.rgb, u_colorFront.rgb, line);
  fragColor = vec4(color, 1.);
//  fragColor = vec4(vec3(lum), 1.);
}
`;

export interface HalftoneLinesUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colorFront: [number, number, number, number];
  u_image: HTMLImageElement | string | undefined;
  u_stripeWidth: number;
  u_alphaMask: boolean;
  u_size: number;
  u_wave: number;
  u_noise: number;
  u_softness: number;
  u_angle: number;
  u_type: (typeof HalftoneLinesTypes)[HalftoneLinesType];

  u_contrast: number;
  u_originalColors: boolean;
  u_inverted: boolean;
  u_grainMixer: number;
  u_grainOverlay: number;
}

export interface HalftoneLinesParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colorFront?: string;
  image?: HTMLImageElement | string | undefined;
  stripeWidth?: number;
  alphaMask?: boolean;
  size?: number;
  softness?: number;
  wave?: number;
  noise?: number;
  angle?: number;
  type?: HalftoneLinesType;

  contrast?: number;
  originalColors?: boolean;
  inverted?: boolean;
  grainMixer?: number;
  grainOverlay?: number;
}

export const HalftoneLinesTypes = {
  classic: 0,
  gooey: 1,
  holes: 2,
  soft: 3,
} as const;

export type HalftoneLinesType = keyof typeof HalftoneLinesTypes;

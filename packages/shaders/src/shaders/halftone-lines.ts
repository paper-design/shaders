import type {ShaderMotionParams} from '../shader-mount.js';
import {sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms} from '../shader-sizing.js';
import {declarePI, rotation2, simplexNoise, proceduralHash21} from '../shader-utils.js';

export const halftoneLinesMeta = {
    maxBlurRadius: 8,
} as const;

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
uniform float u_grainSize;
uniform bool u_straight;
uniform bool u_originalColors;
uniform bool u_inverted;
uniform float u_stripeWidth;
uniform float u_smoothness;
uniform float u_angleDistortion;
uniform float u_noiseDistortion;
uniform float u_angle;


${ sizingVariablesDeclaration }

out vec4 fragColor;

${ declarePI }
${ rotation2 }
${ simplexNoise }
${ proceduralHash21 }

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

float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

float sigmoid(float x, float k) {
  return 1.0 / (1.0 + exp(-k * (x - 0.5)));
}

vec4 blurTexture(sampler2D tex, vec2 uv, vec2 texelSize, float radius) {
  // clamp radius so loops have a known max
  float r = clamp(radius, 0., float(${ halftoneLinesMeta.maxBlurRadius }));
  int ir = int(r);

  vec4 acc = vec4(0.0);
  float weightSum = 0.0;

  // simple Gaussian-ish weights based on distance
  for (int y = -20; y <= ${ halftoneLinesMeta.maxBlurRadius }; ++y) {
    if (abs(y) > ir) continue;
    for (int x = -20; x <= ${ halftoneLinesMeta.maxBlurRadius }; ++x) {
      if (abs(x) > ir) continue;

      vec2 offset = vec2(float(x), float(y));
      float dist2 = dot(offset, offset);

      // tweak sigma to taste; lower sigma = sharper falloff
      float sigma = radius * 0.5 + 0.001;
      float w = exp(-dist2 / (2.0 * sigma * sigma));

      acc += texture(tex, uv + offset * texelSize) * w;
      weightSum += w;
    }
  }

  return acc / max(weightSum, 0.00001);
}


float getLumAtPx(vec2 uv, float contrast, out vec3 origColor) {
  vec4 tex = blurTexture(u_image, uv, vec2(1. / u_resolution), u_smoothness);

  origColor = tex.rgb;
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

  vec3 origColor = vec3(0.);
  float lum = getLumAtPx(uvOriginal, contrast, origColor);

  float frame = getImgFrame(v_imageUV, 0.);
  lum = mix(1., lum, frame);

  uv = v_objectUV;
  vec2 p = uv;
  float angle = -u_angle * PI / 180.;
  p = rotate(p, angle + u_angleDistortion * lum);
  p *= u_size;

  vec2 pBase = v_objectUV * u_size;
  float aaBase = fwidth(pBase.y);

  float n = doubleSNoise(uv + 100., u_time);
  p.y += .4 * n * lum * u_noiseDistortion * u_size;

  vec2 stripeMap = abs(fract(p) - .5);
  vec2 stripeDist = abs(stripeMap);
  vec2 stripeSign = sign(stripeMap);

  float aa = fwidth(p).y;
  float distortAmount = max(aa - aaBase, 0.0);
  float highDistort = clamp(distortAmount * 5.0, 0.0, 1.0);

  float w = mix(.5 * u_stripeWidth, 0., lum);
  w = clamp(w, aa, .5 - aa);

  float loSharp = w;
  float loBlurry = 0.;
  float hiSharp = w + aa;
  float hiBlurry = w + aa;

  float lo = mix(loSharp, loBlurry, highDistort);
  float hi = mix(hiSharp, hiBlurry, highDistort);
  
  vec2 grainSize = mix(2000., 200., u_grainSize) * vec2(1., 1. / u_imageAspectRatio);
  vec2 grainUV = getImageUV(uvNormalised, grainSize);
  float grain = valueNoise(grainUV) + .3 * u_grainMixer;
  grain = smoothstep(.55, .9, grain);
  grain *= u_grainMixer;

  stripeDist.y += .5 * grain;
  
  float line = sst(lo, hi, stripeDist.y);

  line = mix(1., line, frame);
  line = clamp(line, 0., 1.);

  vec3 color = vec3(0.);
  float opacity = 1.;

  float stripeId = floor(p.y);

  if (u_originalColors == true) {
    color = mix(origColor, u_colorBack.rgb, line);
  } else {
    color = mix(u_colorFront.rgb, u_colorBack.rgb, line);
  }

  float grainOverlay = valueNoise(rotate(grainUV, 1.) + vec2(3.));
  grainOverlay = mix(grainOverlay, valueNoise(rotate(grainUV, 2.) + vec2(-1.)), .5);
  grainOverlay = pow(grainOverlay, 1.3);

  float grainOverlayV = grainOverlay * 2. - 1.;
  vec3 grainOverlayColor = vec3(step(0., grainOverlayV));
  float grainOverlayStrength = u_grainOverlay * abs(grainOverlayV);
  grainOverlayStrength = pow(grainOverlayStrength, .8);
  color = mix(color, grainOverlayColor, .35 * grainOverlayStrength);

  opacity += .5 * grainOverlayStrength;
  opacity = clamp(opacity, 0., 1.);
  
  fragColor = vec4(color, 1.);
}
`;

export interface HalftoneLinesUniforms extends ShaderSizingUniforms {
    u_colorBack: [number, number, number, number];
    u_colorFront: [number, number, number, number];
    u_image: HTMLImageElement | string | undefined;
    u_stripeWidth: number;
    u_smoothness: number;
    u_size: number;
    u_angleDistortion: number;
    u_noiseDistortion: number;
    u_angle: number;
    u_contrast: number;
    u_originalColors: boolean;
    u_inverted: boolean;
    u_grainMixer: number;
    u_grainOverlay: number;
    u_grainSize: number;
}

export interface HalftoneLinesParams extends ShaderSizingParams, ShaderMotionParams {
    colorBack?: string;
    colorFront?: string;
    image?: HTMLImageElement | string | undefined;
    stripeWidth?: number;
    smoothness?: number;
    size?: number;
    angleDistortion?: number;
    noiseDistortion?: number;
    angle?: number;
    contrast?: number;
    originalColors?: boolean;
    inverted?: boolean;
    grainMixer?: number;
    grainOverlay?: number;
    grainSize?: number;
}
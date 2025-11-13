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
uniform float u_blur;
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

float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

float sigmoid(float x, float k) {
  return 1.0 / (1.0 + exp(-k * (x - 0.5)));
}

vec4 blurTexture(sampler2D tex, vec2 uv, vec2 texelSize, float radius) {
    // clamp radius so loops have a known max
    float r = clamp(radius, 0.0, 10.0);
    int ir = int(r);

    vec4 acc = vec4(0.0);
    float weightSum = 0.0;

    // simple Gaussian-ish weights based on distance
    for (int y = -10; y <= 10; ++y) {
        if (abs(y) > ir) continue;
        for (int x = -10; x <= 10; ++x) {
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


float getLumAtPx(vec2 uv, float contrast) {
//  vec4 tex = texture(u_image, uv);
  vec4 tex = blurTexture(u_image, uv, vec2(1. / u_resolution), u_blur);
  
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

const int SAMPLES = 4;

float sampleLumOnLine(vec2 uvNorm, float contrast, vec2 p_current) {
//  float halfSpanPx = mix(0., 40., u_softness);
  float halfSpanPx = 5.;
  vec2 gradPy = vec2(dFdx(p_current.y), dFdy(p_current.y));
  vec2 t = normalize(vec2(-gradPy.y, gradPy.x) + 1e-8);

  vec2 stepNorm = (t / u_resolution) * halfSpanPx / float((SAMPLES - 1) / 2);

  float sum = 0.0;
  float wsum = 0.0;
  int N = (SAMPLES - 1) / 2;
  for (int i = -N; i <= N; ++i) {
    float w = 1.0 - (abs(float(i)) / float(N + 1));
    vec2 uvTapNorm = uvNorm + stepNorm * float(i);
    vec2 uvTapImg  = getImageUV(uvTapNorm, vec2(1.0));
    sum  += w * getLumAtPx(uvTapImg, contrast);
    wsum += w;
  }
  return sum / max(wsum, 1e-6);
}


vec2 projectToCenterlineUV(vec2 uvNorm, vec2 p_val) {
  vec2 gradPy = vec2(dFdx(p_val.y), dFdy(p_val.y));
  float gradLen = max(length(gradPy), 1e-6);
  float dy_p = (floor(p_val.y) + 0.5) - p_val.y;
  vec2 deltaPx = (gradPy / gradLen) * (dy_p / gradLen);
  return uvNorm + deltaPx / u_resolution;
}

float pixelDistToCenterline(vec2 p_val) {
  vec2 gradPy = vec2(dFdx(p_val.y), dFdy(p_val.y));
  float gradLen = max(length(gradPy), 1e-6);
  float dy_p = (fract(p_val.y) - 0.5);// signed p-space distance to center
  return dy_p / gradLen;// pixels
}


void main() {

  vec2 uv = gl_FragCoord.xy - .5 * u_resolution;

  vec2 uvNormalised = uv / u_resolution.xy;
  vec2 uvOriginal = getImageUV(uvNormalised, vec2(1.));

  float contrast = mix(0., 15., u_contrast);
  if (u_originalColors == true) {
    contrast = mix(.1, 4., pow(u_contrast, 2.));
  }

  float lumOrig = getLumAtPx(uvOriginal, contrast);

  float t = .3 * u_time;
  
  float frame = getImgFrame(v_imageUV, 0.);
  lumOrig = mix(1., lumOrig, frame);

  uv = v_objectUV;
  vec2 p = uv;
  float angle = -u_angle * PI / 180.;
//  p = rotate(p, angle + u_stripeWidth * lumOrig);
  p = rotate(p, u_wave * (1. - lumOrig));
  p *= u_size;

  float n = doubleSNoise(uv + 100., u_time);
  p.y += .4 * n * lumOrig * u_noise * u_size;
  
  float dPx = pixelDistToCenterline(p);
  float coverage = abs(dPx);
  vec2 uvOnLineNorm = projectToCenterlineUV(uvNormalised, p);
  vec2 uvOnLineImg = getImageUV(uvOnLineNorm, vec2(1.));
  float lum = getLumAtPx(uvOnLineImg, contrast);
//  float lum = sampleLumOnLine(uvOnLineNorm, coverage * contrast, p);
  lum = lumOrig;
  lum = mix(1., lum, frame);

  float line = 0.;

  {
    vec2 stripeMap = abs(fract(p) - .5);
    vec2 d = abs(stripeMap);
    vec2 stripeSign = sign(stripeMap);
    vec2 fw = fwidth(p);
    float aa = fw.y;
    float w = aa;
//    float w = 0.;
    w = mix(u_stripeWidth, 0., lum);
//    w = clamp(w, 0., .5 - aa);
    w = clamp(w, aa, .5);
    line += sst(mix(w, aa, u_softness) - aa, w + aa, d.y);
  }

  line = mix(1., line, frame);
  line = clamp(line, 0., 1.);


  vec2 grainSize = 1000. * vec2(1., 1. / u_imageAspectRatio);
  vec2 grainUV = getImageUV(uvNormalised, grainSize);
  float grain = valueNoise(grainUV);
  grain = smoothstep(.55, .7 + .2 * u_grainMixer, grain);
  grain *= u_grainMixer;
//  grain *= sst(.1, .0, w);
//  line = mix(line, 0., grain);
//  line += grain;

  vec3 color = vec3(0.);
  float opacity = 1.;

  float stripeId = floor(p.y);

  color = mix(u_colorBack.rgb, u_colorFront.rgb, line);
  
  fragColor = vec4(color, 1.);
}
`;

export interface HalftoneLinesUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colorFront: [number, number, number, number];
  u_image: HTMLImageElement | string | undefined;
  u_stripeWidth: number;
  u_blur: number;
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
  blur?: number;
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

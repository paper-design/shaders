import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2, proceduralHash21 } from '../shader-utils.js';

/**


 Uniforms:
 - u_colorBack, u_colorFront, u_colorHighlight (RGBA)
 (u_colorHighlight to be the lighdiagonalGrid parts of u_colorFront pixels)
 - size: px size set relative to canvas resolution
 */

// language=GLSL
export const imageHalftoneDotsFragmentShader: string = `#version 300 es
precision lowp float;

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
uniform bool u_diagonalGrid;
uniform bool u_originalColors;
uniform bool u_inverted;
uniform float u_type;

out vec4 fragColor;

${declarePI}
${rotation2}
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

float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
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

float getCircle(vec2 uv, float r) {
  r = mix(.25 * u_radius, 0., r);
  float d = length(uv - .5);
  float aa = fwidth(d);
  return 1. - smoothstep(r - aa, r + aa, d);
}

float getCell(vec2 uv) {
  float insideX = step(0.0, uv.x) * (1.0 - step(1.0, uv.x));
  float insideY = step(0.0, uv.y) * (1.0 - step(1.0, uv.y));
  return insideX * insideY;
}

float getCircleWithHole(vec2 uv, float r) {
  float cell = getCell(uv);

  r = mix(.7 * u_radius, 0., r);
  float rMod = mod(r, .5);
  
  float d = length(uv - .5);
  float aa = fwidth(d);
  float circle = 1. - smoothstep(rMod - aa, rMod + aa, d);
  if (r < .5) {
    return circle;
  } else {
    return cell - circle;
  }
}

float getGooeyBall(vec2 uv, float r) {
  float d = length(uv - .5);
  float sizeRadius = mix((u_diagonalGrid ? .4 : .25) * u_radius, 0., r);
  d = 1. - sst(0., sizeRadius, d);
  
  d = pow(d, 2. + u_radius);
  return d;
}

float getSoftBall(vec2 uv, float r) {
  float d = length(uv - .5);
  float sizeRadius = clamp(u_radius, 0., 1.);
  sizeRadius = mix(.5 * sizeRadius, 0., r);
  d = 1. - lst(0., sizeRadius, d);
  float powRadius = 1. - lst(0., 2., u_radius);
  d = pow(d, 4. + 3. * powRadius);
  return d;
}

float getUvFrame(vec2 uv) {
  float aa = 0.0001;

  float left   = smoothstep(0., aa, uv.x);
  float right  = smoothstep(1., 1. - aa, uv.x);
  float bottom = smoothstep(0., aa, uv.y);
  float top    = smoothstep(1., 1. - aa, uv.y);

  return left * right * bottom * top;
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

float getLumBall(vec2 p, vec2 pxSize, vec2 inCellOffset, float contrast, out vec4 ballColor) {
  p += inCellOffset;
  vec2 uv_i = floor(p);
  vec2 uv_f = fract(p);
  vec2 samplePx = ((uv_i + .5 - inCellOffset) * pxSize) / u_resolution.xy;
  vec2 samplingUV = getImageUV(samplePx, vec2(1.));
  float outOfFrame = getUvFrame(samplingUV);
  
  float lum = getLumAtPx(samplingUV, contrast);
  ballColor = texture(u_image, samplingUV);
  ballColor.rgb *= ballColor.a;
  ballColor *= outOfFrame;

  float ball = 0.;
  if (u_type < .5) {
    // classic
    ball = getCircle(uv_f, lum);
  } else if (u_type < 1.5) {
    // hole
    ball = getCircleWithHole(uv_f, lum);
  } else if (u_type < 2.5) {
    // gooey
    ball = getGooeyBall(uv_f, lum);
  }else if (u_type < 3.5) {
    // soft
    ball = getSoftBall(uv_f, lum);
  }

  return ball * outOfFrame;
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

  float stepMultiplier = 1.;
  if (u_type < .5) {
    // classic
    stepMultiplier = 2.;
  } else if (u_type > 1.5) {
    // gooey & soft
    stepMultiplier = 6.;
  } 
  
  vec2 pxSize = vec2(stepMultiplier) * u_size * u_pixelRatio;
  if (u_type == 2. && u_diagonalGrid == true) {
    // gooey diaginal grid works differently
    pxSize *= .7;
  }
  float contrast = mix(0., 15., u_contrast);

  vec2 uv = gl_FragCoord.xy - .5 * u_resolution;
  vec2 p = uv / pxSize;
  
  vec2 uvNormalised = uv / u_resolution.xy;
  vec2 uvOriginal = getImageUV(uvNormalised, vec2(1.));
  vec4 textureOriginal = texture(u_image, uvOriginal);

  float totalShape = 0.;
  vec3 totalColor = vec3(0.);
  float totalOpacity = 0.;

  vec4 ballColor;
  float shape;
  float stepSize = 1. / stepMultiplier;
  for (float x = -0.5; x < 0.5; x += stepSize) {
    for (float y = -0.5; y < 0.5; y += stepSize) {
      vec2 offset = vec2(x, y);

      if (u_diagonalGrid == true) {
        float rowIndex = floor((y + .5) / stepSize);
        float colIndex = floor((x + .5) / stepSize);
        if (stepSize == 1.) {
          rowIndex = floor(p.y + y + 1.);
          if (u_type == 2.) {
            colIndex = floor(p.x + x + 1.);
          }
        }
        if (u_type == 2.) {
          if (mod(rowIndex + colIndex, 2.) == 1.) {
            continue;
          }
        } else {
          if (mod(rowIndex, 2.) == 1.) {
            offset.x += .5 * stepSize;
          }
        }
      }

      shape = getLumBall(p, pxSize, offset, contrast, ballColor);
      totalColor   += ballColor.rgb * shape;
      totalShape   += shape;
      totalOpacity += shape;
    }
  }
  
  const float eps = 1e-4;
  
  totalColor /= max(totalShape, eps);
  totalOpacity /= max(totalShape, eps);

  float finalShape = 0.;
  if (u_type < 1.5) {
    finalShape = min(1., totalShape);
  } else if (u_type < 2.5) {
    float aa = fwidth(totalShape);
    float th = .5;
    finalShape = smoothstep(th - aa, th + aa, totalShape);
//    finalShape = totalShape;
  } else if (u_type < 3.5) {
    finalShape = totalShape;
  }

  vec2 dudx = dFdx(uvOriginal);
  vec2 dudy = dFdy(uvOriginal);
  vec2 grainUV = getImageUV(uvNormalised, .6 / vec2(length(dudx), length(dudy)));
  float grain = valueNoise(grainUV);
  grain = smoothstep(.55, .7 + .2 * u_grainMixer, grain);
  grain *= u_grainMixer;
  finalShape = mix(finalShape, 0., grain);

  vec3 color = vec3(0.);
  float opacity = 0.;
  
  if (u_originalColors == true) {
    color = totalColor * finalShape;
    opacity = totalOpacity * finalShape;

    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    color = color + bgColor * (1. - opacity);
    opacity = opacity + u_colorBack.a * (1. - opacity);
  } else {
    vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
    float fgOpacity = u_colorFront.a;
    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    float bgOpacity = u_colorBack.a;

    color = fgColor * finalShape;
    opacity = fgOpacity * finalShape;
    color += bgColor * (1. - opacity);
    opacity += bgOpacity * (1. - opacity);
  }

  float grainOverlay = valueNoise(rotate(grainUV, 1.) + vec2(3.));
  grainOverlay = mix(grainOverlay, valueNoise(rotate(grainUV, 2.) + vec2(-1.)), .5);
  grainOverlay = pow(grainOverlay, 2.);
  vec3 grainOverlayColor = vec3(grainOverlay);
  color = blendHardLight(color, grainOverlayColor, .5 * u_grainOverlay);

  fragColor = vec4(color, opacity);
}
`;

export interface ImageHalftoneDotsUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_size: number;
  u_diagonalGrid: boolean;
  u_radius: number;
  u_contrast: number;
  u_originalColors: boolean;
  u_inverted: boolean;
  u_grainMixer: number;
  u_grainOverlay: number;
  u_type: (typeof ImageHalftoneDotsTypes)[ImageHalftoneDotsType];
}

export interface ImageHalftoneDotsParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorFront?: string;
  colorBack?: string;
  size?: number;
  diagonalGrid?: boolean;
  radius?: number;
  contrast?: number;
  originalColors?: boolean;
  inverted?: boolean;
  grainMixer?: number;
  grainOverlay?: number;
  type?: ImageHalftoneDotsType;
}

export const ImageHalftoneDotsTypes = {
  classic: 0,
  hole: 1,
  gooey: 2,
  soft: 3,
} as const;

export type ImageHalftoneDotsType = keyof typeof ImageHalftoneDotsTypes;

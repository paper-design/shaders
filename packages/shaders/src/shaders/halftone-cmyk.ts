import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2 } from '../shader-utils.js';

export const halftoneCmykMeta = {
  maxBlurRadius: 5,
} as const;

// language=GLSL
export const halftoneCmykFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_fit;

uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec4 u_colorBack;
uniform float u_size;
uniform float u_radius;
uniform float u_minRadius;
uniform float u_angleC;
uniform float u_angleM;
uniform float u_angleY;
uniform float u_angleK;
uniform float u_contrast;
uniform float u_grainSize;
uniform float u_grainMixer;
uniform float u_smoothness;
uniform float u_softness;

out vec4 fragColor;

${ declarePI }
${ rotation2 }

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

float getUvFrame(vec2 uv, vec2 pad) {
  float aa = 0.01;

  float left   = smoothstep(-pad.x, 0., uv.x);
  float right  = smoothstep(1.0 + pad.x, 1., uv.x);
  float bottom = smoothstep(-pad.y, 0., uv.y);
  float top    = smoothstep(1.0 + pad.y, 1., uv.y);

  return left * right * bottom * top;
}

float halftoneDot(vec2 p, float radius) {
  vec2 cellCenter = floor(p) + 0.5;
  vec2 d = p - cellCenter;
  float dist = length(d);
  return 1. - step(radius, dist);
}

float halftoneDotMask(vec2 p, float radius) {
  vec2 cellCenter = floor(p) + 0.5;
  vec2 d = p - cellCenter;
  float dist = length(d);
  float aa = fwidth(dist);
  return 1. - smoothstep(mix(radius - aa, 0., u_softness), radius + aa, dist);
}

vec4 RGBtoCMYK(vec3 rgb) {
  float k = 1.0 - max(max(rgb.r, rgb.g), rgb.b);
  float denom = 1.0 - k;
  vec3 cmy = vec3(0.0);
  if (denom > 1e-5) {
    cmy = (1.0 - rgb - vec3(k)) / denom;
  }
  return vec4(cmy, k);
}

vec3 CMYKtoRGB(vec4 cmyk) {
  vec3 rgb;
  rgb.r = 1.0 - min(1.0, cmyk.x + cmyk.w);
  rgb.g = 1.0 - min(1.0, cmyk.y + cmyk.w);
  rgb.b = 1.0 - min(1.0, cmyk.z + cmyk.w);
  return rgb;
}
vec4 blurTexture(sampler2D tex, vec2 uv, vec2 texelSize, float radius) {
  // clamp radius so loops have a known max
  float r = clamp(radius, 0., float(${ halftoneCmykMeta.maxBlurRadius }));
  int ir = int(r);

  vec4 acc = vec4(0.0);
  float weightSum = 0.0;

  // simple Gaussian-ish weights based on distance
  for (int y = -${ halftoneCmykMeta.maxBlurRadius }; y <= ${ halftoneCmykMeta.maxBlurRadius }; ++y) {
    if (abs(y) > ir) continue;
    for (int x = -${ halftoneCmykMeta.maxBlurRadius }; x <= ${ halftoneCmykMeta.maxBlurRadius }; ++x) {
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

void main() {
  vec2 uvNormalised = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.xy;
  vec2 uv = getImageUV(uvNormalised, vec2(1.));

//  vec4 tex = texture(u_image, uv);
  vec4 tex = blurTexture(u_image, uv, vec2(1. / u_resolution), u_smoothness);
  vec4 cmyk = RGBtoCMYK(tex.rgb);
  
  float cellsPerSide = mix(300.0, 7.0, pow(u_size, 0.7));
  float cellSizeY = 1.0 / cellsPerSide;
  vec2 pad = cellSizeY * vec2(1.0 / u_imageAspectRatio, 1.0);
  vec2 uvGrid = (uv - .5) / pad;
  float outOfFrame = getUvFrame(uv, pad);

  vec2 pC = rotate(uvGrid, radians(u_angleC));
  vec2 pM = rotate(uvGrid, radians(u_angleM));
  vec2 pY = rotate(uvGrid, radians(u_angleY));
  vec2 pK = rotate(uvGrid, radians(u_angleK));

  float baseR = u_radius * outOfFrame;
  vec4 radius = baseR * mix(cmyk, vec4(1.), u_minRadius);

  float C = halftoneDot(pC, radius[0]);
  float M = halftoneDot(pM, radius[1]);
  float Y = halftoneDot(pY, radius[2]);
  float K = halftoneDot(pK, radius[3]);
  float maskC = halftoneDotMask(pC, radius[0]);
  float maskM = halftoneDotMask(pM, radius[1]);
  float maskY = halftoneDotMask(pY, radius[2]);
  float maskK = halftoneDotMask(pK, radius[3]);

  vec4 outCmyk = vec4(C, M, Y, K);

  vec3 color = u_colorBack.rgb * u_colorBack.a;
  float opacity = u_colorBack.a;
  float shape = max(max(max(maskC, maskM), maskY), maskK);
  vec3 inkRgb = CMYKtoRGB(outCmyk);
  color = mix(color, inkRgb, shape);
  opacity += shape;
  opacity = clamp(opacity, 0., 1.);
  
  fragColor = vec4(color, opacity);
}
`;

export interface HalftoneCmykUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorBack: [number, number, number, number];
  u_size: number;
  u_radius: number;
  u_minRadius: number;
  u_angleC: number;
  u_angleM: number;
  u_angleY: number;
  u_angleK: number;
  u_contrast: number;
  u_smoothness: number;
  u_softness: number;
  u_grainSize: number;
  u_grainMixer: number;
}

export interface HalftoneCmykParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorBack?: string;
  size?: number;
  radius?: number;
  minRadius?: number;
  angleC?: number;
  angleM?: number;
  angleY?: number;
  angleK?: number;
  contrast?: number;
  smoothness?: number;
  softness?: number;
  grainSize?: number;
  grainMixer?: number;
}

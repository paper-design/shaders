import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, declareRotate, declareRandom, declareSimplexNoise } from '../shader-utils.js';

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
uniform float u_gridRotation;
uniform float u_distortion;
uniform float u_distortionType;

uniform float u_extraRight;
uniform float u_extraLeft;
uniform float u_extraRightDirection;
uniform float u_extraLeftDirection;
uniform float u_frost;
uniform float u_xShift;
uniform float u_blur;
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
${declareSimplexNoise}

out vec4 fragColor;

float uvFrame(vec2 uv) {
  return step(1e-3, uv.x) * step(uv.x, 1. - 1e-3) * step(1e-3, uv.y) * step(uv.y, 1. - 1e-3);
}

float hash(float x) {
  return fract(sin(x) * 43758.5453123);
}

vec4 gaussianBlur(sampler2D tex, vec2 uv, vec2 texSize, float sigma) {
    if (sigma <= 1.) {
        return texture(tex, uv);
    }
    float kernel[9];
    kernel[0] = 0.077847; kernel[1] = 0.123317; kernel[2] = 0.077847;
    kernel[3] = 0.123317; kernel[4] = 0.195346; kernel[5] = 0.123317;
    kernel[6] = 0.077847; kernel[7] = 0.123317; kernel[8] = 0.077847;

    vec2 texel = (sigma / 1.0) * (1.0 / texSize);

    vec4 sum = vec4(0.0);
    int k = 0;
    for (int j = -1; j <= 1; ++j) {
        for (int i = -1; i <= 1; ++i) {
            vec2 offset = vec2(float(i), float(j)) * texel;
            sum += texture(tex, uv + offset) * kernel[k++];
        }
    }
    return sum;
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

  float patternRotation = u_gridRotation * PI / 180.;

  vec2 uv = imageUV;
  vec2 uvOrig = uv;
  
  float mask = 
    step(u_marginLeft, uvOrig.x) * step(u_marginRight, 1. - uvOrig.x)
    * step(u_marginTop, uvOrig.y) * step(u_marginBottom, 1. - uvOrig.y);
  
  uv = rotate(uv - vec2(.5), patternRotation);
  uv.x -= .5;
  
  uv *= u_grid;

  vec2 fractUV = fract(uv);
  vec2 fractUVOrig = fractUV;
  vec2 floorUV = floor(uv);

  float gridLines = pow(fractUV.x, 14.);
  gridLines *= mask;

      
  float linesRight = pow(fractUV.x, 8.);
  linesRight -= .75 * pow(fractUV.x, 12.);
  
  float linesLeft = pow((1. - fractUV.x), 8.);
  linesLeft -= .75 * pow((1. - fractUV.x), 12.);
  
  linesLeft *= mask;
  linesRight *= mask;
  
  fractUV.y -= clamp(uv.y - .5 + u_extraRightDirection * u_grid, -6., 6.) * u_extraRight * linesRight;
  fractUV.y -= clamp(uv.y + .5 + u_extraLeftDirection * u_grid, -6., 6.) * u_extraLeft * linesLeft;
  
  vec2 frost = .15 * vec2(snoise(v_patternUV * .5), snoise(v_patternUV * .7));
  
  fractUV = mix(fractUV, fractUV + frost, u_frost);

  if (u_distortionType == 1.) {
    float distortion = pow(1.5 * (fractUV.x - .5 + u_xShift), 3.);
    fractUV.x -= u_distortion * distortion;
  } else if (u_distortionType == 2.) {
    float distortion = pow(fractUV.x, 2.);
    distortion -= 0.5 + u_xShift;
    fractUV.x += u_distortion * distortion;
  } else if (u_distortionType == 3.) {
    fractUV.x = mix(fractUV.x, .5 + u_xShift, u_distortion);
  } else if (u_distortionType == 4.) {
    float distortion = sin((fractUV.x + .25 + u_xShift) * TWO_PI);
    fractUV.x += u_distortion * distortion;
  }

  uv = (floorUV + fractUV) / u_grid;  
  uv.x += .5;
  uv = rotate(uv, -patternRotation) + vec2(.5);

  vec2 uvLine = (floorUV) / u_grid;  
  
  uv = mix(uvOrig, uv, mask);
  float blur = mix(0., u_blur, mask);
  
//  vec4 color = texture(u_image, uv);
  vec4 color = gaussianBlur(u_image, uv, u_resolution, blur);

  vec3 midColor = texture(u_image, vec2(uvLine.x, .4 + .2 * hash(floorUV.x))).rgb;
  vec3 highlight = mix(midColor, vec3(1.), u_gridLinesBrightness);
  color.rgb = mix(color.rgb, highlight, u_gridLines * gridLines);

  float opacity = color.a;
  opacity *= uvFrame(uvOrig);
  fragColor = vec4(color.rgb, opacity); 
}

`;

export interface FlutedGlassUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | null;
  u_grid: number;
  u_gridRotation: number;
  u_distortion: number;
  u_extraRight: number;
  u_extraLeft: number;
  u_extraRightDirection: number;
  u_extraLeftDirection: number;
  u_frost: number;
  u_xShift: number;
  u_blur: number;
  u_marginLeft: number;
  u_marginRight: number;
  u_marginTop: number;
  u_marginBottom: number;
  u_gridLines: number;
  u_gridLinesBrightness: number;
  u_distortionType: (typeof GlassDistortionTypes)[GlassDistortion];
}

export interface FlutedGlassParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | null;
  grid?: number;
  gridRotation?: number;
  distortion?: number;
  extraRight?: number;
  extraLeft?: number;
  extraRightDirection?: number;
  extraLeftDirection?: number;
  frost?: number;
  xShift?: number;
  blur?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  gridLines?: number;
  gridLinesBrightness?: number;
  distortionType?: GlassDistortion;
}

export const GlassDistortionTypes = {
  'skew': 1,
  'shrink': 2,
  'stretch': 3,
  'wave': 4,
} as const;

export type GlassDistortion = keyof typeof GlassDistortionTypes;

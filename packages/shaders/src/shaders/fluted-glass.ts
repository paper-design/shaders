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
uniform float u_curve;
uniform float u_curveFreq;
uniform float u_gridRotation;
uniform float u_distortion;
uniform float u_distortionType;

uniform float u_extraRight;
uniform float u_extraLeft;
uniform float u_extraRightDirection;
uniform float u_extraLeftDirection;
uniform float u_frost;
uniform float u_frostScale;
uniform float u_shift;
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

const int MAX_RADIUS = 25;

vec4 gaussian1D(sampler2D tex, vec2 uv, vec2 texelSize, vec2 dir, float sigma) {
    if (sigma <= .5) return texture(tex, uv);
    int radius = int(min(float(MAX_RADIUS), ceil(3.0 * sigma)));

    float twoSigma2 = 2.0 * sigma * sigma;
    float gaussianNorm = 1.0 / sqrt(TWO_PI * sigma * sigma);

    vec4 sum        = texture(tex, uv) * gaussianNorm;
    float weightSum = gaussianNorm;

    for (int i = 1; i <= MAX_RADIUS; ++i) {
        if (i > radius) break; 

        float x  = float(i);
        float w  = exp(-(x * x) / twoSigma2) * gaussianNorm;

        vec2 offset = dir * texelSize * x;
        vec4 s1 = texture(tex, uv + offset);
        vec4 s2 = texture(tex, uv - offset);

        sum        += (s1 + s2) * w;
        weightSum  += 2.0 * w;
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

  float patternRotation = u_gridRotation * PI / 180.;

  vec2 uv = imageUV;
  float frame = uvFrame(imageUV);
  if (frame < .05) discard;
  
  float mask = 
    step(u_marginLeft, imageUV.x) * step(u_marginRight, 1. - imageUV.x)
    * step(u_marginTop, imageUV.y) * step(u_marginBottom, 1. - imageUV.y);
  
  uv = rotate(uv - vec2(.5), patternRotation);
  uv *= u_grid;

  float curve = sin(20. * u_curveFreq * uv.y / u_grid);
  curve *= (u_curve * .2 * u_grid);


  vec2 uvOrig = uv;
  uv += curve;

  vec2 fractUV = fract(uv);
  vec2 floorUV = floor(uv);  
  
  vec2 fractOrigUV = fract(uvOrig);
  vec2 floorOrigUV = floor(uvOrig);  

  float gridLines = pow(fractUV.x, 14.);
  gridLines *= mask;

      
  float linesRight = pow(fractUV.x, 8.);
  linesRight -= .75 * pow(fractUV.x, 12.);
  
  float linesLeft = pow((1. - fractUV.x), 8.);
  linesLeft -= .75 * pow((1. - fractUV.x), 12.);
  
  linesLeft *= mask;
  linesRight *= mask;
  
  fractOrigUV.y -= clamp(uv.y - .5 + u_extraRightDirection * u_grid, -6., 6.) * u_extraRight * linesRight;
  fractOrigUV.y -= clamp(uv.y + .5 + u_extraLeftDirection * u_grid, -6., 6.) * u_extraLeft * linesLeft;
  
  float frostScale = .6 * pow(u_frostScale, 2.);
  vec2 frost = .15 * vec2(snoise(v_patternUV * frostScale * .7), snoise(v_patternUV * frostScale));
  
  fractUV = mix(fractUV, fractUV + frost, u_frost);

  float xDistortion = 0.;
  if (u_distortionType == 1.) {
    // skew
    float distortion = pow(1.5 * fractUV.x, 3.);
    distortion -= .5 + u_shift;
    // fractUV.x -= u_distortion * distortion;
    xDistortion = -u_distortion * distortion;
  } else if (u_distortionType == 2.) {
    // shrink
    float distortion = pow(fractUV.x, 2.);
    distortion -= .5 + u_shift;
    // fractUV.x += u_distortion * distortion;
    xDistortion = u_distortion * distortion;
  } else if (u_distortionType == 3.) {
    // stretch
    // fractUV.x = mix(fractUV.x, .5 + u_shift, u_distortion);
    fractUV.x = mix(fractUV.x, mix(fractUV.x, .5 + u_shift, fractUV.x), u_distortion);
  } else if (u_distortionType == 4.) {
    // wave
    float distortion = sin((fractUV.x + .25 + u_shift) * TWO_PI);
    // fractUV.x += u_distortion * distortion;
    xDistortion = u_distortion * distortion;
  }

  xDistortion /= u_grid;

  uv = (floorOrigUV + fractOrigUV) / u_grid;  
  uv.x += xDistortion;
  uv = rotate(uv, -patternRotation) + vec2(.5);
  
  uv = mix(imageUV, uv, mask);
  float blur = mix(0., u_blur, mask);
  
//  vec4 color = texture(u_image, uv);
  vec4 color = gaussian1D(u_image, uv, 1. / u_resolution, vec2(1.0, 0.0), blur);

  vec3 midColor = texture(u_image, vec2(floorUV.x / u_grid - .5, .4 + .2 * hash(floorUV.x))).rgb;
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
  u_extraRight: number;
  u_extraLeft: number;
  u_extraRightDirection: number;
  u_extraLeftDirection: number;
  u_frost: number;
  u_frostScale: number;
  u_shift: number;
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
  image?: HTMLImageElement | string | null;
  grid?: number;
  curve?: number;
  curveFreq?: number;
  gridRotation?: number;
  distortion?: number;
  extraRight?: number;
  extraLeft?: number;
  extraRightDirection?: number;
  extraLeftDirection?: number;
  frost?: number;
  frostScale?: number;
  shift?: number;
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
  skew: 1,
  shrink: 2,
  // stretch: 3,
  wave: 4,
} as const;

export type GlassDistortion = keyof typeof GlassDistortionTypes;

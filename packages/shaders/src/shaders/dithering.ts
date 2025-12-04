import type { ShaderMotionParams } from '../shader-mount.js';
import {
  sizingUniformsDeclaration,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing.js';
import { simplexNoise, declarePI, proceduralHash11, proceduralHash21 } from '../shader-utils.js';

/**
 * Animated 2-color dithering over multiple pattern sources (noise, warp, dots, waves, ripple, swirl, sphere).
 * Great for retro, print-like, or stylized UI textures.
 *
 * Note: pixelization is applied to the shapes BEFORE dithering, meaning pixels don't react to scaling and fit
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colorFront (vec4): Foreground (ink) color in RGBA
 * - u_shape (float): Shape pattern type (1 = simplex, 2 = warp, 3 = dots, 4 = wave, 5 = ripple, 6 = swirl, 7 = sphere)
 * - u_type (float): Dithering type (1 = random, 2 = 2x2 Bayer, 3 = 4x4 Bayer, 4 = 8x8 Bayer)
 * - u_pxSize (float; duplicate, not currently used)
 *
 * */

// language=GLSL
export const ditheringFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

${ sizingUniformsDeclaration }

uniform float u_pxSize;
uniform vec4 u_colorBack;
uniform vec4 u_colorFront;
uniform float u_shape;
uniform float u_type;

out vec4 fragColor;

${ simplexNoise }
${ declarePI }
${ proceduralHash11 }
${ proceduralHash21 }

float getSimplexNoise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

const int bayer2x2[4] = int[4](0, 2, 3, 1);
const int bayer4x4[16] = int[16](
0, 8, 2, 10,
12, 4, 14, 6,
3, 11, 1, 9,
15, 7, 13, 5
);

const int bayer8x8[64] = int[64](
0, 32, 8, 40, 2, 34, 10, 42,
48, 16, 56, 24, 50, 18, 58, 26,
12, 44, 4, 36, 14, 46, 6, 38,
60, 28, 52, 20, 62, 30, 54, 22,
3, 35, 11, 43, 1, 33, 9, 41,
51, 19, 59, 27, 49, 17, 57, 25,
15, 47, 7, 39, 13, 45, 5, 37,
63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv, int size) {
  ivec2 pos = ivec2(fract(uv / float(size)) * float(size));
  int index = pos.y * size + pos.x;

  if (size == 2) {
    return float(bayer2x2[index]) / 4.0;
  } else if (size == 4) {
    return float(bayer4x4[index]) / 16.0;
  } else if (size == 8) {
    return float(bayer8x8[index]) / 64.0;
  }
  return 0.0;
}


void main() {
  float t = .5 * u_time;

  float pxSize = u_pxSize * u_pixelRatio;
  vec2 pxSizeUv = gl_FragCoord.xy - .5 * u_resolution;
  pxSizeUv /= pxSize;
  vec2 uv = (floor(pxSizeUv) + .5) * pxSize / u_resolution;

  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  vec2 objectBoxSize = vec2(0.);
  // fit = none
  objectBoxSize.x = fixedRatio * min(fixedRatioBoxGivenSize.x / fixedRatio, fixedRatioBoxGivenSize.y);
  if (u_fit == 1.) { // fit = contain
    objectBoxSize.x = fixedRatio * min(u_resolution.x / fixedRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    objectBoxSize.x = fixedRatio * max(u_resolution.x / fixedRatio, u_resolution.y);
  }
  objectBoxSize.y = objectBoxSize.x / fixedRatio;
  vec2 objectWorldScale = u_resolution.xy / objectBoxSize;
  
  vec2 objectUV = uv;
  objectUV *= objectWorldScale;
  objectUV += boxOrigin * (objectWorldScale - 1.);
  objectUV += vec2(-u_offsetX, u_offsetY);
  objectUV /= u_scale;
  objectUV = graphicRotation * objectUV;
  
  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  vec2 patternBoxSize = vec2(0.);
  // fit = none
  patternBoxSize.x = patternBoxRatio * min(patternBoxGivenSize.x / patternBoxRatio, patternBoxGivenSize.y);
  float patternWorldNoFitBoxWidth = patternBoxSize.x;
  if (u_fit == 1.) { // fit = contain
    patternBoxSize.x = patternBoxRatio * min(u_resolution.x / patternBoxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    patternBoxSize.x = patternBoxRatio * max(u_resolution.x / patternBoxRatio, u_resolution.y);
  }
  patternBoxSize.y = patternBoxSize.x / patternBoxRatio;
  vec2 patternWorldScale = u_resolution.xy / patternBoxSize;

  vec2 patternUV = uv;
  patternUV += vec2(-u_offsetX, u_offsetY) / patternWorldScale;
  patternUV += boxOrigin;
  patternUV -= boxOrigin / patternWorldScale;
  patternUV *= u_resolution.xy;
  patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    patternUV *= (patternWorldNoFitBoxWidth / patternBoxSize.x);
  }
  patternUV /= u_scale;
  patternUV = graphicRotation * patternUV;
  patternUV += boxOrigin / patternWorldScale;
  patternUV -= boxOrigin;
  patternUV += .5;
  
  vec2 dithering_uv = pxSizeUv;
  vec2 ditheringNoise_uv = uv * u_resolution;
  vec2 shape_uv = objectUV;
  if (u_shape < 3.5) {
    shape_uv = patternUV;
  }

  float shape = 0.;
  if (u_shape < 1.5) {
    // Simplex noise
    shape_uv *= .001;

    shape = 0.5 + 0.5 * getSimplexNoise(shape_uv, t);
    shape = smoothstep(0.3, 0.9, shape);

  } else if (u_shape < 2.5) {
    // Warp
    shape_uv *= .003;

    for (float i = 1.0; i < 6.0; i++) {
      shape_uv.x += 0.6 / i * cos(i * 2.5 * shape_uv.y + t);
      shape_uv.y += 0.6 / i * cos(i * 1.5 * shape_uv.x + t);
    }

    shape = .15 / max(0.001, abs(sin(t - shape_uv.y - shape_uv.x)));
    shape = smoothstep(0.02, 1., shape);

  } else if (u_shape < 3.5) {
    // Dots
    shape_uv *= .05;

    float stripeIdx = floor(2. * shape_uv.x / TWO_PI);
    float rand = hash11(stripeIdx * 10.);
    rand = sign(rand - .5) * pow(.1 + abs(rand), .4);
    shape = sin(shape_uv.x) * cos(shape_uv.y - 5. * rand * t);
    shape = pow(abs(shape), 6.);

  } else if (u_shape < 4.5) {
    // Sine wave
    shape_uv *= 4.;

    float wave = cos(.5 * shape_uv.x - 2. * t) * sin(1.5 * shape_uv.x + t) * (.75 + .25 * cos(3. * t));
    shape = 1. - smoothstep(-1., 1., shape_uv.y + wave);

  } else if (u_shape < 5.5) {
    // Ripple

    float dist = length(shape_uv);
    float waves = sin(pow(dist, 1.7) * 7. - 3. * t) * .5 + .5;
    shape = waves;

  } else if (u_shape < 6.5) {
    // Swirl

    float l = length(shape_uv);
    float angle = 6. * atan(shape_uv.y, shape_uv.x) + 4. * t;
    float twist = 1.2;
    float offset = 1. / pow(max(l, 1e-6), twist) + angle / TWO_PI;
    float mid = smoothstep(0., 1., pow(l, twist));
    shape = mix(0., fract(offset), mid);

  } else {
    // Sphere
    shape_uv *= 2.;

    float d = 1. - pow(length(shape_uv), 2.);
    vec3 pos = vec3(shape_uv, sqrt(max(0., d)));
    vec3 lightPos = normalize(vec3(cos(1.5 * t), .8, sin(1.25 * t)));
    shape = .5 + .5 * dot(lightPos, pos);
    shape *= step(0., d);
  }


  int type = int(floor(u_type));
  float dithering = 0.0;

  switch (type) {
    case 1: {
      dithering = step(hash21(ditheringNoise_uv), shape);
    } break;
    case 2:
    dithering = getBayerValue(dithering_uv, 2);
    break;
    case 3:
    dithering = getBayerValue(dithering_uv, 4);
    break;
    default :
    dithering = getBayerValue(dithering_uv, 8);
    break;
  }

  dithering -= .5;
  float res = step(.5, shape + dithering);

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  fragColor = vec4(color, opacity);
}
`;

export interface DitheringUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colorFront: [number, number, number, number];
  u_shape: (typeof DitheringShapes)[DitheringShape];
  u_type: (typeof DitheringTypes)[DitheringType];
  u_pxSize: number;
}

export interface DitheringParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colorFront?: string;
  shape?: DitheringShape;
  type?: DitheringType;
  size?: number;
}

export const DitheringShapes = {
  simplex: 1,
  warp: 2,
  dots: 3,
  wave: 4,
  ripple: 5,
  swirl: 6,
  sphere: 7,
} as const;

export type DitheringShape = keyof typeof DitheringShapes;

export const DitheringTypes = {
  'random': 1,
  '2x2': 2,
  '4x4': 3,
  '8x8': 4,
} as const;

export type DitheringType = keyof typeof DitheringTypes;

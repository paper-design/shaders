import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingUniformsDeclaration,
  sizingVariablesDeclaration,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
  sizingUV,
  worldBoxTestStroke,
  viewPortTestOriginPoint,
} from '../shader-sizing';
import { declareSimplexNoise, declarePI, declareRandom } from '../shader-utils';

/**
 * Dithering Fragment Shader by Ksenia Kondrashova
 * Applies dithering (4 dithering types available) over the
 * abstract shapes animation (7 animated shapes available)
 *
 * Uniforms include:
 * - u_color1: background color, RGBA
 * - u_color2: pixels color, RGBA
 *
 * - u_shape (float, used as int, 1 to 7):
 *  --- shape = 1: Simplex noise pattern
 *  --- shape = 2: Warp noise pattern
 *  --- shape = 3: Columns if dots moving vertically
 *  --- shape = 4: Sine wave
 *  --- shape = 5: Ripple effect
 *  --- shape = 6: Swirl animation
 *  --- shape = 7: Rotating sphere
 *
 *  - u_type (float, used as int, 1 to 4):
 *  --- type = 1: Random dithering
 *  --- type = 2: 2x2 Bayer matrix
 *  --- type = 3: 4x4 Bayer matrix
 *  --- type = 4: 8x8 Bayer matrix
 *
 * - pxSize (float), relative to canvas resolution
 * - u_pxRounded (bool)
 *
 */
export const ditheringFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

${sizingUniformsDeclaration}

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform float u_shape;
uniform float u_type;
uniform float u_pxSize;
uniform bool u_pxRounded;

  
// =================================================
// Using sizing from vertex shader

// $ {sizingVariablesDeclaration}
// $ {sizingDebugVariablesDeclaration}

// =================================================

out vec4 fragColor;

${declareSimplexNoise}
${declarePI}
${declareRandom}

float getSimplexNoise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

const int bayer2x2[4] = int[4](0, 2, 3, 1);
const int bayer4x4[16] = int[16](
  0,  8,  2, 10, 
 12,  4, 14,  6, 
  3, 11,  1,  9, 
 15,  7, 13,  5
);

const int bayer8x8[64] = int[64](
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv, int size) {
  ivec2 pos = ivec2(mod(uv, float(size)));
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
  
  
  // =================================================
  // Using sizing from vertex shader

  // float pxSize = u_pxSize * u_pixelRatio;
  // vec2 dithering_uv = gl_FragCoord.xy / pxSize;
  // vec2 ditheringNoise_uv = floor(dithering_uv) * pxSize / u_resolution.xy;
  // vec2 shape_uv = v_objectUV;
  // if (u_shape < 3.5) {
  //   shape_uv = v_patternUV;
  // }
  
  // =================================================

  
  // =================================================
  // Using sizing from fragment shader
  
  #define USE_PATTERN_SIZING
  #define USE_OBJECT_SIZING
  #define USE_PIXELIZATION
  #define USE_SIZING_DEBUG
  ${sizingUV}
  vec2 dithering_uv = pxSizeUv;

  vec2 ditheringNoise_uv = roundedUv;
  vec2 shape_uv = objectUV;
  if (u_shape < 3.5) {
    shape_uv = patternUV;
  }
  
  // =================================================




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
    
    shape = .15 / abs(sin(t - shape_uv.y - shape_uv.x));  
    shape = smoothstep(0.02, 1., shape);
  
  } else if (u_shape < 3.5) {  
    // Dots  
    shape_uv *= .05;

    float stripeIdx = floor(2. * shape_uv.x / TWO_PI);
    float rand = fract(sin(stripeIdx * 12.9898) * 43758.5453);

    float speed = sign(rand - .5) * ceil(2. + rand);
    shape = sin(shape_uv.x) * cos(shape_uv.y + speed * t);  
    shape = pow(shape, 6.);

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
    float offset = pow(l, -twist) + angle / TWO_PI;  
    float mid = smoothstep(0., 1., pow(l, twist));
    shape = mix(0., fract(offset), mid);
    
  } else {
    // Sphere
    shape_uv *= 2.;
    
    vec3 pos = vec3(shape_uv, sqrt(1. - pow(length(shape_uv), 2.)));
    vec3 lightPos = normalize(vec3(cos(1.5 * t), .8, sin(1.25 * t)));
    shape = .5 + .5 * dot(lightPos, pos);
  }  
  
  
  int type = int(floor(u_type));  
  float dithering = 0.0;  
  
  switch (type) {  
    case 1: {
      dithering = step(random(ditheringNoise_uv), shape);  
    } break;  
    case 2:  
      dithering = getBayerValue(dithering_uv, 2);  
      break;  
    case 3:  
      dithering = getBayerValue(dithering_uv, 4);  
      break;  
    default:  
      dithering = getBayerValue(dithering_uv, 8);  
      break;  
  }  
  
  dithering -= .5;  
  float res = step(.5, shape + dithering);  
  
  vec4 color = mix(u_color1, u_color2, res);
  
  
  // =================================================
  // Using sizing from vertex shader

  // vec2 worldBox = v_objectWorldBox;
  // vec2 world = v_objectWorld;
  // if (u_shape < 3.5) {
  //   worldBox = v_patternWorldBox;
  //   world = v_patternWorld;
  // }

  // =================================================



  // =================================================
  // Using sizing from fragment shader

  #ifdef USE_SIZING_DEBUG
    vec2 worldBox = objectWorldBox;
    vec2 world = objectWorld;
    if (u_shape < 3.5) {
      worldBox = patternWorldBox;
      world = patternWorld;
    }
    ${worldBoxTestStroke}
    ${viewPortTestOriginPoint}
    color.r += worldBoxTestStroke;
    color.g += viewPortTestOriginPoint;
    color.b += worldTestOriginPoint;
  #endif

  // =================================================

  fragColor = color;
  // fragColor = vec4(vec3(shape), 1.);
}
`;

export interface DitheringUniforms extends ShaderSizingUniforms {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_shape: number;
  u_type: number;
  u_pxSize: number;
  u_pxRounded: boolean;
}

export interface DitheringParams extends ShaderSizingParams, ShaderMotionParams {
  color1?: string;
  color2?: string;
  shape?: number;
  type?: number;
  pxSize?: number;
  pxRounded?: boolean;
}

import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declareSimplexNoise, colorBandingFix } from '../shader-utils.js';

export const simplexNoiseMeta = {
  maxColorCount: 10,
} as const;

/**
 * Color Gradient mapped over a combination of 2 Simplex noises
 *
 * Uniforms:
 * - u_colors (vec4[]), u_colorsCount (float used as integer)
 * - u_stepsPerColor (float, used as int): discrete color steps between u_colors
 * - u_softness: color transition sharpness (0 = hard edge, 1 = smooth fade)
 *
 * */

// language=GLSL
export const simplexNoiseFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;
uniform float u_scale;

uniform vec4 u_colors[${simplexNoiseMeta.maxColorCount}];
uniform float u_colorsCount;
uniform float u_stepsPerColor;
uniform float u_softness;

${sizingVariablesDeclaration}

out vec4 fragColor;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

//
// Description : GLSL 2D simplex noise function
//      Author : Ian McEwan, Ashima Arts
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License :
//  Copyright (C) 2011 Ashima Arts. All rights reserved.
//  Distributed under the MIT License. See LICENSE file.
//  https://github.com/ashima/webgl-noise
//
float snoise(vec2 v) {

  // Precompute values for skewed triangular grid
  const vec4 C = vec4(0.211324865405187,
  // (3.0-sqrt(3.0))/6.0
  0.366025403784439,
  // 0.5*(sqrt(3.0)-1.0)
  -0.577350269189626,
  // -1.0 + 2.0 * C.x
  0.024390243902439);
  // 1.0 / 41.0

  // First corner (x0)
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  // Other two corners (x1, x2)
  vec2 i1 = vec2(0.0);
  i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
  vec2 x1 = x0.xy + C.xx - i1;
  vec2 x2 = x0.xy + C.zz;

  // Do some permutations to avoid
  // truncation effects in permutation
  i = mod289(i);
  vec3 p = permute(
  permute(i.y + vec3(0.0, i1.y, 1.0))
  + i.x + vec3(0.0, i1.x, 1.0));

  vec3 m = max(0.5 - vec3(
  dot(x0, x0),
  dot(x1, x1),
  dot(x2, x2)
  ), 0.0);

  m = m*m;
  m = m*m;

  // Gradients:
  //  41 pts uniformly over a line, mapped onto a diamond
  //  The ring size 17*17 = 289 is close to a multiple
  //      of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  // Normalise gradients implicitly by scaling m
  // Approximation of: m *= inversesqrt(a0*a0 + h*h);
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

  // Compute final noise value at P
  vec3 g = vec3(0.0);
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * vec2(x1.x, x2.x) + h.yz * vec2(x1.y, x2.y);
  return 130.0 * dot(m, g);
}

float getNoise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

float steppedSmooth(float t, float steps, float softness) {
    float stepT = floor(t * steps) / steps;
    float f = t * steps - floor(t * steps);

    float fw = 0.005 / u_scale;
    float smoothed = smoothstep(.5 - softness * .5 - fw, .5 + softness * .5 + fw, f);

    return stepT + smoothed / steps;
}

void main() {
  vec2 shape_uv = v_patternUV;

  shape_uv *= .001;

  float t = .2 * u_time;

  float shape = .5 + .5 * getNoise(shape_uv, t);

  bool u_extraSides = true;

  float mixer = shape * (u_colorsCount - 1.);
  if (u_extraSides == true) {
    mixer = (shape - .5 / u_colorsCount) * u_colorsCount;
  }

  float steps = max(1., u_stepsPerColor);

  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${simplexNoiseMeta.maxColorCount}; i++) {
      if (i >= int(u_colorsCount)) break;

      float localT = clamp(mixer - float(i - 1), 0., 1.);
      localT = steppedSmooth(localT, steps, u_softness);

      vec4 c = u_colors[i];
      c.rgb *= c.a;
      gradient = mix(gradient, c, localT);
  }

  if (u_extraSides == true) {
   if ((mixer < 0.) || (mixer > (u_colorsCount - 1.))) {
     float localT = mixer + 1.;
     if (mixer > (u_colorsCount - 1.)) {
       localT = mixer - (u_colorsCount - 1.);
     }
     localT = steppedSmooth(localT, steps, u_softness);
     vec4 cFst = u_colors[0];
     cFst.rgb *= cFst.a;
     vec4 cLast = u_colors[int(u_colorsCount - 1.)];
     cLast.rgb *= cLast.a;
     gradient = mix(cLast, cFst, localT);
   }
  }

  vec3 color = gradient.rgb;
  float opacity = gradient.a;

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface SimplexNoiseUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_stepsPerColor: number;
  u_softness: number;
}

export interface SimplexNoiseParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  stepsPerColor?: number;
  softness?: number;
}

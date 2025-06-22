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

vec3 mod289(vec3 x) {
  return x - floor(x * (1. / 289.)) * 289.;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1. / 289.)) * 289.;
}

vec3 permute(vec3 x) {
  return mod289(((x * 34.) + 1.) * x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(.211324865405187, .366025403784439, -.577350269189626, .024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
  m = m*m;
  m = m*m;
  vec3 x = 2. * fract(p * C.www) - 1.;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - .85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130. * dot(m, g);
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
//  vec2 shape_uv = v_patternUV;
//  shape_uv *= .001;

  vec2 shape_uv = gl_FragCoord.xy / u_resolution.xy;


  float t = .2 * u_time;

  float shape = .5 + .5 * getNoise(shape_uv, t);

  // bool u_extraSides = true;
  //
  // float mixer = shape * (u_colorsCount - 1.);
  // if (u_extraSides == true) {
  //   mixer = (shape - .5 / u_colorsCount) * u_colorsCount;
  // }
  //
  // float steps = max(1., u_stepsPerColor);
  //
  // vec4 gradient = u_colors[0];
  // gradient.rgb *= gradient.a;
  // for (int i = 1; i < ${simplexNoiseMeta.maxColorCount}; i++) {
  //     if (i >= int(u_colorsCount)) break;
  //
  //     float localT = clamp(mixer - float(i - 1), 0., 1.);
  //     localT = steppedSmooth(localT, steps, u_softness);
  //
  //     vec4 c = u_colors[i];
  //     c.rgb *= c.a;
  //     gradient = mix(gradient, c, localT);
  // }
  //
  // if (u_extraSides == true) {
  //  if ((mixer < 0.) || (mixer > (u_colorsCount - 1.))) {
  //    float localT = mixer + 1.;
  //    if (mixer > (u_colorsCount - 1.)) {
  //      localT = mixer - (u_colorsCount - 1.);
  //    }
  //    localT = steppedSmooth(localT, steps, u_softness);
  //    vec4 cFst = u_colors[0];
  //    cFst.rgb *= cFst.a;
  //    vec4 cLast = u_colors[int(u_colorsCount - 1.)];
  //    cLast.rgb *= cLast.a;
  //    gradient = mix(cLast, cFst, localT);
  //  }
  // }
  //
  // vec3 color = gradient.rgb;
  // float opacity = gradient.a;
  //
  // $ {colorBandingFix}

  fragColor = vec4(vec3(shape), 1.);
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

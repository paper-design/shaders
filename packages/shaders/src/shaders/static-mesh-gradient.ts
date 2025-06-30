import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, declareRotate, colorBandingFix } from '../shader-utils.js';

export const staticMeshGradientMeta = {
  maxColorCount: 10,
} as const;

/**
 * A composition of N color spots (one per color) with 2 types of
 * distortions applied to the coordinate space
 *
 * Uniforms:
 * - u_colors (vec4[]), u_colorsCount (float used as integer)
 * - u_distortion: warp distortion
 * - u_swirl: vortex distortion
 *
 */

// language=GLSL
export const staticMeshGradientFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec4 u_colors[${staticMeshGradientMeta.maxColorCount}];
uniform float u_colorsCount;

uniform float u_distortion;
uniform float u_distortionSeed;
uniform float u_swirl;
uniform float u_swirlSeed;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareRotate}

//vec2 getPosition(int i, float t) {
//  float a = float(i) * .37;
//  float b = .6 + mod(float(i), 3.) * .3;
//  float c = .8 + mod(float(i + 1), 4.) * 0.25;
//
//  float x = sin(t * b + a);
//  float y = cos(t * c + a * 1.5);
//
//  return .5 + .5 * vec2(x, y);
//}

vec2 getPosition(float i) {
//  float a = float(i) * .37;
//  float b = .6 + mod(float(i), 3.) * .3;
//  float c = .8 + mod(float(i + 1), 4.) * 0.25;

  float x = sin(i * TWO_PI);
  float y = cos(i * TWO_PI);

  return .5 + .5 * vec2(x, y);
}

void main() {
  vec2 shape_uv = v_objectUV;

  shape_uv += .5;


  float radius = smoothstep(0., 1., length(shape_uv - .5));
  float center = 1. - radius;
  float distortionSeed = 10. * u_distortionSeed;
  for (float i = 1.; i <= 2.; i++) {
    shape_uv.x += u_distortion * center / i * sin(distortionSeed + i * .4 * smoothstep(.0, 1., shape_uv.y)) * cos(.2 * distortionSeed + i * 2.4 * smoothstep(.0, 1., shape_uv.y));
    shape_uv.y += u_distortion * center / i * cos(distortionSeed + i * 2. * smoothstep(.0, 1., shape_uv.x));
  }

  vec2 uvRotated = shape_uv;
  uvRotated -= vec2(.5);
  float angle = 3. * u_swirl * radius;
  uvRotated = rotate(uvRotated, -angle);
  uvRotated += vec2(.5);

  vec3 color = vec3(0.);
  float opacity = 0.;
  float totalWeight = 0.;

  float swirlSeed = 10. * u_swirlSeed;

  for (int i = 0; i < ${staticMeshGradientMeta.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;

//    vec2 pos = getPosition(i, 0.);
    vec2 pos = getPosition(float(i) / u_colorsCount);
    vec3 colorFraction = u_colors[i].rgb * u_colors[i].a;
    float opacityFraction = u_colors[i].a;

    float dist = 0.;
    if (mod(float(i), 2.) > 1.) {
      dist = length(shape_uv - pos);
    } else {
      dist = length(uvRotated - pos);
    }

    dist = pow(dist, 3.5);
    float weight = 1. / (dist + 1e-3);
    color += colorFraction * weight;
    opacity += opacityFraction * weight;
    totalWeight += weight;
  }

  color /= totalWeight;
  opacity /= totalWeight;

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface StaticMeshGradientUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_distortion: number;
  u_distortionSeed: number;
  u_swirl: number;
  u_swirlSeed: number;
}

export interface StaticMeshGradientParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  distortion?: number;
  distortionSeed?: number;
  swirl?: number;
  swirlSeed?: number;
}

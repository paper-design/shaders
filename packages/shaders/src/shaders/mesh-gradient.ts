import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import {
  sizingDebugVariablesDeclaration,
  sizingVariablesDeclaration,
  sizingUniformsDeclaration,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing.js';
import { declarePI, rotation2, proceduralHash21 } from '../shader-utils.js';

export const meshGradientMeta = {
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
 * - u_grainMixer: shape distortion
 * - u_grainOverlay: post-processing blending
 */

// language=GLSL
export const meshGradientFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colors[${meshGradientMeta.maxColorCount}];
uniform float u_colorsCount;

uniform float u_distortion;
uniform float u_swirl;
uniform float u_grainMixer;
uniform float u_grainOverlay;

${sizingVariablesDeclaration}
${sizingDebugVariablesDeclaration}
${sizingUniformsDeclaration}

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

float noise(vec2 n, vec2 seedOffset) {
  return valueNoise(n + seedOffset);
}

vec2 getPosition(int i, float t) {
  float a = float(i) * .37;
  float b = .6 + fract(float(i) / 3.) * .9;
  float c = .8 + fract(float(i + 1) / 4.);

  float x = sin(t * b + a);
  float y = cos(t * c + a * 1.5);

  return .5 + .5 * vec2(x, y);
}

void main() {
  vec2 shape_uv = v_objectUV;
  shape_uv += .5;

  vec2 grainUV = v_objectUV;
  // apply inverse transform to grain_uv so it respects the originXY
  float grainUVRot = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(grainUVRot), sin(grainUVRot), -sin(grainUVRot), cos(grainUVRot));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);
  grainUV = transpose(graphicRotation) * grainUV;
  grainUV *= u_scale;
  grainUV *= .7;
  grainUV -= graphicOffset;
  grainUV *= v_objectBoxSize;
  
  float grain = noise(grainUV, vec2(0.));
  float mixerGrain = .4 * u_grainMixer * (grain - .5);

  const float firstFrameOffset = 41.5;
  float t = .5 * (u_time + firstFrameOffset);

  float radius = smoothstep(0., 1., length(shape_uv - .5));
  float center = 1. - radius;
  for (float i = 1.; i <= 2.; i++) {
    shape_uv.x += u_distortion * center / i * sin(t + i * .4 * smoothstep(.0, 1., shape_uv.y)) * cos(.2 * t + i * 2.4 * smoothstep(.0, 1., shape_uv.y));
    shape_uv.y += u_distortion * center / i * cos(t + i * 2. * smoothstep(.0, 1., shape_uv.x));
  }

  vec2 uvRotated = shape_uv;
  uvRotated -= vec2(.5);
  float angle = 3. * u_swirl * radius;
  uvRotated = rotate(uvRotated, -angle);
  uvRotated += vec2(.5);

  vec3 color = vec3(0.);
  float opacity = 0.;
  float totalWeight = 0.;

  for (int i = 0; i < ${meshGradientMeta.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;

    vec2 pos = getPosition(i, t) + mixerGrain;
    vec3 colorFraction = u_colors[i].rgb * u_colors[i].a;
    float opacityFraction = u_colors[i].a;

    float dist = length(uvRotated - pos);

    dist = pow(dist, 3.5);
    float weight = 1. / (dist + 1e-3);
    color += colorFraction * weight;
    opacity += opacityFraction * weight;
    totalWeight += weight;
  }

  color /= max(1e-4, totalWeight);
  opacity /= max(1e-4, totalWeight);

  float rr = noise(rotate(grainUV, 1.), vec2(3.));
  float gg = noise(rotate(grainUV, 2.) + 10., vec2(-1.));
  float bb = noise(grainUV - 2., vec2(5.));
  vec3 grainColor = vec3(rr, gg, bb);
  color = mix(color, grainColor, .01 + .3 * u_grainOverlay);
  
  fragColor = vec4(color, opacity);
}
`;

export interface MeshGradientUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_distortion: number;
  u_swirl: number;
  u_grainMixer: number;
  u_grainOverlay: number;
}

export interface MeshGradientParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  distortion?: number;
  swirl?: number;
  grainMixer?: number;
  grainOverlay?: number;
}

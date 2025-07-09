import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import {
  sizingVariablesDeclaration,
  sizingUniformsDeclaration,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing.js';
import { declarePI, declareRotate, declareGrainShape, colorBandingFix } from '../shader-utils.js';

export const staticMeshGradientMeta = {
  maxColorCount: 10,
} as const;

/**
 * A composition of N color spots (one per color)
 *
 * Uniforms:
 * - u_colorBack (RGBA)
 * - u_colors (vec4[]), u_colorsCount (float used as integer)
 * - u_waveX, u_waveY - power of sine wave distortion along X and Y axes
 * - u_waveXShift, u_waveYShift - each wave phase offset
 * - u_mixing (0 .. 1, float) - 0 for stepped gradient, 0.5 for smooth transitions, 1 for pronounced color points
 * - u_grainMixer - shape distortion
 * - u_grainOverlay - post-processing blending
 *
 */

// language=GLSL
export const staticMeshGradientFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec4 u_colors[${staticMeshGradientMeta.maxColorCount}];
uniform float u_colorsCount;

uniform float u_positions;
uniform float u_waveX;
uniform float u_waveXShift;
uniform float u_waveY;
uniform float u_waveYShift;
uniform float u_mixing;
uniform float u_grainMixer;
uniform float u_grainOverlay;

${sizingVariablesDeclaration}
${sizingUniformsDeclaration}

out vec4 fragColor;

${declarePI}
${declareRotate}
${declareGrainShape}


vec2 getPosition(int i, float t) {
  float a = float(i) * .37;
  float b = .6 + mod(float(i), 3.) * .3;
  float c = .8 + mod(float(i + 1), 4.) * 0.25;

  float x = sin(t * b + a);
  float y = cos(t * c + a * 1.5);

  return .5 + .5 * vec2(x, y);
}

void main() {
  vec2 uv = v_objectUV;
  uv += .5;

  vec2 grainUV = rotate(v_objectUV, 2.) * 180.;
  float grain = grainShape(grainUV, vec2(100.));

  float radius = smoothstep(0., 1., length(uv - .5));
  float center = 1. - radius;
  for (float i = 1.; i <= 2.; i++) {
    uv.x += u_waveX * center / i * cos(TWO_PI * u_waveXShift + i * 2. * smoothstep(.0, 1., uv.y));
    uv.y += u_waveY * center / i * cos(TWO_PI * u_waveYShift + i * 2. * smoothstep(.0, 1., uv.x));
  }

  float mixerGrain = .4 * u_grainMixer * (grain - .3);

  vec3 color = vec3(0.);
  float opacity = 0.;
  float totalWeight = 0.;
  float positionSeed = 25. + .33 * u_positions;

  for (int i = 0; i < ${staticMeshGradientMeta.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;

    vec2 pos = getPosition(i, positionSeed) + mixerGrain;
    float dist = length(uv - pos);
    dist = length(uv - pos);

    vec3 colorFraction = u_colors[i].rgb * u_colors[i].a;
    float opacityFraction = u_colors[i].a;

    float power = 4.;
    if (u_mixing > .5) {
      power = mix(power, .75, 2. * (u_mixing - .5));
    }
    dist = pow(dist, power);

    float w = 1. / (dist + 1e-3);
    if (u_mixing < .5) {
      w = pow(w, mix(mix(.01, 5., clamp(w, 0., 1.)), 1., 2. * u_mixing));
    }
    color += colorFraction * w;
    opacity += opacityFraction * w;
    totalWeight += w;
  }

  color /= totalWeight;
  opacity /= totalWeight;

  float rr = grainShape(grainUV, vec2(0.));
  float gg = grainShape(grainUV, vec2(-1.));
  float bb = grainShape(grainUV, vec2(2.));
  vec3 grainColor = 2. * vec3(rr, gg, bb);
  color = mix(color, grainColor, u_grainOverlay * grain);

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface StaticMeshGradientUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_positions: number;
  u_waveX: number;
  u_waveXShift: number;
  u_waveY: number;
  u_waveYShift: number;
  u_mixing: number;
  u_grainMixer: number;
  u_grainOverlay: number;
}

export interface StaticMeshGradientParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  positions?: number;
  waveX?: number;
  waveXShift?: number;
  waveY?: number;
  waveYShift?: number;
  mixing?: number;
  grainMixer?: number;
  grainOverlay?: number;
}

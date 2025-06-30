import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, declareRotate, colorBandingFix } from '../shader-utils.js';

export const staticLinearGradientMeta = {
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
export const staticLinearGradientFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec4 u_colors[${staticLinearGradientMeta.maxColorCount}];
uniform float u_colorsCount;

uniform float u_distortion;
uniform float u_swirl;
uniform float u_mixing;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareRotate}


float steppedSmooth(float t, float steps, float softness) {
  float stepT = floor(t * steps) / steps;
  float f = t * steps - floor(t * steps);

  float fw = 0.;
  float smoothed = smoothstep(.5 - softness * .5 - fw, .5 + softness * .5 + fw, f);

  return stepT + smoothed / steps;
}


void main() {
  vec2 shape_uv = v_objectUV + .5;

  vec3 color = vec3(0.);
  float opacity = 1.;

  bool u_extraSides = false;
  float u_softness = 1.;

  float shape = shape_uv.y;
  float mixer = shape * (u_colorsCount - 1.);
  if (u_extraSides == true) {
    mixer = (shape - .5 / u_colorsCount) * u_colorsCount;
  }
  vec3 gradient = u_colors[0].rgb;
  for (int i = 1; i < ${staticLinearGradientMeta.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;
    float mLinear = clamp(mixer - float(i - 1), 0.0, 1.0);
    float mSmooth = smoothstep(0., 1., mLinear);
    float m = mix(mLinear, mSmooth, u_mixing);
    gradient = mix(gradient, u_colors[i].rgb, m);
  }

  if (u_extraSides == true) {
    if ((mixer < 0.) || (mixer > (u_colorsCount - 1.))) {
      float mLinear = mixer + 1.;
      if (mixer > (u_colorsCount - 1.)) {
        mLinear = mixer - (u_colorsCount - 1.);
      }
      float mSmooth = smoothstep(0., 1., mLinear);
      float m = mix(mLinear, mSmooth, u_mixing);
      gradient = mix(u_colors[int(u_colorsCount - 1.)].rgb, u_colors[0].rgb, m);
    }
  }
  
  color = gradient.rgb;

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
//  fragColor = vec4(vec3(v_objectUV.y + .5), 1.);
}
`;

export interface StaticLinearGradientUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_distortion: number;
  u_swirl: number;
  u_mixing: number;
}

export interface StaticLinearGradientParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  distortion?: number;
  swirl?: number;
  mixing?: number;
}

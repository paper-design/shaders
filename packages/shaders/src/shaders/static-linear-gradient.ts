import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import {
  sizingVariablesDeclaration,
  sizingUniformsDeclaration,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing.js';
import { declarePI, declareRotate, declareGrainShape, colorBandingFix } from '../shader-utils.js';

export const staticLinearGradientMeta = {
  maxColorCount: 10,
} as const;

/**
 * A composition of N color spots (one per color) with 2 types of
 * falloffTops applied to the coordinate space
 *
 * Uniforms:
 * - u_colors (vec4[]), u_colorsCount (float used as integer)
 * - u_falloffTop: warp falloffTop
 * - u_falloffBottom: vortex falloffTop
 *
 */

// language=GLSL
export const staticLinearGradientFragmentShader: string = `#version 300 es
precision mediump float;

uniform vec4 u_colors[${staticLinearGradientMeta.maxColorCount}];
uniform float u_colorsCount;

uniform float u_falloffTop;
uniform float u_falloffBottom;
uniform float u_mixing;
uniform bool u_repeatY;
uniform float u_grainMixer;
uniform float u_grainOverlay;

${sizingVariablesDeclaration}
${sizingUniformsDeclaration}

out vec4 fragColor;

${declarePI}
${declareRotate}
${declareGrainShape}


float remapFallOff(float f) {
  return mix(.2 + .8 * max(0., f + 1.), mix(1., 15., pow(f, 2.)), step(.0, f));
}

float symmetricSmooth(float x, float gammaIn, float gammaOut) {
  x = clamp(x, 0.0, 1.0);
  float inSide = 0.5 * pow(2.0 * x, gammaIn);
  float outSide = 1.0 - 0.5 * pow(2.0 * (1.0 - x), gammaOut);
  float t = smoothstep(.45, .55, x);
  return mix(inSide, outSide, t);
}

void main() {
  vec2 uv = v_objectUV + .5;
  
  float shape = uv.y;
  
  if (u_repeatY == true) {
    shape = mod(shape, 1.0);
  }

  float falloffTopMapped = remapFallOff(u_falloffTop);
  float falloffBottomMapped = remapFallOff(u_falloffBottom);
  shape = symmetricSmooth(shape, falloffTopMapped, falloffBottomMapped);

  vec2 grainUV = rotate(v_objectUV, 2.) * 180.;
  float grain = grainShape(grainUV, vec2(100.));

  float mixerGrain = 1.5 * u_grainMixer * (grain - .25);
  float mixer = shape * (u_colorsCount - 1.) + mixerGrain;
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${staticLinearGradientMeta.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;
    float mLinear = clamp(mixer - float(i - 1), 0.0, 1.0);
    float mSmooth = smoothstep(0., 1., mLinear);
    float m = mix(mLinear, mSmooth, u_mixing);
    vec4 c = u_colors[i];
    c.rgb *= c.a;
    gradient = mix(gradient, c, m);
  }

  vec3 color = gradient.rgb;
  float opacity = gradient.a;

  float rr = grainShape(grainUV, vec2(0.));
  float gg = grainShape(grainUV, vec2(-1.));
  float bb = grainShape(grainUV, vec2(2.));
  vec3 grainColor = 2. * vec3(rr, gg, bb);
  color = mix(color, grainColor, u_grainOverlay * grain);
  
  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface StaticLinearGradientUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_falloffTop: number;
  u_falloffBottom: number;
  u_mixing: number;
  u_repeatY: boolean;
  u_grainMixer: number;
  u_grainOverlay: number;
}

export interface StaticLinearGradientParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  falloffTop?: number;
  falloffBottom?: number;
  mixing?: number;
  repeatY?: boolean;
  grainMixer?: number;
  grainOverlay?: number;
}

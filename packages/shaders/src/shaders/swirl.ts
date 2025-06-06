import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declareSimplexNoise, declarePI, declareRotate, colorBandingFix } from '../shader-utils.js';

export const swirlMeta = {
  maxColorCount: 10,
} as const;

/**
 * Twisting radial bands
 *
 * Uniforms:
 * - u_colorBack (RGBA)
 * - u_colors (vec4[]), u_colorsCount (float used as integer)
 * - u_bandCount (float, used as int): number of sectors
 * - u_twist: sectors twist intensity (0 = linear)
 * - u_softness: color transition sharpness (0 = hard edge, 1 = smooth fade)
 * - u_noisePower, u_noiseFrequency: simplex noise distortion over the shape
 *
 */

export const swirlFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${swirlMeta.maxColorCount}];
uniform float u_colorsCount;
uniform float u_bandCount;
uniform float u_twist;
uniform float u_softness;
uniform float u_noisePower;
uniform float u_noiseFrequency;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareSimplexNoise}
${declareRotate}

void main() {
  vec2 shape_uv = v_objectUV;

  float l = length(shape_uv);

  float t = u_time;

  float angle = ceil(u_bandCount) * atan(shape_uv.y, shape_uv.x) + t;
  float angle_norm = angle / TWO_PI;

  float twist = 3. * clamp(u_twist, 0., 1.);
  float offset = pow(l, -twist) + angle_norm;

  float shape = fract(offset);
  shape = 1. - abs(2. * shape - 1.);
  shape += u_noisePower * snoise(pow(u_noiseFrequency, 2.) * shape_uv);

  float mid = smoothstep(.2, .4, pow(l, twist));
  shape = mix(0., shape, mid);

  shape = clamp(shape - .5 / u_colorsCount, 0., 1.);

  float edge_w = fwidth(shape);
  
  float totalShape = smoothstep(0., u_softness + 2. * edge_w, clamp(shape * u_colorsCount, 0., 1.));
  float mixer = shape * (u_colorsCount - 1.);

  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${swirlMeta.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;

    float localT = clamp(mixer - float(i - 1), 0., 1.);
    localT = smoothstep(.5 - .5 * u_softness, .5 + .5 * u_softness + edge_w, localT);

    vec4 c = u_colors[i];
    c.rgb *= c.a;
    gradient = mix(gradient, c, localT);
  }

  vec3 color = gradient.rgb * totalShape;
  float opacity = gradient.a * totalShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u_colorBack.a * (1.0 - opacity);

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface SwirlUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_bandCount: number;
  u_twist: number;
  u_softness: number;
  u_noiseFrequency: number;
  u_noisePower: number;
}

export interface SwirlParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  bandCount?: number;
  twist?: number;
  softness?: number;
  noiseFrequency?: number;
  noisePower?: number;
}

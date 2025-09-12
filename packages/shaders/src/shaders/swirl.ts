import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { simplexNoise, declarePI, rotation2, colorBandingFix } from '../shader-utils.js';

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
 * - u_noise, u_noiseFrequency: simplex noise distortion over the shape
 *
 */

// language=GLSL
export const swirlFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${swirlMeta.maxColorCount}];
uniform float u_colorsCount;
uniform float u_bandCount;
uniform float u_twist;
uniform float u_middle;
uniform float u_softness;
uniform float u_noise;
uniform float u_noiseFrequency;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${simplexNoise}
${rotation2}

void main() {
  vec2 shape_uv = v_objectUV;

  float l = length(shape_uv);

  float t = u_time;

  float angle = ceil(u_bandCount) * atan(shape_uv.y, shape_uv.x) + t;
  float angle_norm = angle / TWO_PI;

  float twist = 3. * clamp(u_twist, 0., 1.);
  float offset = pow(l, -twist) + angle_norm;

  // Calculate the radial frequency - how fast the pattern changes with distance
  float radial_freq = abs(dFdx(offset) * dFdx(l) + dFdy(offset) * dFdy(l)) / length(vec2(dFdx(l), dFdy(l)));
  // Or simpler approximation:
  // float radial_freq = abs(-twist * pow(l, -twist - 1.0)) * fwidth(l);

  float shape = fract(offset);
  shape = 1. - abs(2. * shape - 1.);
  shape += u_noise * snoise(15. * pow(u_noiseFrequency, 2.) * shape_uv);

  float mid = smoothstep(.1, .1 + 2. * fwidth(fract(offset)), pow(l, twist));
  shape = mix(0., shape, mid);

  float mixer = shape * u_colorsCount;
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  
  float outerShape = 0.;
  for (int i = 1; i < ${swirlMeta.maxColorCount + 1}; i++) {
    if (i > int(u_colorsCount)) break;

    float m = clamp(mixer - float(i - 1), 0., 1.);
    float aa = fwidth(m);
    m = smoothstep(.5 - .5 * u_softness - aa, .5 + .5 * u_softness + aa, m);

    if (i == 1) {
      outerShape = m;
    }

    vec4 c = u_colors[i - 1];
    c.rgb *= c.a;
    gradient = mix(gradient, c, m);
  }

  vec3 color = gradient.rgb * outerShape;
  float opacity = gradient.a * outerShape;

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
  u_middle: number;
  u_softness: number;
  u_noiseFrequency: number;
  u_noise: number;
}

export interface SwirlParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  bandCount?: number;
  twist?: number;
  middle?: number;
  softness?: number;
  noiseFrequency?: number;
  noise?: number;
}

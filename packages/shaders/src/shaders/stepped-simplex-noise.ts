import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingUniformsDeclaration,
  sizingPatternUV,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
import { declareSimplexNoise } from '../shader-utils';

/**
 * Stepped Simplex Noise by Ksenia Kondrashova
 * Calculates a combination of 2 simplex noises with result rendered as
 * an X-stepped 5-colored gradient
 *
 * Uniforms include:
 * u_color1 - the first gradient color
 * u_color2 - the second gradient color
 * u_color3 - the third gradient color
 * u_color4 - the fourth gradient color
 * u_color5 - the fifth gradient color
 * u_steps_number - the number of solid colors to show as a stepped gradient
 */
export const steppedSimplexNoiseFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

${sizingUniformsDeclaration}

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform vec4 u_color4;
uniform vec4 u_color5;
uniform float u_steps_number;

out vec4 fragColor;

${declareSimplexNoise}

float get_noise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

vec4 getColor(int index) {
  if (index == 0) return u_color1;
  if (index == 1) return u_color2;
  if (index == 2) return u_color3;
  if (index == 3) return u_color4;
  if (index == 4) return u_color5;
  return u_color1;
}

void main() {

  ${sizingPatternUV}
  uv *= .001;

  float t = u_time;

  float noise = .5 + .5 * get_noise(uv, t);
  noise = floor(noise * u_steps_number) / u_steps_number;

  vec3 color = u_color1.rgb * u_color1.a;
  float opacity = u_color1.a;
  for (int i = 0; i < 5; i++) {
    vec4 next_c = getColor(i + 1);
    float proportion = smoothstep((float(i) + .5) / 5., (float(i) + 2.) / 5., noise);
    color = mix(color, next_c.rgb * next_c.a, proportion);
    opacity = mix(opacity, next_c.a, proportion);
  }

  fragColor = vec4(color, opacity);
}
`;

export interface SteppedSimplexNoiseUniforms extends ShaderSizingUniforms {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_color4: [number, number, number, number];
  u_color5: [number, number, number, number];
  u_steps_number: number;
}

export interface SteppedSimplexNoiseParams extends ShaderSizingParams, ShaderMotionParams {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  color5?: string;
  stepsNumber?: number;
}

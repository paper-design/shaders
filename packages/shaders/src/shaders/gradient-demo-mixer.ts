import type {vec4} from '../types';

export const gradientDemoMixerMaxColorCount = 7;

export type GradientDemoMixerUniforms = {
    u_colors: vec4[];
    u_colors_count: number;
    u_test: number;
};

/**
 *
 * Uniforms include:
 * u_colors: An array of colors, each color is an array of 4 numbers [r, g, b, a]
 * u_colors_count: The number of colors in the u_colors array
 */

export const gradientDemoMixerFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_time;

uniform float u_test;
uniform vec4 u_colors[${gradientDemoMixerMaxColorCount}];
uniform float u_colors_count;

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;

  float mixer = pow(uv.x, u_test);

float t = uv.x * (u_colors_count - 1.);
vec3 gradient = u_colors[0].rgb;

for (int i = 1; i < ${gradientDemoMixerMaxColorCount}; i++) {
    if (i >= int(u_colors_count)) break;
    float localT = clamp(t - float(i - 1), 0.0, 1.0);
    gradient = mix(gradient, u_colors[i].rgb, localT);
}

  vec3 color = vec3(mixer);
  if (uv.y < .75) {
   color = gradient;
  }
  
  fragColor = vec4(color, 1.);
}
`;

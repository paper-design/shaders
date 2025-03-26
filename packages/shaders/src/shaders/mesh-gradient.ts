import type { vec4 } from '../types';

/** The array of colors can accept up to 10 colors */
export const meshGradientMaxColorCount = 10;

export type MeshGradientUniforms = {
  u_colors: vec4[];
  u_colors_count: number;
};

/**
 *
 * Uniforms include:
 * u_colors: An array of colors, each color is an array of 4 numbers [r, g, b, a]
 * u_colors_count: The number of colors in the u_colors array
 */

export const meshGradientFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_time;

uniform vec4 u_colors[${meshGradientMaxColorCount}];
uniform float u_colors_count;

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;

  float t = uv.x * float(u_colors_count);
  vec4 color = u_colors[0]; // Default to first color

  for (int i = 1; i < 10; i++) {
    if (i >= u_colors_count) break; // Ensure we don’t access out of bounds
    color = mix(color, u_colors[i], step(float(i), t));
  }
  fragColor = color;
}
`;

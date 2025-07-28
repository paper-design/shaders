import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import type { vec4 } from '../types.js';

export const tartanMeta = {
  maxStripeCount: 9,
} as const;

/**
 * Tartan patterns
 *
 * Uniforms:
 * - u_stripeCount: number of stripes in the pattern (float used as integer)
 * - u_stripeColors (vec4[])
 * - u_stripeWidths (mat3)
 *
 */

// language=GLSL
export const tartanFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_stripeCount;
uniform vec4[${tartanMeta.maxStripeCount}] u_stripeColors;
uniform mat3 u_stripeWidths;

${sizingVariablesDeclaration}

out vec4 fragColor;

void main() {
  vec2 uv = v_patternUV * 100.0;

  float[${tartanMeta.maxStripeCount}] cumulativeWidths;

  float totalWidth = 0.0;

  for (int i = 0; i < ${tartanMeta.maxStripeCount}; i++) {
    if (i >= int(u_stripeCount)) break;
    float width = float(u_stripeWidths[int(i / 3)][int(i % 3)]);
    cumulativeWidths[i] = (i == 0 ? 0.0 : cumulativeWidths[i - 1]) + width;
    totalWidth += width;
  }

  vec2 cell = mod(
    uv.xy,
    totalWidth * 2.0
  ) - totalWidth;

  // Color of vertical stripe.
  vec4 verticalColor;
  for (int i = 0; i < ${tartanMeta.maxStripeCount}; i++) {
    if (i >= int(u_stripeCount)) break;
    verticalColor = u_stripeColors[i];
    if (abs(cell.x) < cumulativeWidths[i]) {
      break;
    }
  }

  // Color of horizontal stripe.
  vec4 horizontalColor;
  for (int i = 0; i < ${tartanMeta.maxStripeCount}; i++) {
    if (i >= int(u_stripeCount)) break;
    horizontalColor = u_stripeColors[i];
    if (abs(cell.y) < cumulativeWidths[i]) {
      break;
    }
  }

  // Weave pattern.
  // See: https://en.wikipedia.org/wiki/Tartan#Weaving_construction
  float a = mod(uv.x + mod(floor(uv.y), 4.0), 4.0) / 4.0;

  fragColor = a < 0.5 ? verticalColor : horizontalColor;
}
`;

export interface TartanUniforms extends ShaderSizingUniforms {
  u_stripeColors: vec4[];
  u_stripeWidths: number[];
  u_stripeCount: number;
}

export interface TartanParams extends ShaderSizingParams {
  stripeColors?: string[];
  stripeWidths?: number[];
}

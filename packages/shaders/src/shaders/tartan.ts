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
 * - u_stripeColors: array of stripe colors (vec4[])
 * - u_stripeWidths: array of stripe widths (mat3 used as an array)
 * - u_weaveSize: width of thread used in the weave texture (float)
 * - u_weaveStrength: strength of weave texture (float)
 *
 */

// language=GLSL
export const tartanFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_stripeCount;
uniform vec4[${tartanMeta.maxStripeCount}] u_stripeColors;
uniform mat3 u_stripeWidths;
uniform float u_weaveSize;
uniform float u_weaveStrength;

${sizingVariablesDeclaration}

out vec4 fragColor;

void main() {
  vec2 uv = (v_patternUV * 100.0) / u_weaveSize;

  vec2 weave = mod(
      vec2(
          uv.x + floor(mod(uv.y, 4.0)),
          uv.y + floor(mod(uv.x, 4.0)) - 2.0
      ),
      4.0
  );

  // Color

  vec4 verticalColor, horizontalColor;

  float[${tartanMeta.maxStripeCount}] cumulativeWidths;

  float totalWidth = 0.0;

  for (int i = 0; i < ${tartanMeta.maxStripeCount}; i++) {
    if (i >= int(u_stripeCount)) break;
    float width = float(u_stripeWidths[int(i / 3)][int(i % 3)]);
    cumulativeWidths[i] = (i == 0 ? 0.0 : cumulativeWidths[i - 1]) + width;
    totalWidth += width;
  }

  vec2 stripe = mod(
      uv,
      totalWidth * 2.0
  ) - totalWidth;

  for (int i = 0; i < ${tartanMeta.maxStripeCount}; i++) {
    if (i >= int(u_stripeCount)) break;
    verticalColor = u_stripeColors[i];
    if (abs(stripe.x) < cumulativeWidths[i]) {
      break;
    }
  }

  for (int i = 0; i < ${tartanMeta.maxStripeCount}; i++) {
    if (i >= int(u_stripeCount)) break;
    horizontalColor = u_stripeColors[i];
    if (abs(stripe.y) < cumulativeWidths[i]) {
      break;
    }
  }

  fragColor = mix(
      verticalColor,
      horizontalColor,
      1.0 - step(2.0, weave.x)
  );

  // Texture

  vec2 brightness = vec2(0.0);

  brightness += smoothstep(0.0, 0.5, weave);
  brightness -= smoothstep(1.5, 2.0, weave);

  brightness += smoothstep(2.0, 2.25, weave);
  brightness -= smoothstep(2.75, 3.0, weave);

  brightness += smoothstep(3.0, 3.25, weave);
  brightness -= smoothstep(3.75, 4.0, weave);

  brightness *= u_weaveStrength;
  brightness += 1.0 - u_weaveStrength;

  fragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), fragColor, brightness.x * brightness.y);
}
`;

export interface TartanUniforms extends ShaderSizingUniforms {
  u_stripeColors: vec4[];
  u_stripeWidths: number[];
  u_stripeCount: number;
  u_weaveSize: number;
  u_weaveStrength: number;
}

export interface TartanParams extends ShaderSizingParams {
  stripeColors?: string[];
  stripeWidths?: number[];
  weaveSize?: number;
  weaveStrength?: number;
}

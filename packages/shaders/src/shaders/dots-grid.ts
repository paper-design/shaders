export type DotsGridUniforms = {
  u_dotSize: number;
  u_gridSpacingX: number;
  u_gridSpacingY: number;
};

/**
 * Dots Pattern
 *
 * Uniforms include:
 * u_dotSize: The base dot radius, px
 * u_gridSpacingX: Horizontal grid spacing, px
 * u_gridSpacingY: Vertical grid spacing, px
 */

export const dotsGridFragmentShader = `#version 300 es
precision highp float;

uniform float u_dotSize;
uniform float u_gridSpacingX;
uniform float u_gridSpacingY;
uniform vec2 u_resolution;
uniform float u_pxRatio;

out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy;

    uv /= u_pxRatio;

    vec2 grid = fract(uv / vec2(u_gridSpacingX, u_gridSpacingY)) + 1e-4;

    vec2 center = vec2(.5) - 1e-3;
    float dist = length((grid - center) * vec2(u_gridSpacingX, u_gridSpacingY));
    float radius = u_dotSize;

    float edge_width = fwidth(dist);
    float circle = smoothstep(radius + edge_width, radius - edge_width, dist);

    fragColor = vec4(vec3(circle), 1.);
}
`;

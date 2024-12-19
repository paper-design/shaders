export type DotsGridUniforms = {
  u_colorBack: [number, number, number, number];
  u_colorFill: [number, number, number, number];
  u_colorStroke: [number, number, number, number];
  u_dotSize: number;
  u_gridSpacingX: number;
  u_gridSpacingY: number;
  u_strokeWidth: number;
  u_sizeRange: number;
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

uniform vec4 u_colorBack;
uniform vec4 u_colorFill;
uniform vec4 u_colorStroke;
uniform float u_dotSize;
uniform float u_gridSpacingX;
uniform float u_gridSpacingY;
uniform float u_strokeWidth;
uniform float u_sizeRange;

uniform vec2 u_resolution;
uniform float u_pxRatio;

out vec4 fragColor;

float hash (vec2 st) {
  return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

void main() {
    vec2 uv = gl_FragCoord.xy;

    uv /= u_pxRatio;

    vec2 grid = fract(uv / vec2(u_gridSpacingX, u_gridSpacingY)) + 1e-4;
    vec2 grid_idx = floor(uv / vec2(u_gridSpacingX, u_gridSpacingY));
    float randomizer = hash(grid_idx);

    vec2 center = vec2(.5) - 1e-3;
    float dist = length((grid - center) * vec2(u_gridSpacingX, u_gridSpacingY));    

    float edge_width = fwidth(dist);
    float base_size = u_dotSize * (1. - randomizer * u_sizeRange);
    float circle_outer = smoothstep(base_size + edge_width, base_size - edge_width, dist);
    float circle_inner = smoothstep(base_size - u_strokeWidth + edge_width, base_size - u_strokeWidth - edge_width, dist);
    float stroke = clamp(circle_outer - circle_inner, 0., 1.);

    vec3 color = u_colorBack.rgb * u_colorBack.a;
    color = mix(color, u_colorFill.rgb * u_colorFill.a, circle_inner * u_colorFill.a);
    color = mix(color, u_colorStroke.rgb * u_colorStroke.a, stroke * u_colorStroke.a);
    
    float opacity = u_colorBack.a;
    opacity += u_colorFill.a * circle_inner;
    opacity += u_colorStroke.a * stroke;
    
    fragColor = vec4(color, opacity);
}
`;

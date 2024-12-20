export type DotsGridUniforms = {
  u_colorBack: [number, number, number, number];
  u_colorFill: [number, number, number, number];
  u_colorStroke: [number, number, number, number];
  u_dotSize: number;
  u_gridSpacingX: number;
  u_gridSpacingY: number;
  u_strokeWidth: number;
  u_sizeRange: number;
  u_opacityRange: number;
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
uniform float u_opacityRange;

uniform vec2 u_resolution;
uniform float u_pxRatio;

out vec4 fragColor;

float hash (vec2 st) {
  return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

void main() {
    vec2 uv = gl_FragCoord.xy;
    uv.y = u_resolution.y - uv.y;

    uv /= u_pxRatio;

    vec2 grid = fract(uv / vec2(u_gridSpacingX, u_gridSpacingY)) + 1e-4;
    vec2 grid_idx = floor(uv / vec2(u_gridSpacingX, u_gridSpacingY));
    float size_randomizer = hash(grid_idx);
    float opacity_randomizer = hash(grid_idx * 2. + 1000.);

    vec2 center = vec2(.5) - 1e-3;
    float dist = length((grid - center) * vec2(u_gridSpacingX, u_gridSpacingY));    

    float edge_width = fwidth(dist);
    float base_size = u_dotSize * (1. - size_randomizer * u_sizeRange);
    float circle_outer = smoothstep(base_size + edge_width, base_size - edge_width, dist);
    float circle_inner = smoothstep(base_size - u_strokeWidth + edge_width, base_size - u_strokeWidth - edge_width, dist);
    float stroke = clamp(circle_outer - circle_inner, 0., 1.);

    float dot_opacity = 1. - opacity_randomizer * u_opacityRange;

    vec3 color = u_colorBack.rgb * u_colorBack.a;
    color = mix(color, u_colorFill.rgb * u_colorFill.a * dot_opacity, circle_inner * u_colorFill.a * dot_opacity);
    color = mix(color, u_colorStroke.rgb * u_colorStroke.a * dot_opacity, stroke * u_colorStroke.a * dot_opacity);
    
    float opacity = u_colorBack.a;
    opacity += u_colorFill.a * circle_inner * dot_opacity;
    opacity += u_colorStroke.a * stroke * dot_opacity;
    
    fragColor = vec4(color, opacity);
}
`;

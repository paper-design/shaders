export type DotsGridUniforms = {
  u_scale: number;
  u_dotSize: number;
  u_gridSpacing: number;
};

/**
 * Dots Pattern with dots moving around their grid position
 * The artwork by Ksenia Kondrashova
 * Renders a dot pattern with dots placed in the center of each cell of animated Voronoi diagram
 *
 * Uniforms include:
 * u_color1: The first dots color
 * u_color2: The second dots color
 * u_color3: The third dots color
 * u_color4: The fourth dots color
 * u_scale: The scale applied to pattern
 * u_dotSize: The base dot radius (relative to cell size)
 * u_dotSizeRange: Dot radius to vary between the cells
 * u_spreading: How far dots are moving around the straight grid
 */

export const dotsGridFragmentShader = `#version 300 es
precision mediump float;

// uniform vec4 u_color1;
// uniform vec4 u_color2;
// uniform vec4 u_color3;
// uniform vec4 u_color4;
// uniform float u_dotSizeRange;
// uniform float u_spreading;
// uniform float u_ratio;

uniform float u_dotSize;
uniform float u_gridSpacing;
uniform float u_scale;
uniform vec2 u_resolution;

out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv -= .5;
    uv *= (.001 * u_scale * u_resolution);
    uv += .5;
    
    uv.x /= u_gridSpacing;
    
    vec2 grid = fract(uv);
    vec2 center = vec2(.5);
    vec2 dist_vec = (grid - center);
    dist_vec.x *= u_gridSpacing;
    float dist = length(dist_vec);
    float radius = u_dotSize;

    float edge_width = fwidth(dist);
    float circle = smoothstep(radius + edge_width, radius - edge_width, dist);

    fragColor = vec4(vec3(circle), 1.);
}
`;

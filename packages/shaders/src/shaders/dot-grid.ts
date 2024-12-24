/** Possible values for the shape uniform */
export const DotGridShapes = {
  Circle: 0,
  Diamond: 1,
  Square: 2,
  Triangle: 3,
} as const;
export type DotGridShape = (typeof DotGridShapes)[keyof typeof DotGridShapes];

export type DotGridUniforms = {
  u_colorBack: [number, number, number, number];
  u_colorFill: [number, number, number, number];
  u_colorStroke: [number, number, number, number];
  u_dotSize: number;
  u_gridSpacingX: number;
  u_gridSpacingY: number;
  u_strokeWidth: number;
  u_sizeRange: number;
  u_opacityRange: number;
  u_shape: DotGridShape;
};

/**
 * Dot Grid Pattern
 *
 * Uniforms include:
 * u_colorBack: Background color
 * u_colorFill: Dots fill color
 * u_colorStroke: Dots stroke color
 * u_dotSize: The base dot radius, px
 * u_strokeWidth: The stroke (to be subtracted from u_dotSize), px
 * u_gridSpacingX: Horizontal grid spacing, px
 * u_gridSpacingY: Vertical grid spacing, px
 * u_sizeRange: Variety of dot size, 0..1
 * u_opacityRange: Variety of dot opacity to be applied equally to fill and stroke, 0..1
 * u_shape: Shape code: 'Circle': 0, 'Diamond': 1, 'Square': 2, 'Triangle': 3
 */

export const dotGridFragmentShader = `#version 300 es
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
uniform float u_shape;

uniform vec2 u_resolution;
uniform float u_pixelRatio;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

float hash(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float polygon(vec2 p, float N, float rot) {
    float a = atan(p.x, p.y) + rot;
    float r = TWO_PI / float(N);

    return cos(floor(.5 + a/r) * r - a) * length(p);
}

void main() {
    vec2 uv = gl_FragCoord.xy;
    uv.y = u_resolution.y - uv.y;

    uv /= u_pixelRatio;

    vec2 grid = fract(uv / vec2(u_gridSpacingX, u_gridSpacingY)) + 1e-4;
    vec2 grid_idx = floor(uv / vec2(u_gridSpacingX, u_gridSpacingY));
    float size_randomizer = hash(grid_idx);
    float opacity_randomizer = hash(grid_idx * 2. + 1000.);

    vec2 center = vec2(0.5) - 1e-3;
    vec2 p = (grid - center) * vec2(u_gridSpacingX, u_gridSpacingY);

    float base_size = u_dotSize * (1. - size_randomizer * u_sizeRange);
    float stroke_width = u_strokeWidth;

    float dist;
    if (u_shape < 0.5) {
        // Circle
        dist = length(p);
    } else if (u_shape < 1.5) {
        // Diamond
        dist = polygon(1.5 * p, 4., .25 * PI);
    } else if (u_shape < 2.5) {
        // Square
        dist = polygon(1.5 * p, 4., 1e-3);
    } else {
        // Triangle
        p = p * 2. - 1.;
        p.y -= .75 * base_size;
        stroke_width *= 2.;
        dist = polygon(p, 3., 1e-3);
    }

    float edge_width = fwidth(dist);
    float shape_outer = smoothstep(base_size + edge_width, base_size - edge_width, dist);
    float shape_inner = smoothstep(base_size - u_strokeWidth + edge_width, base_size - u_strokeWidth - edge_width, dist);
    float stroke = clamp(shape_outer - shape_inner, 0., 1.);

    float dot_opacity = 1. - opacity_randomizer * u_opacityRange;

    vec3 color = u_colorBack.rgb * u_colorBack.a;
    color = mix(color, u_colorFill.rgb * u_colorFill.a * dot_opacity, shape_inner * u_colorFill.a * dot_opacity);
    color = mix(color, u_colorStroke.rgb * u_colorStroke.a * dot_opacity, stroke * u_colorStroke.a * dot_opacity);

    float opacity = u_colorBack.a;
    opacity += u_colorFill.a * shape_inner * dot_opacity;
    opacity += u_colorStroke.a * stroke * dot_opacity;

    fragColor = vec4(color, opacity);
}
`;

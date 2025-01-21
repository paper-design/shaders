/** Possible values for the shape uniform */
export const DotsGridShapes = {
  Circle: 0,
  Diamond: 1,
  Square: 2,
  Triangle: 3,
} as const;
export type DotsGridShape = (typeof DotsGridShapes)[keyof typeof DotsGridShapes];

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
  u_shape: DotsGridShape;
};

/**
 * Dot Grid Pattern
 * (the size parameters are set in pixels)
 *
 * Uniforms include:
 * u_colorBack - the background color
 * u_colorFill - the dots fill color
 * u_colorStroke - the dots stroke color
 * u_dotSize (px) - the base dot radius
 * u_strokeWidth (px) - the stroke (to be subtracted from u_dotSize)
 * u_gridSpacingX (px) - horizontal grid spacing
 * u_gridSpacingY (px) - xertical grid spacing
 * u_sizeRange (0 .. 1) - variety of dot size
 * u_opacityRange(0 .. 1) - variety of dot opacity to be applied equally to fill and stroke
 * u_shape - shape code (0 - circle, 1 - diamond, 2 - square, 3 - triangle)
 */

export const dotsGridFragmentShader = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;

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

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

float hash(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
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
    float size_randomizer = .5 + .5 * snoise(2. * vec2(grid_idx.x * 100., grid_idx.y));
    float opacity_randomizer = .5 + .5 * snoise(2. * vec2(grid_idx.y, grid_idx.x));

    vec2 center = vec2(0.5) - 1e-3;
    vec2 p = (grid - center) * vec2(u_gridSpacingX, u_gridSpacingY);

    float base_size = u_dotSize * (1. - size_randomizer * clamp(u_sizeRange, 0., 1.));
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

    float dot_opacity = max(0., 1. - opacity_randomizer * clamp(u_opacityRange, 0., 1.));

    vec3 color = u_colorBack.rgb * u_colorBack.a;
    color = mix(color, u_colorFill.rgb, u_colorFill.a * dot_opacity * shape_inner);
    color = mix(color, u_colorStroke.rgb, u_colorStroke.a * dot_opacity * stroke);

    float opacity = u_colorBack.a;
    opacity += u_colorFill.a * shape_inner * dot_opacity;
    opacity += u_colorStroke.a * stroke * dot_opacity;

    fragColor = vec4(color, opacity);
}
`;

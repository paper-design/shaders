export type WarpUniforms = {
  u_scale: number;
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_proportion: number;
  u_distortion: number;
  u_swirl: number;
  u_swirlIterations: number;
};

/**
 * 3d Perlin noise with exposed parameters
 *
 * Uniforms include:
 * u_scale - the scale applied to user space
 * u_color1 - the first pattern color
 * u_color2 - the second pattern color
 * u_color3 - the third pattern color
 * u_proportion (0 .. 1) - the proportion between colors (on 0.5 colors are at least contrast)
 * u_distortion - the distortion over the UV coordinate (applied before the overlapping swirl)
 * u_swirl - the power of swirly distortion
 * u_swirlIterations - the number of swirl iterations (layering curves effect)
 *
 */

export const warpFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_proportion;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_swirlIterations;


out vec4 fragColor;

#define TWO_PI 6.28318530718

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer) {
    vec3 color1 = c1.rgb * c1.a;
    vec3 color2 = c2.rgb * c2.a;
    vec3 color3 = c3.rgb * c3.a;
    float r1 = smoothstep(.0, .7, mixer);
    float r2 = smoothstep(.3, 1., mixer);
    vec3 blended_color_2 = mix(color1, color2, r1);
    float blended_opacity_2 = mix(c1.a, c2.a, r1);
    vec3 c = mix(blended_color_2, color3, r2);
    float o = mix(blended_opacity_2, c3.a, r2);
    return vec4(c, o);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float t = .5 * u_time;

    uv -= .5;
    uv *= (.01 * u_scale * u_resolution);
    uv /= u_pixelRatio;
    uv += .5;
    
    float n1 = noise(uv * 1. + t);
    float n2 = noise(uv * 2. - t);
    float angle = n1 * TWO_PI;
    uv.x += u_distortion * n2 * cos(angle);
    uv.y += u_distortion * n2 * sin(angle);

    float iterations_number = ceil(clamp(u_swirlIterations, 1., 30.));
    for (float i = 1.; i <= iterations_number; i++) {
        uv.x += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.5 * uv.y);
        uv.y += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1. * uv.x);
    }
    
    float shape = .5 + .5 * sin(uv.x) * cos(uv.y);
    shape = pow(shape, 1e-2 + 2.5 * max(0., u_proportion));
    
    vec4 color_mix = blend_colors(u_color1, u_color2, u_color3, shape);
    
    fragColor = vec4(color_mix.rgb, color_mix.a);
}
`;

export type WarpUniforms = {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_scale: number;
  u_distortion: number;
  u_swirl: number;
  u_iterations: number;
};

/**
 * 3d Perlin noise with exposed parameters
 * Based on https://www.shadertoy.com/view/NlSGDz
 *
 * Uniforms include:
 * u_color1: The first (background) color
 * u_color2: The second color
 * u_scale: The scale applied to coordinates
 *
 */

export const warpFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform float u_scale;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_iterations;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

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


void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float t = u_time;

    uv -= .5;
    uv *= (.01 * u_scale * u_resolution);
    uv /= u_pixelRatio;
    uv += .5;
    
    float n1 = noise(uv * 1. + t);
    float n2 = noise(uv * 2. - t);
    float angle = n1 * TWO_PI;
    uv.x += u_distortion * n2 * cos(angle);
    uv.y += u_distortion * n2 * sin(angle);

    for (float i = 1.; i <= ceil(u_iterations); i++) {
       float r = .0 * random(vec2(i));
        uv.x += (u_swirl + r) / i * cos(t + i * 1.5 * uv.y);
        uv.y += (u_swirl + r) / i * cos(t + i * 1. * uv.x);
    }

    float shape = .5 + .5 * sin(2.0 * uv.x) * sin(2.0 * uv.y);

    vec3 color = mix(u_color1.rgb * u_color1.a, u_color2.rgb * u_color2.a, shape);
    float opacity = mix(u_color1.a, u_color2.a, shape);
    
    fragColor = vec4(color, opacity);
}
`;

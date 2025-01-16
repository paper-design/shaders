export type WarpUniforms = {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_scale: number;
  u_octaveCount: number;
  u_persistence: number;
  u_lacunarity: number;
  u_contour: number;
  u_proportion: number;
};

/**
 * 3d Perlin noise with exposed parameters
 * Based on https://www.shadertoy.com/view/NlSGDz
 *
 * Uniforms include:
 * u_color1: The first (background) color
 * u_color2: The second color
 * u_scale: The scale applied to coordinates
 * u_octaveCount: Number of octaves for Perlin noise. Higher values increase the complexity of the noise
 * u_persistence: Controls the amplitude of each successive octave in Perlin noise. Lower values make higher octaves less pronounced
 * u_lacunarity: Controls the frequency of each successive octave in Perlin noise. Higher values increase the detail
 * u_proportion: Adjusts the brightness of the noise, shifting the perceived balance between u_color1 and u_color2
 * u_contour: Controls the sharpness of the transition between u_color1 and u_color2 in the noise output. Values close to 1 make the transition sharper
 *
 */

export const warpFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform float u_scale;
uniform float u_octaveCount;
uniform float u_persistence;
uniform float u_lacunarity;
uniform float u_proportion;
uniform float u_contour;

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
    uv *= (.002 * u_scale * u_resolution);
    uv /= u_pixelRatio;
    uv += .5;
    
    float n1 = noise(uv * 2.0 + t * 0.3);
    float n2 = noise(uv * 4.0 - t * 0.6);
    float angle = n1 * 2.;
    float radius = n2 * .1;

    uv.x += radius * cos(angle);
    uv.y += radius * sin(angle);

    for (float i = 1.0; i < 10.0; i++) {
        uv.x += 0.6 / i * cos(i * 2.5 * uv.y + t);
        uv.y += 0.6 / i * cos(i * 1.5 * uv.x + t);
    }
    float shape = 0.1 / abs(sin(t - uv.y - uv.x));
    
    vec3 color = mix(u_color1.rgb * u_color1.a, u_color2.rgb * u_color1.a, shape);
    

    fragColor = vec4(color, 1.0);
}
`;

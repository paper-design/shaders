export type SmokeRingUniforms = {
  u_colorBack: [number, number, number, number];
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_scale: number;
  u_thickness: number;
};

/**
 * Smoke Ring, based on https://codepen.io/ksenia-k/full/zYyqRWE
 * Renders a fractional Brownian motion (fBm) noise over the
 * polar coordinates masked with ring shape
 *
 * Uniforms include:
 * u_colorBack: The back color of the scene
 * u_color1: Main color of the ring
 * u_color2: The third color of the mesh gradient
 * u_color4: The fourth color of the mesh gradient
 * u_scale: The scale of the noise
 * u_thickness: The thickness of the ring
 */

export const smokeRingFragmentShader = `

  precision highp float;

  uniform vec4 u_colorBack;
  uniform vec4 u_color1;
  uniform vec4 u_color2;
  uniform float u_scale;
  uniform float u_thickness;
  uniform vec2 u_resolution;
  uniform float u_time;

    #define TWO_PI 6.28318530718
    #define PI 3.14159265358979323846

    float rand(vec2 n) {
        return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    }
    float noise(vec2 n) {
        const vec2 d = vec2(0.0, 1.0);
        vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
        return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
    }
    float fbm(vec2 n) {
        float total = 0.0, amplitude = .4;
        for (int i = 0; i < 12; i++) {
            total += noise(n) * amplitude;
            n *= 1.8;
            amplitude *= 0.6;
        }
        return total;
    }

    void main() {

        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float ratio = u_resolution.x / u_resolution.y;

        uv *= 8.;
        uv.x *= ratio;

        float t = u_time;
        float noise_left = fbm(uv + vec2(0., t));

                
        gl_FragColor = vec4(vec3(noise_left, noise_left, 0.), 1.);
    }
`;

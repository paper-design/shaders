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

  float random (in vec2 st) {
      return fract(sin(dot(st.xy,
                           vec2(12.9898,78.233)))*
          43758.5453123);
  }
  
  // Based on Morgan McGuire @morgan3d
  // https://www.shadertoy.com/view/4dS3Wd
  float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
  
      // Four corners in 2D of a tile
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
  
      vec2 u = f * f * (3.0 - 2.0 * f);
  
      return mix(a, b, u.x) +
              (c - a)* u.y * (1.0 - u.x) +
              (d - b) * u.x * u.y;
  }
  
  #define OCTAVES 10
  float fbm (in vec2 st) {
      // Initial values
      float value = 0.0;
      float amplitude = .5;
      float frequency = 0.;
      //
      // Loop of octaves
      for (int i = 0; i < OCTAVES; i++) {
          value += amplitude * noise(st);
          st *= 2.;
          amplitude *= .5;
      }
      return value;
  }


    void main() {

        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float ratio = u_resolution.x / u_resolution.y;

        uv *= 8.;
        uv.x *= ratio;

        float t = u_time;
        float noise_left = fbm(uv + vec2(0., t));

                
        gl_FragColor = vec4(vec3(noise_left, 0., 0.), 1.);
    }
`;

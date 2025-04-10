import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingUniformsDeclaration,
  sizingSquareUV,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
import {declarePI, declareSimplexNoise, colorBandingFix} from '../shader-utils';

/**
 * Mesh Gradient, based on https://www.shadertoy.com/view/wdyczG
 * Renders a mesh gradient with a rotating noise pattern
 * and several layers of fractal noise
 *
 * Uniforms include:
 * u_color1: The first color of the mesh gradient
 * u_color2: The second color of the mesh gradient
 * u_color3: The third color of the mesh gradient
 * u_color4: The fourth color of the mesh gradient
 */
export const meshGradientFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

${sizingUniformsDeclaration}

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform vec4 u_color4;
uniform float u_test;

out vec4 fragColor;

${declareSimplexNoise}
${declarePI}


vec2 getPosition(int i, float t) {
  if (i == 0) return 0.5 + 0.5 * vec2(sin(t), cos(t * 1.2));
  if (i == 1) return 0.5 + 0.5 * vec2(cos(t * 0.9 + 2.0), sin(t * 1.1 + 1.0));
  if (i == 2) return 0.5 + 0.5 * vec2(sin(t * 0.6 + 3.0), sin(t * 1.7));
  return 0.5 + 0.5 * vec2(sin(t * 1.3 + 1.5), cos(t * 0.7 + 4.0));

  // if (i == 0) return vec2(0.);
  // if (i == 1) return vec2(1., 0.);
  // if (i == 2) return vec2(0., 1.);
  // return vec2(1.);

  // if (i == 0) return 0.25 + 0.25 * vec2(sin(t), cos(t * 1.2));
  // if (i == 1) return 0.25 + 0.75 * vec2(cos(t * 0.9 + 2.0), sin(t * 1.1 + 1.0));
  // if (i == 2) return 0.75 + 0.25 * vec2(sin(t * 0.6 + 3.0), sin(t * 1.7));
  // return 0.75 + 0.75 * vec2(sin(t * 1.3 + 1.5), cos(t * 0.7 + 4.0));
}

vec3 getColor(int i) {
  if (i == 0) return u_color1.rgb;
  if (i == 1) return u_color2.rgb;
  if (i == 2) return u_color3.rgb;
  return u_color4.rgb;
}

float get_noise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

void main() {
  ${sizingSquareUV}
   uv += .5;

  float t = .6 * u_time;
  
  vec3 color = vec3(0.0);
  float totalWeight = 0.0;
  
  float iterations_number = 3.;
  float center = 1. - smoothstep(0., 1., length(uv - .5));
  for (float i = 1.; i <= iterations_number; i++) {
    uv.x += u_test * center / i * cos(t + i * 2. * uv.y);
    uv.y += u_test * center / i * cos(t + i * 1.5 * uv.x);
  }


  for (int i = 0; i < 4; i++) {

    vec2 pos = getPosition(i, .5 * t);
    vec3 col = getColor(i);
    float dist = length(uv - pos);
    
    dist = pow(dist, 4.);

    float weight = 1. / (dist + 1e-3);

    color += col * weight;
    totalWeight += weight;
  }

  color /= totalWeight;
  
  float opacity = 1.;
  
  ${colorBandingFix}
  
  fragColor = vec4(color, opacity);
}
`;

export interface MeshGradientUniforms extends ShaderSizingUniforms {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_color4: [number, number, number, number];
  u_test: number;
}

export interface MeshGradientParams extends ShaderSizingParams, ShaderMotionParams {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  test: number;
}

import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingUniformsDeclaration,
  sizingSquareUV,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
import {declarePI, colorBandingFix} from '../shader-utils';

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

out vec4 fragColor;

${declarePI}

vec2 getPosition(int i, float t) {
  if (i == 0) return 0.5 + 0.4 * vec2(sin(t), cos(t * 1.2));
  if (i == 1) return 0.5 + 0.45 * vec2(cos(t * 0.9 + 2.0), sin(t * 1.1 + 1.0));
  if (i == 2) return 0.5 + 0.5 * vec2(sin(t * 0.6 + 3.0), sin(t * 1.7));
  return 0.5 + 0.43 * vec2(sin(t * 1.3 + 1.5), cos(t * 0.7 + 4.0));
}

vec3 getColor(int i) {
  if (i == 0) return u_color1.rgb;
  if (i == 1) return u_color2.rgb;
  if (i == 2) return u_color3.rgb;
  return u_color4.rgb;
}

void main() {
  ${sizingSquareUV}
   uv += .5;

  float t = u_time * 0.5;
  
  vec3 accumColor = vec3(0.0);
  float accumWeight = 0.0;
  
  for (int i = 0; i < 4; i++) {
    vec2 pos = getPosition(i, t);
    vec3 col = getColor(i);
  
    float d = distance(uv, pos);
    d = pow(d, 6.);
    float w = 1. / (d + 1e-3);
  
    accumColor += col * w;
    accumWeight += w;
  }
  
  vec3 color = accumColor / accumWeight;
  
  float opacity = 1.;
  
  fragColor = vec4(color, opacity);
}
`;

export interface MeshGradientUniforms extends ShaderSizingUniforms {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_color4: [number, number, number, number];
}

export interface MeshGradientParams extends ShaderSizingParams, ShaderMotionParams {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
}

import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingUniformsDeclaration,
  sizingSquareUV,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
import { declareSimplexNoise, declarePI, declareRotate, colorBandingFix } from '../shader-utils';

/**
 */
export const swirlFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

${sizingUniformsDeclaration}

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_bandCount;
uniform float u_twist;

out vec4 fragColor;

${declarePI}
${declareSimplexNoise}
${declareRotate}


void main() {
  ${sizingSquareUV}
    
  float l = length(uv);

  float t = u_time;

  float angle = ceil(u_bandCount) * atan(uv.y, uv.x) + t;
  float angle_norm = angle / TWO_PI;  
    
  float twist = 3. * clamp(u_twist, 0., 1.);
  float offset = pow(l, -twist) + angle_norm;
  
  float stripe_map = fract(offset);
  stripe_map = 1. - abs(2. * stripe_map - 1.);

  float mid = smoothstep(.0, .25, pow(l, twist));
  stripe_map = mix(.0, stripe_map, mid);
  
  vec3 color = vec3(stripe_map);
  float opacity = 1.;

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface SwirlUniforms extends ShaderSizingUniforms {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_bandCount: number;
  u_twist: number;
}

export interface SwirlParams extends ShaderSizingParams, ShaderMotionParams {
  color1?: string;
  color2?: string;
  color3?: string;
  bandCount?: number;
  twist?: number;
}

import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declareRotate, colorBandingFix } from '../shader-utils';

/**
 * Neuro Noise Pattern
 * The original artwork: https://codepen.io/ksenia-k/full/vYwgrWv by Ksenia Kondrashova
 * Renders a fractal-like structure made of several layers of since-arches
 *
 * Uniforms include:
 * u_colorFront - the front color of pattern
 * u_colorBack - the back color of pattern
 * u_brightness - the power (brightness) of pattern lines
 */
export const neuroNoiseFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform vec4 u_colorTest;
uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_brightness;
uniform float u_depth;


${sizingVariablesDeclaration}

out vec4 fragColor;

${declareRotate}

float neuroShape(vec2 uv, float t) {
  vec2 sine_acc = vec2(0.);
  vec2 res = vec2(0.);
  float scale = 8.;

  for (int j = 0; j < 15; j++) {
    uv = rotate(uv, 1.);
    sine_acc = rotate(sine_acc, 1.);
    vec2 layer = uv * scale + float(j) + sine_acc - t;
    sine_acc += sin(layer);
    res += (.5 + .5 * cos(layer)) / scale;
    scale *= (1.2);
  }
  return res.x + res.y;
}

void main() {
  vec2 shape_uv = v_patternUV;

  shape_uv *= .002;

  float t = .5 * u_time;

  float noise = neuroShape(shape_uv, t);

  float depth = (1. - clamp(u_depth, 0., 1.));
  noise = u_brightness * pow(noise, 2.);
  noise = pow(noise, 1. + 6. * depth);
  noise = min(1.4, noise);
  
  float blend = smoothstep(0.7, 1.4, noise);

  vec4 frontC = u_colorFront;
  frontC.rgb *= frontC.a;
  vec4 testC = u_colorTest;
  testC.rgb *= testC.a;
  vec4 blendFront = mix(frontC, testC, blend);

  float safeNoise = max(noise, 0.0);
  vec3 color = blendFront.rgb * safeNoise;
  float opacity = clamp(blendFront.a * safeNoise, 0., 1.);
  
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);
  
  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface NeuroNoiseUniforms extends ShaderSizingUniforms {
  u_colorTest: [number, number, number, number];
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_brightness: number;
  u_depth: number;
}

export interface NeuroNoiseParams extends ShaderSizingParams, ShaderMotionParams {
  colorTest?: string;
  colorFront?: string;
  colorBack?: string;
  brightness?: number;
  depth?: number;
}

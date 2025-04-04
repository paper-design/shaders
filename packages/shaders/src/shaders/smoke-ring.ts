import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingUniformsDeclaration,
  sizingSquareUV,
  worldBoxTestStroke,
  worldOriginTestPoint,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
import { declarePI, declareRandom } from '../shader-utils';

/**
 * Smoke Ring by Ksenia Kondrashova
 * Renders a fractional Brownian motion (fBm) noise over the
 * polar coordinates masked with ring shape
 *
 * Uniforms include:
 * u_colorBack - the background color of the scene
 * u_colorInner - the inner color of the ring gradient
 * u_colorOuter - the outer color of the ring gradient
 * u_noiseScale - the resolution of noise texture
 * u_thickness - the thickness of the ring
 */

export const smokeRingFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

${sizingUniformsDeclaration}

uniform vec4 u_colorBack;
uniform vec4 u_colorInner;
uniform vec4 u_colorOuter;
uniform float u_noiseScale;
uniform float u_thickness;

out vec4 fragColor;

${declarePI}
${declareRandom}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  // Smoothstep for interpolation
  vec2 u = f * f * (3.0 - 2.0 * f);

  // Do the interpolation as two nested mix operations
  // If you try to do this in one big operation, there's enough precision loss to be off by 1px at cell boundaries
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);

}
float fbm(in vec2 n) {
  float total = 0.0, amplitude = .4;
  for (int i = 0; i < 8; i++) {
    total += noise(n) * amplitude;
    n *= 1.99;
    amplitude *= 0.65;
  }
  return total;
}

float getNoise(vec2 uv, vec2 pUv, float t) {
  float noiseLeft = fbm(pUv + .05 * t);
  pUv.x = mod(pUv.x, u_noiseScale * TWO_PI);
  float noiseRight = fbm(pUv + .05 * t);
  return mix(noiseRight, noiseLeft, smoothstep(-.25, .25, uv.x));
}

float getRingShape(vec2 uv, float thickness) {
  float radius = .65 - .75 * thickness;

  float distance = length(uv);
  float ringValue = 1. - smoothstep(radius, radius - .7 * thickness, distance);
  ringValue *= (smoothstep(radius + thickness, radius, distance));

  return ringValue;
}

void main() {
  ${sizingSquareUV}
  uv -= .5;

  float t = u_time;

  float atg = atan(uv.y, uv.x) + .001;

  vec2 polar_uv = vec2(atg, pow(length(uv), -.5) + .1 * t);
  polar_uv *= u_noiseScale;

  float cycle = 40.;
  t = mod(t - cycle, cycle);
  float blend = smoothstep(0., .5 * cycle, t) * (1. - smoothstep(.5 * cycle, cycle, t));
  float noise1 = getNoise(uv, polar_uv, t);
  float noise2 = getNoise(uv, polar_uv, mod(t + .5 * cycle, cycle));
  float noise = mix(noise2, noise1, blend);

  uv *= (.8 + 1.2 * noise);

  float ringShape = getRingShape(uv, u_thickness);

  float ringShapeOuter = 1. - pow(ringShape, 7.);
  ringShapeOuter *= ringShape;

  float ringShapeInner = ringShape - ringShapeOuter;
  ringShapeInner *= ringShape;

  float background = u_colorBack.a;

  float opacity = ringShapeOuter * u_colorOuter.a;
  opacity += ringShapeInner * u_colorInner.a;
  opacity += background * (1. - ringShapeInner * u_colorInner.a - ringShapeOuter * u_colorOuter.a);

  vec3 color = u_colorBack.rgb * (1. - ringShape) * background;
  color += u_colorOuter.rgb * ringShapeOuter * u_colorOuter.a;
  color += u_colorInner.rgb * ringShapeInner * u_colorInner.a;

  color += u_colorBack.rgb * ringShapeInner * (1. - u_colorInner.a) * background;
  color += u_colorBack.rgb * ringShapeOuter * (1. - u_colorOuter.a) * background;
  
  ${worldBoxTestStroke}
  ${worldOriginTestPoint}
    
  color = mix(color, vec3(.9, .2, 0.), worldBoxTestStroke);
  color = mix(color, vec3(0., .2, .9), worldOriginTestPoint);
  color = mix(color, vec3(0., .9, .2), worldOriginPoint);

  fragColor = vec4(color, opacity);
}
`;

export interface SmokeRingUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colorInner: [number, number, number, number];
  u_colorOuter: [number, number, number, number];
  u_noiseScale: number;
  u_thickness: number;
}

export interface SmokeRingParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colorInner?: string;
  colorOuter?: string;
  noiseScale?: number;
  thickness?: number;
}

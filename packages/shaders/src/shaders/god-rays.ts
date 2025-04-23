import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declarePI, declareRandom, declareRotate, colorBandingFix } from '../shader-utils';

export const godRaysMeta = {
  maxColorCount: 6,
} as const;

/**
 * GodRays pattern
 * The artwork by Ksenia Kondrashova
 * Renders a number of circular shapes with gooey effect applied
 *
 * Uniforms include:
 *
 * - u_colorBack: background RGBA color
 * - uColors (vec4[]): Input RGBA colors
 * - u_frequency: the frequency of rays (the number of sectors)
 * - u_spotty: the density of spots in the rings (higher = more spots)
 * - u_midSize: the size of the central shape within the rings
 * - u_midIntensity: the influence of the central shape on the rings
 * - u_density (0 .. 1): the number of visible rays
 */
export const godRaysFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${godRaysMeta.maxColorCount}];
uniform float u_colorsCount;

uniform float u_frequency;
uniform float u_spotty;
uniform float u_midSize;
uniform float u_midIntensity;
uniform float u_density;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareRandom}
${declareRotate}

float hash(float n) {
  return fract(sin(n * 43758.5453123) * 43758.5453123);
}

float valueNoise(vec2 uv) {
  vec2 i = floor(uv);
  vec2 f = fract(uv);

  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float raysShape(vec2 uv, float r, float freq, float density, float radius) {
  float a = atan(uv.y, uv.x) * freq;
  float ray = pow(valueNoise(vec2(a, r)), density);  
  uv = rotate(uv, PI);
  float mask = smoothstep(.0, .03, abs(atan(uv.y, uv.x)));
  return ray * (.5 + .5 * mask);
}

void main() {
  vec2 shape_uv = v_objectUV;

  float t = .2 * u_time;

  float radius = length(shape_uv);
  float spots = 5. * abs(u_spotty);
  
  float density = 4. - 3. * clamp(u_density, 0., 1.);
  
  float delta = 1. - smoothstep(0., 1., radius);

  float middleShape = u_midIntensity * smoothstep(abs(u_midSize), 0.02 * abs(u_midSize), 2.0 * radius);
  middleShape = pow(middleShape, 5.0);

  vec3 accumColor = vec3(0.0);
  float accumAlpha = 0.0;
  
  for (int i = 0; i < ${godRaysMeta.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;
  
    vec2 rotatedUV = rotate(shape_uv, float(i) + 1.0);
  
    float r1 = radius * (1.0 + 0.4 * float(i)) - 3.0 * t;
    float r2 = 0.5 * radius * (1.0 + spots) - 2.0 * t;
    float f = mix(1.0, 3.0 + 0.5 * float(i), hash(float(i) + 10.0)) * u_frequency;
    
    density -= (3. / u_colorsCount) * pow(smoothstep(.4 * u_midSize, .0, radius), 10.);
    density = max(0., density);
  
    float ray = raysShape(rotatedUV, r1, 5.0 * f, density, radius);
    ray *= raysShape(rotatedUV, r2, 4.0 * f, density, radius);
    ray += (1. + 4. * ray) * middleShape;
    ray = clamp(ray, 0.0, 1.0);
  
    float srcAlpha = u_colors[i].a * ray;
    vec3 srcColor = u_colors[i].rgb * srcAlpha;
  
    accumColor = accumColor + (1. - accumAlpha) * srcColor;
    accumAlpha = accumAlpha + (1. - accumAlpha) * srcAlpha;
  }
  
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  accumColor = accumColor + (1.0 - accumAlpha) * bgColor;
  accumAlpha = accumAlpha + (1.0 - accumAlpha) * u_colorBack.a;
  
  vec3 color = accumColor;
  float opacity = accumAlpha;


  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface GodRaysUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_spotty: number;
  u_midSize: number;
  u_midIntensity: number;
  u_frequency: number;
  u_density: number;
}

export interface GodRaysParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  spotty?: number;
  midSize?: number;
  midIntensity?: number;
  frequency?: number;
  density?: number;
}

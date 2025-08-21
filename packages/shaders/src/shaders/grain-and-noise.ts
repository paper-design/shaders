import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { rotation2, declarePI, simplexNoise, textureRandomizerR } from '../shader-utils.js';

export const grainAndNoiseNoiseMeta = {
  maxColorCount: 3,
} as const;

// language=GLSL
export const grainAndNoiseFragmentShader: string = `#version 300 es
precision lowp float;

uniform float u_time;
uniform vec4 u_colors[${grainAndNoiseNoiseMeta.maxColorCount}];
uniform float u_colorsCount;
uniform float u_grain;
uniform float u_fiber;

uniform sampler2D u_noiseTexture;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${rotation2}
${simplexNoise}

vec3 random(vec2 p) {
  vec2 uv = p / 100.;
  return texture(u_noiseTexture, fract(uv + .003 * u_time)).rgb;
}

vec3 valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  vec3 a = random(i);
  vec3 b = random(i + vec2(1.0, 0.0));
  vec3 c = random(i + vec2(0.0, 1.0));
  vec3 d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  vec3 x1 = mix(a, b, u.x);
  vec3 x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}
vec3 fbm(vec2 n) {
  vec3 total = vec3(0.);
  float amplitude = 1.;
  for (int i = 0; i < 5; i++) {
    n = rotate(n, .7);

    total += valueNoise(n) * amplitude;
    n *= 2.;
    amplitude *= 0.4;
  }
  return total;
}

vec3 fiberShape(vec2 uv) {
  float epsilon = 0.01;
  vec3 n1 = fbm(uv + vec2(epsilon, 0.0));
  vec3 n2 = fbm(uv - vec2(epsilon, 0.0));
  vec3 n3 = fbm(uv + vec2(0.0, epsilon));
  vec3 n4 = fbm(uv - vec2(0.0, epsilon));
  vec3 n12 = n1 - n2;
  vec3 n34 = n3 - n4;
  float epsilon2 = 2. * epsilon;
  return vec3(
    length(vec2(n12.x, n34.x)) / epsilon2,
    length(vec2(n12.y, n34.y)) / epsilon2,
    length(vec2(n12.z, n34.z)) / epsilon2
  );
}


void main() {
  vec2 fiberUV = 10. * v_patternUV;
  vec3 fiber = u_fiber / u_colorsCount * fiberShape(fiberUV);
  

  

  vec2 grainUV = 20. * v_patternUV;
  float grainShapeNoise = snoise(grainUV + vec2(0., -.3 * u_time)) + snoise(1.4 * grainUV + vec2(0., .4 * u_time));
  float grainShape = smoothstep(0., .5 + .5 * u_grain, u_grain * grainShapeNoise);

  vec3 grainColor;
  float grainOpacity;
  int cc = int(u_colorsCount);
  float grainColorMixer = .5 + .5 * snoise(2. * grainUV);

  if (cc == 1) {
    grainColor = u_colors[0].rgb;
    grainOpacity = u_colors[0].a;
  } else if (cc == 2) {
    float t = smoothstep(0., 1., grainColorMixer);
    grainColor = mix(u_colors[0].rgb, u_colors[1].rgb, t);
    grainOpacity = mix(u_colors[0].a, u_colors[1].a, t);
  } else {
    vec3 m1 = mix(u_colors[0].rgb, u_colors[1].rgb, smoothstep(0.0, 0.7, grainColorMixer));
    grainColor = mix(m1, u_colors[2].rgb, smoothstep(0.3, 1.0, grainColorMixer));
    float a1 = mix(u_colors[0].a, u_colors[1].a, smoothstep(0.0, 0.7, grainColorMixer));
    grainOpacity = mix(a1, u_colors[2].a, smoothstep(0.3, 1.0, grainColorMixer));
  }

  vec3 color = vec3(0.);
  float opacity = 0.;

  for (int i = 0; i < cc && i < 3; i++) {
    float fiberContribution = fiber[i] * u_colors[i].a;
    color += u_colors[i].rgb * fiberContribution;
    opacity += fiberContribution;
  }

  float grainContribution = grainShape * grainOpacity;
  color += grainColor * grainContribution;
  opacity = min(opacity + grainContribution, 1.);
  
  fragColor = vec4(color, opacity);
}
`;

export interface GrainAndNoiseUniforms extends ShaderSizingUniforms {
  u_noiseTexture?: HTMLImageElement;
  u_colors: vec4[];
  u_colorsCount: number;
  u_grain: number;
  u_fiber: number;
}

export interface GrainAndNoiseParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  grain?: number;
  fiber?: number;
}

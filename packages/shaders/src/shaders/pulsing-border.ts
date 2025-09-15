import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, textureRandomizerGB, colorBandingFix } from '../shader-utils.js';

export const pulsingBorderMeta = {
  maxColorCount: 5,
  maxSpots: 4,
} as const;

/**
 * Color spots traveling around rectangular stroke (border)
 *
 * Uniforms:
 * - u_colorBack (RGBA)
 * - u_colors (vec4[]), u_colorsCount (float used as integer)
 * - u_roundness, u_thickness, u_softness: border parameters
 * - u_margin
 * - u_shape (float used as integer):
 * ---- 0: square
 * ---- 1: auto
 * - u_intensity: thickness of individual spots
 * - u_bloom: normal / additive color blending
 * - u_spotSize: angular size of spots
 * - u_spots (float used as int): number of spots rendered per color
 * - u_pulse: optional pulsing animation
 * - u_smoke, u_smokeSize: optional noisy shapes around the border
 *
 * - u_noiseTexture (sampler2D): pre-computed randomizer source
 *
 */

// language=GLSL
export const pulsingBorderFragmentShader: string = `#version 300 es
precision lowp float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${pulsingBorderMeta.maxColorCount}];
uniform float u_colorsCount;
uniform float u_roundness;
uniform float u_thickness;
uniform float u_margin;
uniform float u_shape;
uniform float u_softness;
uniform float u_intensity;
uniform float u_bloom;
uniform float u_spotSize;
uniform float u_spots;
uniform float u_pulse;
uniform float u_smoke;
uniform float u_smokeSize;

uniform sampler2D u_noiseTexture;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}

float beat(float time) {
  float first = pow(sin(time * TWO_PI), 10.);
  float second = pow(sin((time - 0.15) * TWO_PI), 10.);

  return clamp(first + 0.6 * second, 0.0, 1.0);
}

float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

float roundedBox(vec2 uv, vec2 halfSize, float distance, float cornerDistance, float thinkness, float softness) {
  float borderDistance = abs(distance);
  float aa = 2. * fwidth(distance);
  float border = 1. - sst(mix(thinkness, -thinkness, softness), thinkness + aa, borderDistance);
  float cornerFadeCircles = 0.;
  cornerFadeCircles = mix(1., cornerFadeCircles, sst(0., 1., length((uv + halfSize) / thinkness)));
  cornerFadeCircles = mix(1., cornerFadeCircles, sst(0., 1., length((uv - vec2(-halfSize.x, halfSize.y)) / thinkness)));
  cornerFadeCircles = mix(1., cornerFadeCircles, sst(0., 1., length((uv - vec2(halfSize.x, -halfSize.y)) / thinkness)));
  cornerFadeCircles = mix(1., cornerFadeCircles, sst(0., 1., length((uv - halfSize) / thinkness)));
  aa = fwidth(cornerDistance);
  float cornerFade = sst(0., mix(aa, thinkness, softness), cornerDistance);
  cornerFade *= cornerFadeCircles;
  border += cornerFade;
  return border;
}

${textureRandomizerGB}

float randomG(vec2 p) {
  vec2 uv = floor(p) / 100. + .5;
  return texture(u_noiseTexture, fract(uv)).g;
}
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomG(i);
  float b = randomG(i + vec2(1.0, 0.0));
  float c = randomG(i + vec2(0.0, 1.0));
  float d = randomG(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

void main() {

  const float firstFrameOffset = 4.;
  float t = 1.2 * (u_time + firstFrameOffset);

  vec2 borderUV = v_responsiveUV;

  float angle = atan(borderUV.y, borderUV.x) / TWO_PI;

  float pulse = u_pulse * beat(.18 * u_time);
  float thickness = .3 * pow(u_thickness, 2.);

  float borderRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 halfSize = vec2(.5);
  if (borderRatio > 1.) {
    borderUV.x *= borderRatio;
    if (u_shape > 0.) {
      halfSize.x *= borderRatio;
    }
  } else {
    borderUV.y /= borderRatio;
    if (u_shape > 0.) {
      halfSize.y /= borderRatio;
    }
  }

  halfSize -= u_margin;
  halfSize -= .5 * thickness;

  float radius = .5 * u_roundness;
  radius = min(radius, min(halfSize.x, halfSize.y));
  vec2 d = abs(borderUV) - halfSize + radius;
  float outsideDistance = length(max(d, .0001)) - radius;
  float insideDistance = min(max(d.x, d.y), .0001);
  float cornerDistance = abs(min(max(d.x, d.y) - .45 * radius, .0));
  float distance = outsideDistance + insideDistance;

  float border = roundedBox(borderUV, halfSize, distance, cornerDistance, thickness, u_softness);
//  border *= border;

  vec2 smokeUV = .3 * u_smokeSize * v_patternUV;
  float smoke = clamp(3. * valueNoise(2.7 * smokeUV + .5 * t), 0., 1.);
  smoke -= valueNoise(3.4 * smokeUV - .5 * t);
  float smokeThickness = thickness + .2;
  smokeThickness = min(.4, max(smokeThickness, .1));
  smoke *= roundedBox(borderUV, halfSize, distance, cornerDistance, smokeThickness, 1.);
  smoke = 30. * pow(smoke, 2.);
  smoke *= u_smoke;
  smoke *= mix(1., pulse, u_pulse);
  smoke = clamp(smoke, 0., 1.);
  border += smoke;

  border = clamp(border, 0., 1.);

  vec3 blendColor = vec3(0.);
  float blendAlpha = 0.;
  vec3 addColor = vec3(0.);
  float addAlpha = 0.;

  float bloom = min(4. * u_bloom, 1.);
  float intensity = 1. + 4. * u_intensity;

  for (int colorIdx = 0; colorIdx < ${pulsingBorderMeta.maxColorCount}; colorIdx++) {
    if (colorIdx >= int(u_colorsCount)) break;
    float colorIdxF = float(colorIdx);

    vec3 c = u_colors[colorIdx].rgb * u_colors[colorIdx].a;
    float a = u_colors[colorIdx].a;

    for (int spotIdx = 0; spotIdx < ${pulsingBorderMeta.maxSpots}; spotIdx++) {
      if (spotIdx >= int(u_spots)) break;
      float spotIdxF = float(spotIdx);

      vec2 randVal = randomGB(vec2(spotIdxF * 10. + 2., 40. + colorIdxF));

      float time = (.1 + .15 * abs(sin(spotIdxF * (2. + colorIdxF)) * cos(spotIdxF * (2. + 2.5 * colorIdxF)))) * t + randVal.x * 3.;
      time *= mix(1., -1., step(.5, randVal.y));

      float mask = .5 + .5 * mix(
        sin(t + spotIdxF * (5. - 1.5 * colorIdxF)),
        cos(t + spotIdxF * (3. + 1.3 * colorIdxF)),
        step(mod(colorIdxF, 2.), .5)
      );

      float p = clamp(2. * u_pulse - randVal.x, 0., 1.);
      mask = mix(mask, pulse, p);

      float atg1 = fract(angle + time);
      float spotSize = .05 + .6 * pow(u_spotSize, 2.) + .05 * randVal.x;
      spotSize = mix(spotSize, .1, p);
      float sector = sst(.5 - spotSize, .5, atg1) * sst(.5 + spotSize, .5, atg1);

      sector *= mask;
      sector *= border;
      sector *= intensity;
      sector = clamp(sector, 0., 1.);

      vec3 srcColor = c * sector;
      float srcAlpha = a * sector;

      blendColor += ((1. - blendAlpha) * srcColor);
      blendAlpha = blendAlpha + (1. - blendAlpha) * srcAlpha;
      addColor += srcColor;
      addAlpha += srcAlpha;
    }
  }

  vec3 accumColor = mix(blendColor, addColor, bloom);
  float accumAlpha = mix(blendAlpha, addAlpha, bloom);
  accumAlpha = clamp(accumAlpha, 0., 1.);

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  vec3 color = accumColor + (1. - accumAlpha) * bgColor;
  float opacity = accumAlpha + (1. - accumAlpha) * u_colorBack.a;

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
//  fragColor = vec4(vec3(border), 1.);
}`;

export interface PulsingBorderUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_roundness: number;
  u_thickness: number;
  u_margin: number;
  u_shape: (typeof PulsingBorderShapes)[PulsingBorderShape];
  u_softness: number;
  u_intensity: number;
  u_bloom: number;
  u_spots: number;
  u_spotSize: number;
  u_pulse: number;
  u_smoke: number;
  u_smokeSize: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface PulsingBorderParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  roundness?: number;
  thickness?: number;
  margin?: number;
  shape?: PulsingBorderShape;
  softness?: number;
  intensity?: number;
  bloom?: number;
  spots?: number;
  spotSize?: number;
  pulse?: number;
  smoke?: number;
  smokeSize?: number;
}

export const PulsingBorderShapes = {
  square: 0,
  auto: 1,
} as const;

export type PulsingBorderShape = keyof typeof PulsingBorderShapes;
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

float roundedBox(vec2 uv, float distance) {
  float thickness = .5 * u_thickness;
  float borderDistance = abs(distance);
  float border = 1. - smoothstep(-u_softness * thickness - 2. * fwidth(borderDistance), .5 * u_softness * thickness, borderDistance - .5 * thickness);
  border = pow(border, 2.);

  return border;
}

float roundedBoxSmoke(vec2 uv, float distance, float size) {
  float borderDistance = abs(distance);
  float border = 1. - smoothstep(-.75 * size, .75 * size, borderDistance);
  border *= border;
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

float linearstep(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {

  const float firstFrameOffset = 4.;
  float t = 1.2 * (u_time + firstFrameOffset);

  vec2 borderUV = v_responsiveUV;

  float angle = atan(borderUV.y, borderUV.x) / TWO_PI;

  float pulse = u_pulse * beat(.18 * u_time);

  float borderRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  borderUV.x *= borderRatio;
  vec2 halfSize = vec2(.5);
  halfSize.x *= borderRatio;
  float radius = min(.5 * u_roundness, halfSize.x);
  vec2 d = abs(borderUV) - halfSize + radius;
  float outsideDistance = length(max(d, 0.)) - radius;
  float insideDistance = min(max(d.x, d.y), 0.0);
  float distance = outsideDistance + insideDistance;

  float border = roundedBox(borderUV, distance);

  vec2 v0 = borderUV + halfSize;
  vec2 v1 = borderUV - vec2(-halfSize.x, halfSize.y);
  vec2 v2 = borderUV - vec2(halfSize.x, -halfSize.y);
  vec2 v3 = borderUV - halfSize;

  float cornerFade = 1. - abs(v0.x - v0.y);
  cornerFade = max(cornerFade, 1. - abs(v1.x + v1.y));
  cornerFade = max(cornerFade, 1. - abs(v2.x + v2.y));
  cornerFade = max(cornerFade, 1. - abs(v3.x - v3.y));
  cornerFade = .75 * pow(cornerFade, 20.);

  float cornerFadeMask = 0.;
  float maskR = (.35 * u_thickness - .25 * radius);
  float maskHL = linearstep(halfSize.x - .25 * u_thickness, halfSize.x, borderUV.x);
  float maskHR = linearstep(halfSize.x - .25 * u_thickness, halfSize.x, -borderUV.x);
  float maskVT = linearstep(halfSize.y - .25 * u_thickness, halfSize.y, -borderUV.y);
  float maskVB = linearstep(halfSize.y - .25 * u_thickness, halfSize.y, borderUV.y);
  float maskOffset = .25 * (u_thickness + radius);
  {
    float m = maskHR;
    m *= maskVT;
    m *= (1. - clamp(length((v0 - maskOffset) / maskR), 0., 1.));
    cornerFadeMask += m;
  }
  {
    float m = maskHR;
    m *= maskVB;
    m *= (1. - clamp(length((v1 - vec2(1., -1.) * maskOffset) / maskR), 0., 1.));
    cornerFadeMask += m;
  }
  {
    float m = maskHL;
    m *= maskVT;
    m *= (1. - clamp(length((v2 - vec2(-1., 1.) * maskOffset) / maskR), 0., 1.));
    cornerFadeMask += m;
  }
  {
    float m = maskHL;
    m *= maskVB;
    m *= (1. - clamp(length((v3 + maskOffset) / maskR), 0., 1.));
    cornerFadeMask += m;
  }
  cornerFade = clamp(cornerFade, 0., 1.);
  cornerFade *= cornerFadeMask;
  border += cornerFade;

  vec2 smokeUV = .2 * u_smokeSize * v_patternUV;
  float smoke = clamp(3. * valueNoise(2.7 * smokeUV + .5 * t), 0., 1.);
  smoke -= valueNoise(3.4 * smokeUV - .5 * t);
  smoke *= roundedBoxSmoke(borderUV, distance, u_smoke);
  smoke = 30. * pow(smoke, 2.);
  smoke += cornerFadeMask;
  smoke *= u_smoke;
  smoke *= mix(1., pulse, u_pulse);
  smoke = clamp(smoke, 0., 1.);

  border += smoke;
  float borderBounds = 1. - smoothstep(.9, 1., length(v_responsiveUV));
  border *= borderBounds;
  border = clamp(border, 0., 1.);

  vec3 blendColor = vec3(0.);
  float blendAlpha = 0.0;
  vec3 addColor = vec3(0.);
  float addAlpha = 0.0;

  float bloom = 4. * u_bloom;
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
      float sector = smoothstep(.5 - spotSize, .5, atg1) * smoothstep(.5 + spotSize, .5, atg1);

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
}`;

export interface PulsingBorderUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_roundness: number;
  u_thickness: number;
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
  softness?: number;
  intensity?: number;
  bloom?: number;
  spots?: number;
  spotSize?: number;
  pulse?: number;
  smoke?: number;
  smokeSize?: number;
}

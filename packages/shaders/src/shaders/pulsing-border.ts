import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, declareValueNoise, colorBandingFix } from '../shader-utils.js';

export const pulsingBorderMeta = {
  maxColorCount: 5,
  maxSpotsPerColor: 5,
} as const;

/**
 * Color spots traveling around rectangular stroke (border)
 *
 * Uniforms:
 * - u_colorBack (RGBA)
 * - u_colors (vec4[]), u_colorsCount (float used as integer)
 * - u_roundness, u_thickness, u_softness: border parameters
 * - u_bloom: global multiplier for spots shape & color
 * - u_spotSize: angular size of spots
 * - u_spotsPerColor (float used as int): number of spots rendered per color (not all visible at the same time)
 * - u_pulse: optional pulsing animation
 * - u_smoke, u_smokeSize: optional noisy shapes around the border
 *
 * - u_pulseTexture (sampler2D): pulsing signal source
 * - u_noiseTexture (sampler2D): pre-computed randomizer source
 *
 */

// language=GLSL
export const pulsingBorderFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${ pulsingBorderMeta.maxColorCount }];
uniform float u_colorsCount;
uniform float u_roundness;
uniform float u_thickness;
uniform float u_softness;
uniform float u_bloom;
uniform float u_spotSize;
uniform float u_spotsPerColor;
uniform float u_pulse;
uniform float u_smoke;
uniform float u_smokeSize;

uniform sampler2D u_pulseTexture;
uniform sampler2D u_noiseTexture;

${ sizingVariablesDeclaration }

out vec4 fragColor;

${ declarePI }

float beat(float time) {
  float first = pow(sin(time * TWO_PI), 16.0);
  float second = pow(sin((time - 0.3) * TWO_PI), 16.0);

  return clamp(first + 0.5 * second, 0.0, 1.0);
}

float roundedBox(vec2 uv, float distance, float pulse) {
  float edgeSoftness = .5 * u_softness;
  float thickness = .25 * u_thickness;
  float borderDistance = abs(distance) - .5 * thickness + .05 * pulse;
  float border = 1. - smoothstep(-2. * edgeSoftness * thickness, edgeSoftness * thickness, borderDistance);
  border = pow(border, 2.);

  return border;
}

float roundedBoxSmoke(vec2 uv, float distance, float size) {
  float borderDistance = abs(distance);
  float border = 1. - smoothstep(-.75 * size, .75 * size, borderDistance);
  border *= border;
  return border;
}

float random(vec2 p) {
  vec2 uv = floor(p) / 100. + .5;
  return texture(u_noiseTexture, uv).g;
}
vec2 rand2(vec2 p) {
  vec2 uv = floor(p) / 100. + .5;
  return texture(u_noiseTexture, uv).gb;
}

${ declareValueNoise }

void main() {

  float t = 1.5 * u_time;

  vec2 borderUV = v_responsiveUV;

  float angle = atan(borderUV.y, borderUV.x) / TWO_PI;

  float pulse = u_pulse * beat(.4 * u_time);

  float borderRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  borderUV.x *= borderRatio;
  vec2 halfSize = vec2(.5);
  halfSize.x *= borderRatio;
  float radius = min(.5 * u_roundness, halfSize.x);
  vec2 d = abs(borderUV) - halfSize + radius;
  float outsideDistance = length(max(d, 0.)) - radius;
  float insideDistance = min(max(d.x, d.y), 0.0);
  float distance = outsideDistance + insideDistance;

  float border = roundedBox(borderUV, distance, pulse);

  vec2 smokeUV = .0018 * u_smokeSize * v_patternUV;
  float smoke = clamp(3. * valueNoise(2.7 * smokeUV + .5 * t), 0., 1.);
  smoke -= valueNoise(3.4 * smokeUV - .5 * t);
  smoke *= roundedBoxSmoke(borderUV, distance, u_smoke);
  smoke = 50. * pow(smoke, 2.);
//  smoke += .2 * pulse;
  smoke *= u_smoke;
  smoke = clamp(smoke, 0., 1.);

  border += smoke;

  border = clamp(border, 0., 1.);
  
  vec3 accumColor = vec3(0.0);
  float accumAlpha = 0.0;
  
  float shapeTotal = 0.;
  

  for (int colorIdx = 0; colorIdx < ${ pulsingBorderMeta.maxColorCount }; colorIdx++) {
    if (colorIdx >= int(u_colorsCount)) break;
    float colorIdxF = float(colorIdx);

    vec3 c = u_colors[colorIdx].rgb * u_colors[colorIdx].a;
    float a = u_colors[colorIdx].a;

    for (int spotIdx = 0; spotIdx < ${ pulsingBorderMeta.maxSpotsPerColor }; spotIdx++) {
      if (spotIdx >= int(u_spotsPerColor)) break;
      float spotIdxF = float(spotIdx);

      vec2 randVal = rand2(vec2(spotIdxF * 10. + 2., 40. + colorIdxF));

      float time = (.1 + .15 * abs(sin(spotIdxF * (2. + colorIdxF)) * cos(spotIdxF * (2. + 2.5 * colorIdxF)))) * t + randVal.x * 3.;
      time *= mix(1., -1., step(.5, randVal.y));

      float mask = .5 + .5 * mix(
        sin(t + spotIdxF * (5. - 1.5 * colorIdxF)),
        cos(t + spotIdxF * (3. + 1.3 * colorIdxF)),
        step(mod(colorIdxF, 2.), .5)
      );

      mask += .5 * pulse * (randVal.x + randVal.y);

      float atg1 = fract(angle + time);
      float spotSize = u_spotSize + .05 * randVal.x;
      float sector = smoothstep(.5 - spotSize, .5, atg1) * smoothstep(.5 + spotSize, .5, atg1);
      
      sector *= mask;
      sector *= border;

      vec3 srcColor = c * sector;
      float srcAlpha = a * sector;

      vec3 alphaBlendColor = accumColor + (1. - accumAlpha) * srcColor;
      float alphaBlendAlpha = accumAlpha + (1. - accumAlpha) * srcAlpha;

      vec3 addBlendColor = accumColor + srcColor;
      float addBlendAlpha = accumAlpha + srcAlpha;

      accumColor = mix(alphaBlendColor, addBlendColor, 3. * u_bloom);
      accumAlpha = mix(alphaBlendAlpha, addBlendAlpha, 3. * u_bloom);

      shapeTotal = max(shapeTotal, sector);
    }
  }


  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  
  vec3 color = accumColor + (1. - shapeTotal) * bgColor;
  float opacity = shapeTotal + (1. - shapeTotal) * u_colorBack.a;
  
  
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
  u_bloom: number;
  u_spotsPerColor: number;
  u_spotSize: number;
  u_pulse: number;
  u_smoke: number;
  u_smokeSize: number;
  u_pulseTexture?: HTMLImageElement;
}

export interface PulsingBorderParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  roundness?: number;
  thickness?: number;
  softness?: number;
  bloom?: number;
  spotsNumber?: number;
  spotSize?: number;
  pulse?: number;
  smoke?: number;
  smokeSize?: number;
}

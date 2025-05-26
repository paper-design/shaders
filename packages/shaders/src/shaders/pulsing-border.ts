import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declarePI, colorBandingFix } from '../shader-utils';

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
 * - u_intensity: global multiplier for spots shape & color
 * - u_spotSize: angular size of spots
 * - u_spotsPerColor (float used as int): number of spots rendered per color (not all visible at the same time)
 * - u_pulse: optional pulsing animation
 * - u_smoke, u_smokeSize: optional noisy shapes around the border
 *
 * - u_pulseTexture (sampler2D): pulsing signal source
 * - u_noiseTexture (sampler2D): pre-computed randomizer source
 *
 */

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
uniform float u_spotSize;
uniform float u_spotsPerColor;
uniform float u_pulse;
uniform float u_smoke;
uniform float u_smokeSize;

uniform sampler2D u_pulseTexture;
uniform sampler2D u_noiseTexture;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}

float roundedBox(vec2 uv, vec2 halfSize, float radius, float distance, float edgeSoftness) {
    
    float borderDistance = abs(distance) - .5 * u_thickness;
    float border = 1. - smoothstep(-.5 * edgeSoftness, .5 * edgeSoftness, borderDistance);
    border *= border;

    vec2 v0 = uv + halfSize;
    vec2 v1 = uv - vec2(-halfSize.x, halfSize.y);
    vec2 v2 = uv - vec2(halfSize.x, -halfSize.y);
    vec2 v3 = uv - halfSize;
    
    float mult = (.07 - .25 * radius);
    float m0 = mult * clamp(pow(1. - abs(v0.x - v0.y), 20.), 0., 1.);
    float m1 = mult * clamp(pow(1. - abs(v1.x + v1.y), 20.), 0., 1.);
    float m2 = mult * clamp(pow(1. - abs(v2.x + v2.y), 20.), 0., 1.);
    float m3 = mult * clamp(pow(1. - abs(v3.x - v3.y), 20.), 0., 1.);
    
    float l = edgeSoftness * .5 + .75 * u_thickness;
    float fade0 = 1. - clamp(length(v0) / l, 0., 1.);
    float fade1 = 1. - clamp(length(v1) / l, 0., 1.);
    float fade2 = 1. - clamp(length(v2) / l, 0., 1.);
    float fade3 = 1. - clamp(length(v3) / l, 0., 1.);
    
    m0 *= fade0;
    m1 *= fade1;
    m2 *= fade2;
    m3 *= fade3;
    
    float fillFix = m0 + m1 + m2 + m3;
    fillFix *= step(distance, 0.);
    fillFix *= (1. + 3. * u_thickness);
    fillFix *= (1.5 - .5 * smoothstep(0., .5, edgeSoftness));
    fillFix = clamp(fillFix, 0., 1.);

    return border + fillFix;
}

float roundedBoxSmoke(vec2 uv, vec2 halfSize, float radius, float distance, float size) {
    float borderDistance = abs(distance);
    float border = 1. - smoothstep(-.75 * size, .75 * size, borderDistance);
    border *= border;

    vec2 v0 = uv + halfSize;
    vec2 v1 = uv - vec2(-halfSize.x, halfSize.y);
    vec2 v2 = uv - vec2(halfSize.x, -halfSize.y);
    vec2 v3 = uv - halfSize;
    
    float l_mask = .5;
    float mask = smoothstep(0., 1., length(v0) / l_mask);
    mask *= smoothstep(0., 1., length(v1) / l_mask);
    mask *= smoothstep(0., 1., length(v2) / l_mask);
    mask *= smoothstep(0., 1., length(v3) / l_mask);

    return border * mask;
}

vec2 rand(vec2 p) {
  vec2 uv = floor(p) / 100. + .5;
  return texture(u_noiseTexture, uv).gb;
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = rand(i).x;
  float b = rand(i + vec2(1.0, 0.0)).x;
  float c = rand(i + vec2(0.0, 1.0)).x;
  float d = rand(i + vec2(1.0, 1.0)).x;
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float getWaveformValue(float time) {
  float dur = 5.;
  float wrappedTime = mod(time, dur);
  float normalizedTime = wrappedTime / dur;
  float value = texture(u_pulseTexture, vec2(normalizedTime, 0.5)).r;
  return value * 2. - 1.;
}

void main() {

  float t = .5 * u_time + 20.;
  
  vec2 borderUV = v_responsiveUV;

  float angle = atan(borderUV.y, borderUV.x) / TWO_PI;
  
  
  float borderRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  borderUV.x *= borderRatio;
  vec2 halfSize = vec2(.5);
  halfSize.x *= borderRatio;
  float radius = min(.5 * u_roundness, halfSize.x);
  vec2 d = abs(borderUV) - halfSize + radius;
  float outsideDistance = length(max(d, 0.)) - radius;
  float insideDistance = min(max(d.x, d.y), 0.0);
  float distance = outsideDistance + insideDistance;
    
  float border = roundedBox(borderUV, halfSize, radius, distance, .5 * u_softness);

  float pulse = u_pulse * getWaveformValue(.18 * u_time);
  
  border *= (1. + .1 * pulse);
  border *= (1. + u_intensity);

  vec2 smokeUV = .001 * u_smokeSize * v_patternUV;
  float smoke = clamp(3. * noise(2.7 * smokeUV + .5 * t), 0., 1.);
  smoke -= noise(3.4 * smokeUV - .5 * t);
  smoke *= roundedBoxSmoke(borderUV, halfSize, radius, distance, u_smoke);
  smoke = 50. * pow(smoke, 2.);
  smoke *= u_smoke;
  smoke *= (.8 + .4 * pulse);
  smoke = clamp(smoke, 0., 1.);

  border += smoke;

  float sectorsTotal = 0.;

  vec3 color = vec3(0.);
  float opacity = 0.;
  
  vec3 accumColor = vec3(0.);
  float accumAlpha = 0.;
  
  for (int i = 0; i < ${pulsingBorderMeta.maxSpotsPerColor}; i++) {
    if (i >= int(u_spotsPerColor)) break;
    float idx = float(i);
  
    for (int j = 0; j < ${pulsingBorderMeta.maxColorCount}; j++) {
      if (j >= int(u_colorsCount)) break;
      float colorIdx = float(j);

      vec2 randVal = rand(vec2(idx * 10. + 2., 40. + colorIdx));
  
      float time = (.1 + .15 * abs(sin(idx * (2. + colorIdx)) * cos(idx * (2. + 2.5 * colorIdx)))) * t + randVal.x * 3.;
      time *= mix(1., -1., step(.5, randVal.y));
  
      float mask = .2 + mix(
        sin(t + idx * (5. - 1.5 * colorIdx)),
        cos(t + idx * (3. + 1.3 * colorIdx)),
        step(mod(colorIdx, 2.), .5)
      );
      
      mask += pulse;
      if (mask < 0.) continue;
  
      float atg1 = fract(angle + time);
      float sector = smoothstep(.5 - u_spotSize, .5, atg1) * smoothstep(.5 + u_spotSize, .5, atg1);
      sector *= border;
      sector *= mask;
      sector = clamp(sector, 0., 1.);
      
      sectorsTotal += sector;
      
      float alpha = sector * u_colors[j].a;
      accumColor += u_colors[j].rgb * alpha;
      accumAlpha += alpha;
    }
  }
  
  color = accumColor;
  opacity = clamp(accumAlpha, 0., 1.);
  
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);
  
  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface PulsingBorderUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_roundness: number;
  u_thickness: number;
  u_softness: number;
  u_intensity: number;
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
  intensity?: number;
  spotsPerColor?: number;
  spotSize?: number;
  pulse?: number;
  smoke?: number;
  smokeSize?: number;
}

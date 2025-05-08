import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declarePI, colorBandingFix } from '../shader-utils';

export const pulsingBorderMeta = {
  maxColorCount: 5,
  maxSpotsPerColor: 5,
} as const;

/**
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
uniform float u_pulsing;
uniform float u_smoke;

uniform sampler2D u_pulseTexture;
uniform sampler2D u_noiseTexture;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}

float roundedBoxSDF(vec2 uv, vec2 boxSize, float radius, float thickness, float edgeSoftness, float fillFix) {
    float ratio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
    uv.x *= ratio;
    vec2 p = uv;
    
    vec2 halfSize = boxSize * .5;
    halfSize.x *= ratio;
    
    radius = min(radius, halfSize.x);
    
    vec2 d = abs(p) - halfSize + radius;
    float outsideDistance = length(max(d, 0.)) - radius;
    float insideDistance = min(max(d.x, d.y), 0.0);
    float distance = outsideDistance + insideDistance;
    
    float borderDistance = abs(distance) - thickness;
    float border = 1. - smoothstep(-.5 * edgeSoftness, .5 * edgeSoftness, borderDistance);
    border *= border;

    vec2 v0 = p + halfSize;
    vec2 v1 = p - vec2(-halfSize.x, halfSize.y);
    vec2 v2 = p - vec2(halfSize.x, -halfSize.y);
    vec2 v3 = p - halfSize;
    
    float mult = (.07 - .25 * radius);
    float m0 = mult * clamp(pow(1. - abs(v0.x - v0.y), 20.), 0., 1.);
    float m1 = mult * clamp(pow(1. - abs(v1.x + v1.y), 20.), 0., 1.);
    float m2 = mult * clamp(pow(1. - abs(v2.x + v2.y), 20.), 0., 1.);
    float m3 = mult * clamp(pow(1. - abs(v3.x - v3.y), 20.), 0., 1.);
    
    float l = edgeSoftness * .5 + 1.5 * thickness;
    float fade0 = 1. - clamp(length(v0) / l, 0., 1.);
    float fade1 = 1. - clamp(length(v1) / l, 0., 1.);
    float fade2 = 1. - clamp(length(v2) / l, 0., 1.);
    float fade3 = 1. - clamp(length(v3) / l, 0., 1.);
    
    m0 *= fade0;
    m1 *= fade1;
    m2 *= fade2;
    m3 *= fade3;
    
    float fill = m0 + m1 + m2 + m3;
    fill *= step(distance, 0.);
    fill *= (1. + 6. * thickness);
    fill *= (1.5 - .5 * smoothstep(0., .5, edgeSoftness));
    fill = clamp(fill, 0., 1.);

    return border + fillFix * fill;
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
  return value * 2.0 - 1.0;
}

void main() {

  float t = u_time + 2.;
  
  vec2 borderUV = v_responsiveUV;

  float angle = atan(borderUV.y, borderUV.x) / TWO_PI;
  
  float border = roundedBoxSDF(borderUV, vec2(1.), .5 * u_roundness, .5 * u_thickness, .5 * u_softness, 1.);

  float pulse = u_pulsing * getWaveformValue(.005 * t);
  
  border *= (1. + .5 * pulse);
  border *= (1. + u_intensity);

  float smoke = clamp(3. * noise(.0045 * v_patternUV + t) - noise(.006 * v_patternUV - t), 0., 1.);
  smoke *= roundedBoxSDF(borderUV, vec2(.9), .5, min(.65, max(2. * u_thickness, .35)), .5, 0.);
  smoke *= smoothstep(0., 1., .7 * length(borderUV));
  smoke *= u_smoke;
  
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
      
      sectorsTotal += sector;
      
      float alpha = sector * u_colors[j].a;
      accumColor += u_colors[j].rgb * alpha;
      accumAlpha += alpha;
    }
  }
  
  color = accumColor;
  opacity = clamp(accumAlpha, 0.0, 1.0);
  
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u_colorBack.a * (1.0 - opacity);
  
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
  u_pulsing: number;
  u_smoke: number;
  u_pulseTexture?: HTMLImageElement;
  u_simplexNoiseTexture?: HTMLImageElement;
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
  pulsing?: number;
  smoke?: number;
}

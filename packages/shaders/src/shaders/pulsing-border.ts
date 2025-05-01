import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingUniformsDeclaration,
  sizingVariablesDeclaration,
  sizingDebugVariablesDeclaration,
  worldBoxTestStroke,
  viewPortTestOriginPoint,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
import { declarePI, declareSimplexNoise, colorBandingFix } from '../shader-utils';

export const pulsingBorderMeta = {
  maxColorCount: 5,
} as const;

/**
 */
export const pulsingBorderFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${pulsingBorderMeta.maxColorCount}];
uniform float u_colorsCount;
uniform float u_roundness;
uniform float u_thickness;
uniform float u_softness;
uniform float u_intensity;
uniform float u_spotSize;
uniform float u_spotsNumber;
uniform float u_pulsing;
uniform float u_smoke;

uniform sampler2D u_pulseTexture;
uniform sampler2D u_simplexNoiseTexture;

${sizingUniformsDeclaration}

${sizingVariablesDeclaration}
${sizingDebugVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareSimplexNoise}

float roundedBoxSDF(vec2 uv, vec2 boxSize, float radius, float thickness, float edgeSoftness) {
    float ratio = v_worldSizeTest.x / v_worldSizeTest.y;;
    uv.x *= ratio;
    vec2 p = uv;
    
    vec2 halfSize = boxSize * .5;
    halfSize.x *= ratio;
    
    float minRadius = (edgeSoftness + thickness) * .33;
    // radius = max(radius, minRadius);
    
    vec2 d = abs(p) - halfSize + radius;
    float outsideDistance = length(max(d, 0.)) - radius;
    float insideDistance = min(max(d.x, d.y), 0.0);
    float distance = outsideDistance + insideDistance;

    float borderDistance = abs(distance) - thickness;
    float border = 1. - smoothstep(-.5 * edgeSoftness, .5 * edgeSoftness, borderDistance);
    border *= border;

    return border;
}

float rand(vec2 n) {
  return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float getWaveformValue(float time) {
  float dur = 5.;
  float wrappedTime = mod(time, dur);
  float normalizedTime = wrappedTime / dur;
  float value = texture(u_pulseTexture, vec2(normalizedTime, 0.5)).r;
  return value * 2.0 - 1.0;
}

float sectorShape(float a, float mask, float width) {
  float atg1 = mod(a, 1.);
  float s = smoothstep(.5 - width, .5, atg1) * smoothstep(.5 + width, .5, atg1);
  s *= mask;
  s = max(0., s);
  return s;
}

void main() {

  float t = u_time + 2.;
  
  vec2 borderUV = v_screenSizeUV;

  float angle = atan(borderUV.y, borderUV.x) / TWO_PI;
  
  float border = roundedBoxSDF(borderUV, vec2(1.), .5 * u_roundness, .5 * u_thickness, .5 * u_softness);

  float pulse = u_pulsing * getWaveformValue(.005 * t);
  
  border *= (1. + .5 * pulse);
  border *= (1. + u_intensity);

  float smoke = .5 + .5 * snoise(1.7 * borderUV);
  smoke *= roundedBoxSDF(borderUV, vec2(.9), .5, max(2. * u_thickness, .35), .5);
  smoke *= smoothstep(0., 1., .7 * length(borderUV));
  smoke *= u_smoke;
  
  border += smoke;

  float shape1 = 0.;
  float shape2 = 0.;
  float sectorsTotal = 0.;

  float width = u_spotSize;

  vec3 color = vec3(0.);
  float opacity = 0.;
  
  for (int i = 0; i < int(u_spotsNumber); i++) {
    float idx = float(i);
  
    for (int j = 0; j < int(u_colorsCount); j++) {
      float colorIdx = float(j);
  
      float time = (.1 + .15 * abs(sin(idx * (2. + colorIdx)) * cos(idx * (2. + colorIdx * 2.5)))) * t + rand(vec2(idx * (10. - colorIdx * 4.))) * 3.;
                 
      float randVal = rand(vec2(idx, colorIdx));
      float direction = mix(1.0, -1.0, step(0.5, randVal));
      time *= direction;
  
      float mask = .2 + mix(
        sin(t + idx * (6. - colorIdx) - idx * (1. + colorIdx * .5)),
        cos(t + idx * (5. + colorIdx) - idx * (2. - colorIdx * .3)),
        step(mod(colorIdx, 2.), .5)
      );
  
      float sector = sectorShape(angle + time, mask + pulse, width) * border;
      sectorsTotal += sector;
      opacity += sector * u_colors[j].a;
      color += sector * u_colors[j].rgb * u_colors[j].a;
    }
  }
  
  opacity += u_colorBack.a;
  color += u_colorBack.rgb * (1. - clamp(sectorsTotal, 0., 1.)) * u_colorBack.a;
  
  ${colorBandingFix}

  color += u_colorBack.rgb * (1. - clamp(sectorsTotal, 0., 1.)) * u_colorBack.a;

  ${worldBoxTestStroke}
  
  color.r += worldBoxTestStroke;
  
  ${viewPortTestOriginPoint}
  color.g += viewPortTestOriginPoint;
  color.b += worldTestOriginPoint;

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
  u_spotsNumber: number;
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
  spotsNumber?: number;
  spotSize?: number;
  pulsing?: number;
  smoke?: number;
}

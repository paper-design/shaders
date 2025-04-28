import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
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
uniform float u_radius;
uniform float u_thickness;
uniform float u_softness;
uniform float u_intensity;
uniform float u_spotSize;
uniform float u_spotsNumber;
uniform float u_pulsing;

uniform float u_scale;

uniform vec2 u_resolution;
uniform float u_pixelRatio;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareSimplexNoise}

float roundedBoxSDF(vec2 uv, vec2 boxCenter, vec2 boxSize, float radius, float thickness, float edgeSoftness) {
    vec2 p = uv - boxCenter;
    vec2 halfSize = boxSize * .5;

    vec2 d = abs(p) - halfSize + vec2(radius);
    float outsideDistance = length(max(d, 0.)) - radius;
    float insideDistance = min(max(d.x, d.y), 0.0);
    float distance = outsideDistance + insideDistance;

    float borderDistance = abs(distance) - thickness;
    float smoothedAlpha = 1. - smoothstep(-.5 * edgeSoftness, .5 * edgeSoftness, borderDistance);
    
    smoothedAlpha *= smoothedAlpha;

    return smoothedAlpha;
}



float get_border_map(vec2 uv) {
    vec2 outer = vec2(0.1);

    // Distance to the inner edges
    vec2 bl = smoothstep(vec2(0.0), outer, uv);
    vec2 tr = smoothstep(vec2(0.0), outer, 1.0 - uv);

    // Distance to the outer edges (outside the 0..1 box)
    vec2 outer_bl = smoothstep(outer, vec2(0.0), uv);
    vec2 outer_tr = smoothstep(outer, vec2(0.0), 1.0 - uv);

    // Combine inside and outside
    bl = pow(bl, vec2(0.04));
    tr = pow(tr, vec2(0.04));
    outer_bl = pow(outer_bl, vec2(0.04));
    outer_tr = pow(outer_tr, vec2(0.04));

    float inside = bl.x * bl.y * tr.x * tr.y;
    float outside = outer_bl.x * outer_bl.y * outer_tr.x * outer_tr.y;

    float s = 1.0 - inside * outside;

    return clamp(s, 0.0, 1.0);
}


float rand(vec2 n) {
  return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float speech_like_pulse(float time) {
  float baseFreq = 300.0 + sin(time * 0.1) * 100.0;
  float midFreq = 600.0 + cos(time * 0.3) * 50.0;
  float highFreq = 1200.0 + sin(time * 0.6) * 150.0;

  float lowWave = sin(time * baseFreq);
  float midWave = sin(time * midFreq) * 0.5;
  float highWave = sin(time * highFreq) * 0.2;

  float s = lowWave + midWave + highWave;
  s *= 0.5 + 0.5 * sin(time * 0.05);

  return s;
}

float sectorShape(float a, float mask, float width) {
  float atg1 = mod(a, 1.);
  float s = smoothstep(.5 - width, .5, atg1) * smoothstep(.5 + width, .5, atg1);
  s *= mask;
  s = max(0., s);
  return s;
}

void main() {

  vec2 uv = gl_FragCoord.xy;
  uv /= u_pixelRatio;

  float t = u_time + 2.;

  vec2 uv_normalised = gl_FragCoord.xy / u_resolution.xy;
  uv_normalised -= .5;
  uv_normalised *= 2. * u_scale;
  uv_normalised += .5;

  // vec2 uv_normalised = v_objectUV;
  
  vec2 uv_centered = uv_normalised - .5;;
  float angle = atan(uv_centered.y, uv_centered.x) / TWO_PI;

  // float border = roundedBoxSDF(uv_normalised, vec2(.0), vec2(1.), u_radius, .01, .1);
  vec2 center = vec2(.5);
  center.x *= (u_resolution.x / u_resolution.y);
  vec2 size = vec2(2.);
  size.x *= (u_resolution.x / u_resolution.y);
  uv_normalised.x *= (u_resolution.x / u_resolution.y);
  float border = roundedBoxSDF(uv_normalised, center, size, u_radius, u_thickness, u_softness);

  float pulse = speech_like_pulse(.02 * t);
  pulse = (1. + u_pulsing * pulse);

  border *= pulse;
  border *= (1. + u_intensity);

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
  
      float sector = sectorShape(angle + time, mask, width) * border;
      sectorsTotal += sector;
      opacity += sector * u_colors[j].a;
      color += sector * u_colors[j].rgb * u_colors[j].a;
    }
  }
  
  opacity += u_colorBack.a;
  color += u_colorBack.rgb * (1. - clamp(sectorsTotal, 0., 1.)) * u_colorBack.a;
  
  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface PulsingBorderUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_radius: number;
  u_thickness: number;
  u_softness: number;
  u_intensity: number;
  u_spotsNumber: number;
  u_spotSize: number;
  u_pulsing: number;
}

export interface PulsingBorderParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  radius?: number;
  thickness?: number;
  softness?: number;
  intensity?: number;
  spotsNumber?: number;
  spotSize?: number;
  pulsing?: number;
}

import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declarePI, declareSimplexNoise, colorBandingFix } from '../shader-utils';

/**
 */
export const pulsingBorderFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform float u_radius;
uniform float u_thickness;
uniform float u_softness;
uniform float u_intensity;
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

float sector_shape(float a, float mask, float width) {
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

  for (int i = 0; i < int(u_spotsNumber); i++) {
    float fi = float(i);
    float time = (.1 + .15 * abs(sin(fi * 4.) * cos(fi * 2.))) * t + rand(vec2(fi * 10.)) * 3.;
    time *= mix(1., -1., float(i % 2 == 0));
    float mask = .2 + sin(t + fi * 6. - fi);
    float width = .1;
    shape1 += sector_shape(angle + time, mask, width);
  }

  for (int i = 0; i < int(u_spotsNumber); i++) {
    float fi = float(i);
    float time = (.1 + .15 * abs(sin(fi * 2.) * cos(fi * 5.))) * t + rand(vec2(fi * 2. - 20.)) * 3.;
    time *= mix(-1., 1., float(i % 2 == 0));
    float mask = .2 + cos(t + fi * 5. - 2. * fi);
    float width = .1;
    shape2 += sector_shape(angle + time, mask, width);
  }

  // shape2 *= 1. - shape1;
  // shape2 = max(0., shape2);

  // float shape3 = 1. - max(shape1, shape2);
  // shape3 *= sector_shape(angle + .2 * t, 1., .6);

  shape1 *= border;
  shape2 *= border;
  
  float shape_total = shape1 + shape2;

  float opacity = 0.;
  opacity += shape1 * u_color1.a;
  opacity += shape2 * u_color2.a;
  opacity += u_colorBack.a;

  vec3 color = u_colorBack.rgb * (1. - clamp(shape_total, 0., 1.)) * u_colorBack.a;
  color += u_color1.rgb * shape1 * u_color1.a;
  color += u_color2.rgb * shape2 * u_color2.a;
  
  ${colorBandingFix}

  fragColor = vec4(color, opacity);
  // fragColor = vec4(vec3(border), 1.);
}
`;

export interface PulsingBorderUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_radius: number;
  u_thickness: number;
  u_softness: number;
  u_intensity: number;
  u_spotsNumber: number;
  u_pulsing: number;
}

export interface PulsingBorderParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  color1?: string;
  color2?: string;
  radius?: number;
  thickness?: number;
  softness?: number;
  intensity?: number;
  spotsNumber?: number;
  pulsing?: number;
}

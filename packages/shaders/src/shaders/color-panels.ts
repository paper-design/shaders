import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declarePI, colorBandingFix } from '../shader-utils';

export const colorPanelsMeta = {
  maxColorCount: 7,
} as const;

/**
 * Animated, pseudo-3D color panels with dynamic layering and directional blur
 * by Ksenia Kondrashova
 *
 * Uniforms include:
 * - u_colors (vec4[]): Input RGBA colors for panels
 * - u_colorsCount (float): Number of active colors (`u_colors` length)
 * - u_density (float): Panels to show
 * - u_colorBack (vec4): Background color to blend behind panels
 * - u_angle (float): Panel skew angle to morph rect to triangle panels
 * - u_length (float): Length of panels (relative to total height)
 * - u_blur (float): Horizontal blur amount along panel edges
 * - u_fadePosition (float): Controls transparency toward the center of panels
 * - u_colorShuffler (float): Affects how panel colors cycle
 * - u_singleColor (float): Controls blending of adjacent colors per panel
 */

export const colorPanelsFragmentShader: string = `#version 300 es
precision lowp float;

uniform vec2 u_resolution;

uniform float u_time;
uniform float u_scale;

uniform vec4 u_colors[${colorPanelsMeta.maxColorCount}];
uniform float u_colorsCount;
uniform vec4 u_colorBack;
uniform float u_angle1;
uniform float u_angle2;
uniform float u_length;
uniform float u_blur;
uniform float u_fade;
uniform float u_fadePosition;
uniform float u_density;
uniform float u_gradient;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}

vec2 getPanel(float angle, vec2 uv, float invLength) {
  float sinA = sin(angle);
  float cosA = cos(angle);

  float denom = sinA - uv.y * cosA;
  if (abs(denom) < 1e-5) return vec2(0.);

  float z = uv.y / denom;
  float zLimit = 0.5;

  if (z < 0. || z > zLimit) return vec2(0.);

  float x = uv.x * (cosA * z + 1.) * invLength;
  float panelMap = (zLimit - z) / zLimit;

  float left = -.5 + (z / zLimit - .5) * u_angle1;
  float right = .5 - (z / zLimit - .5) * u_angle2;
  float blurX = .15 * smoothstep(.05, .0, abs(angle / TWO_PI - .5)) + panelMap * u_blur;
  float panel = smoothstep(left - .5 * blurX, left + blurX, x) * (1. - smoothstep(right - blurX, right + .5 * blurX, x));

  return vec2(panel, clamp(panelMap, 0., 1.));
}

vec4 blendColor(vec4 colorA, float panelMask, float panelMap) {
  float step1 = mix(0.0, 1.0, clamp((panelMap - u_fadePosition) / (1.0 - u_fadePosition), 0.0, 1.0));
  float step2 = mix(0.0, 1.0, clamp((panelMap - u_fadePosition) / (0.0 - u_fadePosition), 0.0, 1.0));
  float fade = 1.2 * u_fade * step1 + u_fade * step2;
  fade = clamp(fade, 0.0, 1.0);

  vec3 blendedRGB = mix(colorA.rgb, vec3(0.), fade);
  float blendedAlpha = mix(colorA.a, 0., fade);

  return vec4(blendedRGB * panelMask, blendedAlpha * panelMask);
}

void main() {
  vec2 uv = v_objectUV;
  uv *= 1.25;
  
  float t = .07 * u_time;
  t = fract(t);

  vec3 color = vec3(0.);
  float opacity = 0.;
  
  int colorsCount = int(u_colorsCount);

  vec4 premultipliedColors[${colorPanelsMeta.maxColorCount}];
  for (int i = 0; i < ${colorPanelsMeta.maxColorCount}; i++) {
    if (i >= colorsCount) break;
    vec4 c = u_colors[i];
    c.rgb *= c.a;
    premultipliedColors[i] = c;
  }
  
  float invLength = 1.5 / (u_length + 0.001);
  
  float totalColorWeight = 0.;
  float panelsNumber = 12.;

  float densityNormalizer = 1.;
  switch (colorsCount) {
    case 4:
      panelsNumber = 16.;
      densityNormalizer *= 1.34;
      break;
    case 5:
      panelsNumber = 20.;
      densityNormalizer *= 1.67;
      break;
    case 7:
      panelsNumber = 14.;
      densityNormalizer *= 1.17;
      break;
  }
  
  float totalPanelsShape = 0.;
  float panelGrad = 1. - clamp(u_gradient, 0., 1.);

  for (int set = 0; set < 2; set++) {
    bool reverse = (t < 0.5);
    float localT = reverse ? -t : t;
    if ((reverse && set == 0) || (!reverse && set == 1)) continue;

    for (int i = int(panelsNumber); i >= 0; i--) {
    
      float offset = float(i) / panelsNumber;
      if (set == 1) {
        offset += .5;
      }

      float densityFract = densityNormalizer * fract(t + offset);
      if (densityFract >= .5) continue;

      float angleNorm = densityFract / u_density;
      if (angleNorm >= .3) continue;

      vec2 panel = getPanel(angleNorm * TWO_PI + PI, uv, invLength);
      float panelMap = panel[1];
      float panelMask = panel[0]
       * smoothstep(.5, .4, densityFract)
       * smoothstep(.3, .25, angleNorm)
       * smoothstep(0., .01, densityFract);
      if (panelMask < 0.) continue;

      int colorIdx = i % colorsCount;
      int nextColorIdx = (i + 1) % colorsCount;

      vec4 colorA = premultipliedColors[colorIdx];
      vec4 colorB = premultipliedColors[nextColorIdx];
      
      colorA = mix(colorA, colorB, max(0., smoothstep(.0, .45, panelMap) - panelGrad)); 
      vec4 blended = blendColor(colorA, panelMask, panelMap);
      color = blended.rgb + color * (1. - blended.a);
      opacity = blended.a + opacity * (1. - blended.a);
    }


    for (int i = int(panelsNumber); i >= 0; i--) {
    
      float offset = float(i) / panelsNumber;
      if (set == 0) {
        offset += .5;
      }

      float densityFract = densityNormalizer * fract(-t + offset);
      if (densityFract >= .5) continue;
      
      float angleNorm = -densityFract / u_density;
      if (angleNorm < -.3) continue;

      vec2 panel = getPanel(angleNorm * TWO_PI + PI, uv, invLength);
      float panelMap = panel[1];
      
      float panelMask = panel[0]
       * smoothstep(.5, .4, densityFract)
       * smoothstep(-.3, -.25, angleNorm)
       * smoothstep(0., .01, densityFract);
      if (panelMask < 0.) continue;

      int colorIdx = ((colorsCount - i) % colorsCount + colorsCount) % colorsCount;
      int nextColorIdx = ((colorsCount - (i - 1)) % colorsCount + colorsCount) % colorsCount;

      vec4 colorA = premultipliedColors[colorIdx];
      vec4 colorB = premultipliedColors[nextColorIdx];
      
      colorA = mix(colorA, colorB, max(0., smoothstep(.0, .45, panelMap) - panelGrad));       
      vec4 blended = blendColor(colorA, panelMask, panelMap);
      color = blended.rgb + color * (1. - blended.a);
      opacity = blended.a + opacity * (1. - blended.a);
    }
  }

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u_colorBack.a * (1.0 - opacity);

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface ColorPanelsUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_colorBack: [number, number, number, number];
  u_angle1: number;
  u_angle2: number;
  u_length: number;
  u_blur: number;
  u_fade: number;
  u_fadePosition: number;
  u_density: number;
  u_gradient: number;
}

export interface ColorPanelsParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  colorBack?: string;
  angle1?: number;
  angle2?: number;
  length?: number;
  blur?: number;
  fade?: number;
  fadePosition?: number;
  density?: number;
  gradient?: number;
}

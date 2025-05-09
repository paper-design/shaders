import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declarePI, colorBandingFix } from '../shader-utils';

export const colorPanelsMeta = {
  maxColorCount: 6,
  maxPanelsCount: 14,
} as const;

/**
 * Uniforms include:
 * - u_colors (vec4[]): Input RGBA colors
 * - u_colorsCount (float): Number of active colors (`u_colors` length)
 */

export const colorPanelsFragmentShader: string = `#version 300 es
precision highp float;

uniform vec2 u_resolution;

uniform float u_time;
uniform float u_scale;

uniform vec4 u_colors[${colorPanelsMeta.maxColorCount}];
uniform float u_colorsCount;
uniform vec4 u_colorBack;
uniform float u_angle;
uniform float u_length;
uniform float u_sideBlur;
uniform float u_frontTransparency;
uniform float u_count;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}

vec2 getPanel(float angle, vec2 panelSize, float px, float py) {
    float sinA = sin(angle);
    float cosA = cos(angle);

    float z = py / (sinA - py * cosA);
    float x = px * (cosA * z + 1.) * (1. / u_length * 1.5);
    
    float zLimit = 0.5;
    float panelMap = (zLimit - z) / zLimit;

    float sideBlurX = panelMap * (.02 + u_sideBlur);
    float panel = 1.;
    
    float skew = z * u_angle;
    
    float left = -panelSize.x + skew;
    float right = panelSize.x - skew;
    
    panel = smoothstep(left - .5 * sideBlurX, left + sideBlurX, x);
    panel *= (1. - smoothstep(right - sideBlurX, right + .5 * sideBlurX, x));
    
    panel *= step(0., z);
    panel *= (1. - step(zLimit, z));        

    return vec2(.9 * panel, panelMap);
}

void main() {
  vec2 uv = v_objectUV;
  uv *= 1.25;

  vec2 panelSize = vec2(.5);
  
  float px = uv.x * panelSize.x * 2.;
  float py = uv.y * panelSize.y * 2.;
  
  float t = .08 * u_time;
  vec3 color = vec3(0.);
  float opacity = 0.;
  
  float totalColorWeight = 0.;
  float panelsNumber = 2. * u_count;
  float totalPanelsShape = 0.;
  
  t = fract(t);

  for (int mode = 0; mode < 4; mode++) {

    bool skip = (t < .5) == (mode == 0 || mode == 3);
    if (skip) continue;

    for (int i = 0; i <= ${2 * colorPanelsMeta.maxPanelsCount}; i++) {
      if (i >= int(panelsNumber)) break;

      bool bottomHalf = (mode >= 2);
      bool doublingSet = (mode % 2 == 1);
  
      int j = bottomHalf ? int(panelsNumber) - i : i;
      float offset = float(j) / panelsNumber;

      if (doublingSet) {
        offset += .5;
      }
  
      float angleNorm = fract(t + offset);
      if (angleNorm < .25) continue;
      if (angleNorm > .75) continue;

      if (!bottomHalf && angleNorm > 0.5) continue;
      if (bottomHalf && angleNorm < 0.5) continue;
      
      float angle = angleNorm * TWO_PI;
      vec2 panel = getPanel(angle, panelSize, px, py);
      float panelMask = panel[0];
      float panelMap = panel[1];
      
      if (!bottomHalf) {
        panelMask *= smoothstep(0.25, 0.3, angleNorm) * smoothstep(0.5, 0.49, angleNorm);
      } else {
        panelMask *= smoothstep(0.75, 0.7, angleNorm) * smoothstep(0.5, 0.51, angleNorm);
      }
  
      int index = int(fract(2. * offset) * u_colorsCount);
      vec4 colorA = u_colors[index];      

      // vec4 colorB = u_colors[indexNext];
      // vec4 colorB = u_colorBack;
      vec4 colorB = vec4(colorA.rgb, 0.);

      float midOpacity = clamp(pow(panelMap, .5), 0., 1.);
      vec3 blendedRGB = mix(colorA.rgb * colorA.a, colorB.rgb * colorB.a, midOpacity);
      float blendedAlpha = mix(colorA.a, colorB.a, midOpacity);
      
      float finalOpacity = panelMask * blendedAlpha;
      vec3 finalColor = blendedRGB * panelMask;
      
      color = finalColor + color * (1. - finalOpacity);
      opacity = finalOpacity + opacity * (1. - finalOpacity);
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
  u_angle: number;
  u_length: number;
  u_sideBlur: number;
  u_frontTransparency: number;
  u_count: number;
}

export interface ColorPanelsParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  colorBack?: string;
  angle?: number;
  length?: number;
  sideBlur?: number;
  frontTransparency?: number;
  count?: number;
}

import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declarePI, colorBandingFix } from '../shader-utils';

export const colorPanelsMeta = {
  maxColorCount: 6,
} as const;

/**
 * Animated, pseudo-3D color panels with dynamic layering and directional blur
 * by Ksenia Kondrashova
 *
 * Uniforms include:
 * - u_colors (vec4[]): Input RGBA colors for panels
 * - u_colorsCount (float): Number of active colors (`u_colors` length)
 * - u_colorBack (vec4): Background color to blend behind panels
 * - u_count (float): Number of active panels
 * - u_angle (float): Panel skew angle to morph rect to triangle panels
 * - u_length (float): Length of panels (relative to total height)
 * - u_blur (float): Horizontal blur amount along panel edges
 * - u_middle (float): Controls transparency toward the center of panels
 * - u_colorShuffler (float): Affects how panel colors cycle
 * - u_singleColor (float): Controls blending of adjacent colors per panel
 */

export const colorPanelsFragmentShader: string = `#version 300 es
precision highp float;

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
uniform float u_count;
uniform float u_density;
uniform float u_gradient;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}

vec2 getPanel(float angle, vec2 uv) {
  float sinA = sin(angle);
  float cosA = cos(angle);

  float denom = sinA - uv.y * cosA;
  if (abs(denom) < 1e-5) return vec2(0.);

  float z = uv.y / denom;
  float zLimit = 0.5;

  if (z < 0. || z > zLimit) return vec2(0.);

  float x = uv.x * (cosA * z + 1.) * (1. / (u_length + .001) * 1.5);
  float panelMap = (zLimit - z) / zLimit;

  float left = -.5 + (z / zLimit - .5) * u_angle1;
  float right = .5 - (z / zLimit - .5) * u_angle2;
  float blurX = panelMap * u_blur;
  float panel = smoothstep(left - .5 * blurX, left + blurX, x) * (1. - smoothstep(right - blurX, right + .5 * blurX, x));

  return vec2(panel, panelMap);
}

void main() {
  vec2 uv = v_objectUV;
  uv *= 1.25;
  
  // float t = .1 * u_time * (1. + u_density);
  float t = .1 * u_time;
  t = fract(t);

  vec3 color = vec3(0.);
  float opacity = 0.;
  
  float totalColorWeight = 0.;
  float panelsNumber = 2. * u_colorsCount;
  float totalPanelsShape = 0.;
  
  float panelGrad = 1. - clamp(u_gradient, 0., 1.);
  float limTop = .5 * u_density;
  limTop = max(limTop, .25);
  float limBottom = 1. - limTop;
  float fadeFactor = 4.2 - 4. * pow(u_fade, .5);

  for (int mode = 0; mode < 4; mode++) {

    bool skip = (t < .5) == (mode == 0 || mode == 3);
    if (skip) continue;

    for (int i = 0; i <= ${2 * colorPanelsMeta.maxColorCount}; i++) {
      if (i >= int(panelsNumber)) break;

      bool bottomHalf = (mode >= 2);
      bool doublingSet = (mode % 2 == 1);
  
      int j = bottomHalf ? int(panelsNumber) - i : i;
      float offset = float(j) / panelsNumber;

      if (doublingSet) {
        offset += .5;
      }
  
      float angleNorm = limTop + (1. - u_density) * fract(t + offset);
      bool skipPanel = false;
      skipPanel = skipPanel || (angleNorm < limTop);
      skipPanel = skipPanel || (angleNorm > limBottom);
      skipPanel = skipPanel || (!bottomHalf && angleNorm > .5);
      skipPanel = skipPanel || (bottomHalf && angleNorm < .5);
    
      if (skipPanel) continue;
      
      float angle = angleNorm * TWO_PI;
      vec2 panel = getPanel(angle, uv);
      float panelMask = panel[0];
      float panelMap = clamp(panel[1], 0., 1.);
      
      if (!bottomHalf) {
        panelMask *= smoothstep(limTop, limTop + .05, angleNorm) * smoothstep(.5, .495, angleNorm);
      } else {
        panelMask *= smoothstep(limBottom, limBottom - .05, angleNorm) * smoothstep(.5, .505, angleNorm);
      }
      
      int colorIdx = int(mod(floor(float(j)), u_colorsCount));
      int nextColorIdx = int(mod(floor(float(j + 1)), u_colorsCount));

      vec4 colorA = u_colors[colorIdx];
      colorA.rgb *= colorA.a;
      vec4 colorB = u_colors[nextColorIdx];
      colorB.rgb *= colorB.a;
      
      colorA = mix(colorA, colorB, max(0., pow(panelMap, .4) - panelGrad));

      float fade = clamp(pow(panelMap, fadeFactor), 0., 1.);
      vec3 blendedRGB = mix(colorA.rgb, vec3(0.), fade);
      float blendedAlpha = mix(colorA.a, 0., fade);
      
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
  u_angle1: number;
  u_angle2: number;
  u_length: number;
  u_blur: number;
  u_fade: number;
  u_count: number;
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
  count?: number;
  density?: number;
  gradient?: number;
}

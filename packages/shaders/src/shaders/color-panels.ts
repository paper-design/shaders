import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declarePI, declareSimplexNoise, colorBandingFix } from '../shader-utils';

export const colorPanelsMeta = {
  maxColorCount: 6,
  maxDensity: 3,
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
uniform float u_sideBlur;
uniform float u_frontTransparency;
uniform float u_density;
uniform float u_proportion;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}

vec2 getPanel(float angle, vec2 panelSize, float px, float py) {
    float sinA = sin(angle);
    float cosA = cos(angle);
  
    float z = py / (sinA - py * cosA);
    float x = px * (cosA * z + 1.) * (1. / u_proportion * 1.5);
  
    float zLimit = 0.5;
    float panelMap = (z - zLimit) / (0. - zLimit);

    float zMidBlur = smoothstep(.0, .02, sin(angle + PI));
    zMidBlur += smoothstep(.0, .02, sin(angle));

    float sideBlurX = panelMap * (.02 + u_sideBlur);
    float panel = smoothstep(-panelSize.x - sideBlurX, -panelSize.x + sideBlurX, x);
    panel *= (1. - smoothstep(panelSize.x - sideBlurX, panelSize.x + sideBlurX, x));
    panel *= smoothstep(-u_sideBlur * zLimit, u_sideBlur * zLimit, z);
    
    panel *= (1. - smoothstep(zLimit - u_frontTransparency, zLimit + u_frontTransparency, z));
    
    return vec2(panel * zMidBlur, panelMap);
}

void main() {
  vec2 uv = v_objectUV;
  uv *= 1.25;

  vec2 panelSize = vec2(.5);
  
  float px = uv.x * panelSize.x * 2.;
  float py = uv.y * panelSize.y * 2.;
  
  float t = .1 * u_time;
  t = -.5 * PI + mod(t, PI);
    
  vec3 color = u_colorBack.rgb;
  float opacity = 1.;
  
  float panelsNumber = 2. * u_colorsCount * u_density;
  float totalPanelsShape = 0.;
  
  for (int pass = 0; pass < 2; pass++) {
    bool isTop = (pass == 0);
    for (int i = 0; i <= ${2 * colorPanelsMeta.maxColorCount * colorPanelsMeta.maxDensity}; i++) {
      if (i >= int(panelsNumber)) break;
      
      int j = (pass == 0) ? i : int(panelsNumber) - i;
      float angle = t + float(j) / panelsNumber * TWO_PI;
      
      float hidden = (1. - smoothstep(.0, .1, cos(angle)));
      hidden *= isTop ? step(.0, sin(angle)) : step(sin(angle), .0);
      
      if (hidden < 0.1) continue;

      vec2 panel = getPanel(angle, panelSize, px, py);
      float panelMask = panel[0] * hidden;
      float panelMap = panel[1];
  
      int index = int(mod(floor(float(j)), u_colorsCount));
      int indexNext = int(mod(floor(float(j + 1)), u_colorsCount));
      panelMap = clamp(2. * panelMap, 0.0, 1.0);
      
      vec3 panelColor = mix(u_colors[index].rgb * u_colors[index].a, u_colors[indexNext].rgb * u_colors[indexNext].a, panelMap);
      float panelOpacity = mix(u_colors[index].a, u_colors[indexNext].a, panelMap);
      
      panelColor = mix(u_colorBack.rgb, panelColor, panelMask);
      color = mix(color, panelColor, panelMask);
    }
  }
  
  fragColor = vec4(color, opacity);
} 
`;

export interface ColorPanelsUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_colorBack: [number, number, number, number];
  u_sideBlur: number;
  u_frontTransparency: number;
  u_density: number;
  u_proportion: number;
}

export interface ColorPanelsParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  colorBack?: string;
  sideBlur?: number;
  frontTransparency?: number;
  density?: number;
  proportion?: number;
}

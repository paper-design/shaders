import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, colorBandingFix } from '../shader-utils.js';

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
uniform float u_fadeIn;
uniform float u_fadeOut;
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

  float zRatio = z / zLimit;
  float panelMap = 1.0 - zRatio;
  float x = uv.x * (cosA * z + 1.) * invLength;

  float zOffset = zRatio - .5;
  float left = -.5 + zOffset * u_angle1;
  float right = .5 - zOffset * u_angle2;

  float blurFactor = (1. - panelMap) * clamp((abs(angle / TWO_PI - .5) - .01) / (-.01), 0., 1.);;
  float blurX = .15 * blurFactor + panelMap * u_blur;

  float leftEdge1 = left - .5 * blurX;
  float leftEdge2 = left + blurX;
  float rightEdge1 = right - blurX;
  float rightEdge2 = right + .5 * blurX;

  float panel = smoothstep(leftEdge1, leftEdge2, x) * (1.0 - smoothstep(rightEdge1, rightEdge2, x));

  return vec2(panel, clamp(panelMap, 0., 1.));
}

vec4 blendColor(vec4 colorA, float panelMask, float panelMap) {
  float fade = smoothstep(-.2 * (1. - u_fadeOut), u_fadeOut, panelMap)
   * (1. - smoothstep(1. - u_fadeIn, 1., panelMap));

  vec3 blendedRGB = mix(vec3(0.), colorA.rgb, fade);
  float blendedAlpha = mix(0., colorA.a, fade);

  return vec4(blendedRGB, blendedAlpha) * panelMask;
}

void main() {
  vec2 uv = v_objectUV;
  uv *= 1.25;

  float t = .05 * u_time;
  t = fract(t);
  bool reverseTime = (t < 0.5);

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
  int panelsNumber = 12;

  float densityNormalizer = 1.;
  if (colorsCount == 4) {
    panelsNumber = 16;
    densityNormalizer = 1.34;
  } else if (colorsCount == 5) {
    panelsNumber = 20;
    densityNormalizer = 1.67;
  } else if (colorsCount == 7) {
    panelsNumber = 14;
    densityNormalizer = 1.17;
  }

  float fPanelsNumber = float(panelsNumber);

  float totalPanelsShape = 0.;
  float panelGrad = 1. - clamp(u_gradient, 0., 1.);

  for (int set = 0; set < 2; set++) {
    bool isForward = (set == 0 && !reverseTime) || (set == 1 && reverseTime);
    if (!isForward) continue;

    for (int i = 0; i <= 20; i++) {
      if (i >= panelsNumber) break;

      int idx = panelsNumber - 1 - i;

      float offset = float(idx) / fPanelsNumber;
      if (set == 1) {
        offset += .5;
      }

      float densityFract = densityNormalizer * fract(t + offset);
      float angleNorm = densityFract / u_density;
      if (densityFract >= .5 || angleNorm >= .3) continue;

      float smoothDensity = clamp((.5 - densityFract) / .1, 0., 1.) * clamp(densityFract / .01, 0., 1.);
      float smoothAngle = clamp((.3 - angleNorm) / .05, 0., 1.);
      if (smoothDensity * smoothAngle < .001) continue;

      vec2 panel = getPanel(angleNorm * TWO_PI + PI, uv, invLength);
      float panelMask = panel[0] * smoothDensity * smoothAngle;
      if (panelMask <= .001) continue;
      float panelMap = panel[1];

      int colorIdx = idx % colorsCount;
      int nextColorIdx = (idx + 1) % colorsCount;

      vec4 colorA = premultipliedColors[colorIdx];
      vec4 colorB = premultipliedColors[nextColorIdx];

      colorA = mix(colorA, colorB, max(0., smoothstep(.0, .45, panelMap) - panelGrad));
      vec4 blended = blendColor(colorA, panelMask, panelMap);
      color = blended.rgb + color * (1. - blended.a);
      opacity = blended.a + opacity * (1. - blended.a);
    }


    for (int i = 0; i <= 20; i++) {
      if (i >= panelsNumber) break;

      int idx = panelsNumber - 1 - i;

      float offset = float(idx) / fPanelsNumber;
      if (set == 0) {
        offset += .5;
      }

      float densityFract = densityNormalizer * fract(-t + offset);
      float angleNorm = -densityFract / u_density;
      if (densityFract >= .5 || angleNorm < -.3) continue;

      float smoothDensity = clamp((.5 - densityFract) / .1, 0., 1.) * clamp(densityFract / .01, 0., 1.);
      float smoothAngle = clamp((angleNorm + .3) / .05, 0., 1.);
      if (smoothDensity * smoothAngle < .001) continue;

      vec2 panel = getPanel(angleNorm * TWO_PI + PI, uv, invLength);
      float panelMask = panel[0] * smoothDensity * smoothAngle;
      if (panelMask <= .001) continue;
      float panelMap = panel[1];

      int colorIdx = (colorsCount - (idx % colorsCount)) % colorsCount;
      if (colorIdx < 0) colorIdx += colorsCount;
      int nextColorIdx = (colorIdx + 1) % colorsCount;

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
  u_fadeIn: number;
  u_fadeOut: number;
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
  fadeIn?: number;
  fadeOut?: number;
  density?: number;
  gradient?: number;
}

import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, colorBandingFix } from '../shader-utils.js';

export const colorPanelsMeta = {
  maxColorCount: 7,
} as const;

/**
 * Pseudo-3D semi-transparent panels rotating around a central axis
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_scale (float): Overall zoom level, used for anti-aliasing calculations
 * - u_colors (vec4[]): Up to 7 RGBA colors used to color the panels
 * - u_colorsCount (float): Number of active colors
 * - u_colorBack (vec4): Background color in RGBA
 * - u_density (float): Angle between every 2 panels (0.25 to 7)
 * - u_angle1 (float): Skew angle applied to all panes (-1 to 1)
 * - u_angle2 (float): Skew angle applied to all panes (-1 to 1)
 * - u_length (float): Panel length relative to total height (0 to 3)
 * - u_edges (bool): Color highlight on the panels edges
 * - u_blur (float): Side blur, 0 for sharp edges (0 to 0.5)
 * - u_fadeIn (float): Transparency near central axis (0 to 1)
 * - u_fadeOut (float): Transparency near viewer (0 to 1)
 * - u_gradient (float): Color mixing within a panel, 0 = solid, 1 = gradient (0 to 1)
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_objectUV (vec2): Object box UV coordinates with global sizing (scale, rotation, offsets, etc) applied
 *
 * Vertex shader uniforms:
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_originX (float): Reference point for positioning world width in the canvas (0 to 1)
 * - u_originY (float): Reference point for positioning world height in the canvas (0 to 1)
 * - u_worldWidth (float): Virtual width of the graphic before it's scaled to fit the canvas
 * - u_worldHeight (float): Virtual height of the graphic before it's scaled to fit the canvas
 * - u_fit (float): How to fit the rendered shader into the canvas dimensions (0 = none, 1 = contain, 2 = cover)
 * - u_scale (float): Overall zoom level of the graphics (0.01 to 4)
 * - u_rotation (float): Overall rotation angle of the graphics in degrees (0 to 360)
 * - u_offsetX (float): Horizontal offset of the graphics center (-1 to 1)
 * - u_offsetY (float): Vertical offset of the graphics center (-1 to 1)
 *
 */

// language=WGSL
export const colorPanelsFragmentShader: string = `
struct Uniforms {
  ${ systemUniformFields }
  u_colorsCount: f32,
  u_density: f32,
  u_angle1: f32,
  u_angle2: f32,
  u_length: f32,
  u_edges: f32,
  u_blur: f32,
  u_fadeIn: f32,
  u_fadeOut: f32,
  u_gradient: f32,
  u_colorBack: vec4f,
  u_colors: array<vec4f, ${ colorPanelsMeta.maxColorCount }>,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${ vertexOutputStruct }

${ declarePI }

const zLimit: f32 = 0.5;

fn getPanel(angle: f32, uv: vec2f, invLength: f32, aa: f32) -> vec2f {
  let sinA = sin(angle);
  let cosA = cos(angle);

  let denom = sinA - uv.y * cosA;
  if (abs(denom) < 0.01) { return vec2f(0.0); }

  let z = uv.y / denom;

  if (z <= 0.0 || z > zLimit) { return vec2f(0.0); }

  let zRatio = z / zLimit;
  var panelMap = 1.0 - zRatio;
  let x = uv.x * (cosA * z + 1.0) * invLength;

  let zOffset = zRatio - 0.5;
  let left = -0.5 + zOffset * u.u_angle1;
  let right = 0.5 - zOffset * u.u_angle2;
  let blurX = aa + 2.0 * panelMap * u.u_blur;

  let leftEdge1 = left - blurX;
  let leftEdge2 = left + 0.25 * blurX;
  let rightEdge1 = right - 0.25 * blurX;
  let rightEdge2 = right + blurX;

  var panel = smoothstep(leftEdge1, leftEdge2, x) * (1.0 - smoothstep(rightEdge1, rightEdge2, x));
  panel *= mix(0.0, panel, smoothstep(0.0, 0.01 / max(u.u_scale, 1e-6), panelMap));

  let midScreen = abs(sinA);
  if (u.u_edges > 0.5) {
    panelMap = mix(0.99, panelMap, panel * clamp(panelMap / (0.15 * (1.0 - pow(midScreen, 0.1))), 0.0, 1.0));
  } else if (midScreen < 0.07) {
    panel *= (midScreen * 15.0);
  }

  return vec2f(panel, panelMap);
}

fn blendColor(colorA: vec4f, panelMask: f32, panelMap: f32) -> vec4f {
  var fade = 1.0 - smoothstep(0.97 - 0.97 * u.u_fadeIn, 1.0, panelMap);

  fade *= smoothstep(-0.2 * (1.0 - u.u_fadeOut), u.u_fadeOut, panelMap);

  let blendedRGB = mix(vec3f(0.0), colorA.rgb, fade);
  let blendedAlpha = mix(0.0, colorA.a, fade);

  return vec4f(blendedRGB, blendedAlpha) * panelMask;
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  var uv = input.v_objectUV;
  uv *= 1.25;

  var t = 0.02 * u.u_time;
  t = fract(t);
  let reverseTime = (t < 0.5);

  var color = vec3f(0.0);
  var opacity: f32 = 0.0;

  let aa = 0.005 / u.u_scale;
  let colorsCount = i32(u.u_colorsCount);

  var premultipliedColors: array<vec4f, ${ colorPanelsMeta.maxColorCount }>;
  for (var i: i32 = 0; i < ${ colorPanelsMeta.maxColorCount }; i++) {
    if (i >= colorsCount) { break; }
    var c = u.u_colors[i];
    c = vec4f(c.rgb * c.a, c.a);
    premultipliedColors[i] = c;
  }

  let invLength = 1.5 / max(u.u_length, 0.001);

  var totalColorWeight: f32 = 0.0;
  var panelsNumber: i32 = 12;

  var densityNormalizer: f32 = 1.0;
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

  let fPanelsNumber = f32(panelsNumber);

  var totalPanelsShape: f32 = 0.0;
  let panelGrad = 1.0 - clamp(u.u_gradient, 0.0, 1.0);

  for (var setIdx: i32 = 0; setIdx < 2; setIdx++) {
    let isForward = (setIdx == 0 && !reverseTime) || (setIdx == 1 && reverseTime);
    if (!isForward) { continue; }

    for (var i: i32 = 0; i <= 20; i++) {
      if (i >= panelsNumber) { break; }

      let idx = panelsNumber - 1 - i;

      var offset = f32(idx) / fPanelsNumber;
      if (setIdx == 1) {
        offset += 0.5;
      }

      let densityFract = densityNormalizer * fract(t + offset);
      var angleNorm = densityFract / u.u_density;
      if (densityFract >= 0.5 || angleNorm >= 0.3) { continue; }

      let smoothDensity = clamp((0.5 - densityFract) / 0.1, 0.0, 1.0) * clamp(densityFract / 0.01, 0.0, 1.0);
      let smoothAngle = clamp((0.3 - angleNorm) / 0.05, 0.0, 1.0);
      if (smoothDensity * smoothAngle < 0.001) { continue; }

      if (angleNorm > 0.5) {
        angleNorm = 0.5;
      }
      let panel = getPanel(angleNorm * TWO_PI + PI, uv, invLength, aa);
      if (panel[0] <= 0.001) { continue; }
      let panelMask = panel[0] * smoothDensity * smoothAngle;
      let panelMap = panel[1];

      let colorIdx = idx % colorsCount;
      let nextColorIdx = (idx + 1) % colorsCount;

      var colorA = premultipliedColors[colorIdx];
      let colorB = premultipliedColors[nextColorIdx];

      colorA = mix(colorA, colorB, max(0.0, smoothstep(0.0, 0.45, panelMap) - panelGrad));
      let blended = blendColor(colorA, panelMask, panelMap);
      color = blended.rgb + color * (1.0 - blended.a);
      opacity = blended.a + opacity * (1.0 - blended.a);
    }


    for (var i: i32 = 0; i <= 20; i++) {
      if (i >= panelsNumber) { break; }

      let idx = panelsNumber - 1 - i;

      var offset = f32(idx) / fPanelsNumber;
      if (setIdx == 0) {
        offset += 0.5;
      }

      let densityFract = densityNormalizer * fract(-t + offset);
      let angleNorm = -densityFract / u.u_density;
      if (densityFract >= 0.5 || angleNorm < -0.3) { continue; }

      let smoothDensity = clamp((0.5 - densityFract) / 0.1, 0.0, 1.0) * clamp(densityFract / 0.01, 0.0, 1.0);
      let smoothAngle = clamp((angleNorm + 0.3) / 0.05, 0.0, 1.0);
      if (smoothDensity * smoothAngle < 0.001) { continue; }

      let panel = getPanel(angleNorm * TWO_PI + PI, uv, invLength, aa);
      let panelMask = panel[0] * smoothDensity * smoothAngle;
      if (panelMask <= 0.001) { continue; }
      let panelMap = panel[1];

      var colorIdx = (colorsCount - (idx % colorsCount)) % colorsCount;
      if (colorIdx < 0) { colorIdx += colorsCount; }
      let nextColorIdx = (colorIdx + 1) % colorsCount;

      var colorA = premultipliedColors[colorIdx];
      let colorB = premultipliedColors[nextColorIdx];

      colorA = mix(colorA, colorB, max(0.0, smoothstep(0.0, 0.45, panelMap) - panelGrad));
      let blended = blendColor(colorA, panelMask, panelMap);
      color = blended.rgb + color * (1.0 - blended.a);
      opacity = blended.a + opacity * (1.0 - blended.a);
    }
  }

  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u.u_colorBack.a * (1.0 - opacity);

  ${ colorBandingFix }

  return vec4f(color, opacity);
}
`;

export interface ColorPanelsUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_colorBack: [number, number, number, number];
  u_angle1: number;
  u_angle2: number;
  u_length: number;
  u_edges: boolean;
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
  edges?: boolean;
  blur?: number;
  fadeIn?: number;
  fadeOut?: number;
  density?: number;
  gradient?: number;
}

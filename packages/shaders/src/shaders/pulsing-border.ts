import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, glslMod, textureRandomizerGB, colorBandingFix } from '../shader-utils.js';

export const pulsingBorderMeta = {
  maxColorCount: 5,
  maxSpots: 4,
} as const;

/**
 * Luminous trails of color merging into a glowing gradient contour.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colors (vec4[]): Up to 5 spot colors in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_roundness (float): Border radius (0 to 1)
 * - u_thickness (float): Border base width (0 to 1)
 * - u_softness (float): Border edge sharpness, 0 = hard edge, 1 = smooth gradient (0 to 1)
 * - u_marginLeft (float): Distance from the left edge to the effect (0 to 1)
 * - u_marginRight (float): Distance from the right edge to the effect (0 to 1)
 * - u_marginTop (float): Distance from the top edge to the effect (0 to 1)
 * - u_marginBottom (float): Distance from the bottom edge to the effect (0 to 1)
 * - u_aspectRatio (float): Aspect ratio mode (0 = auto, 1 = square)
 * - u_intensity (float): Thickness of individual color spots (0 to 1)
 * - u_bloom (float): Power of glow, 0 = normal blending, 1 = additive blending (0 to 1)
 * - u_spots (float): Number of spots added for each color (1 to 20)
 * - u_spotSize (float): Angular size of spots (0 to 1)
 * - u_pulse (float): Optional pulsing animation intensity (0 to 1)
 * - u_smoke (float): Optional noisy shape extending the border (0 to 1)
 * - u_smokeSize (float): Size of the smoke effect (0 to 1)
 * - u_noiseTexture (sampler2D): Pre-computed randomizer source texture
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_responsiveUV (vec2): Responsive UV coordinates that adapt to canvas aspect ratio
 * - v_responsiveBoxGivenSize (vec2): Given size of the responsive bounding box
 * - v_patternUV (vec2): UV coordinates for pattern with global sizing (rotation, scale, offset, etc) applied (used for smoke calculation)
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

export const pulsingBorderFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorsCount: f32,
  u_roundness: f32,
  u_thickness: f32,
  u_marginLeft: f32,
  u_marginRight: f32,
  u_marginTop: f32,
  u_marginBottom: f32,
  u_aspectRatio: f32,
  u_softness: f32,
  u_intensity: f32,
  u_bloom: f32,
  u_spotSize: f32,
  u_spots: f32,
  u_pulse: f32,
  u_smoke: f32,
  u_smokeSize: f32,
  u_colorBack: vec4f,
  u_colors: array<vec4f, ${ pulsingBorderMeta.maxColorCount }>,
}
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(1) @binding(0) var u_noiseTexture_tex: texture_2d<f32>;
@group(1) @binding(1) var u_noiseTexture_samp: sampler;

${vertexOutputStruct}

${ declarePI }
${ glslMod }

fn beat(time: f32) -> f32 {
  let first = pow(abs(sin(time * TWO_PI)), 10.0);
  let second = pow(abs(sin((time - 0.15) * TWO_PI)), 10.0);

  return clamp(first + 0.6 * second, 0.0, 1.0);
}

fn sst(edge0: f32, edge1: f32, x: f32) -> f32 {
  return smoothstep(edge0, edge1, x);
}

fn roundedBox(uv: vec2f, halfSize: vec2f, distance_val: f32, cornerDistance: f32, thickness: f32, softness: f32) -> f32 {
  let borderDistance = abs(distance_val);
  var aa = 2.0 * fwidth(distance_val);
  var border = 1.0 - sst(min(mix(thickness, -thickness, softness), thickness + aa), max(mix(thickness, -thickness, softness), thickness + aa), borderDistance);
  var cornerFadeCircles: f32 = 0.0;
  cornerFadeCircles = mix(1.0, cornerFadeCircles, sst(0.0, 1.0, length((uv + halfSize) / thickness)));
  cornerFadeCircles = mix(1.0, cornerFadeCircles, sst(0.0, 1.0, length((uv - vec2f(-halfSize.x, halfSize.y)) / thickness)));
  cornerFadeCircles = mix(1.0, cornerFadeCircles, sst(0.0, 1.0, length((uv - vec2f(halfSize.x, -halfSize.y)) / thickness)));
  cornerFadeCircles = mix(1.0, cornerFadeCircles, sst(0.0, 1.0, length((uv - halfSize) / thickness)));
  aa = fwidth(cornerDistance);
  var cornerFade = sst(0.0, mix(aa, thickness, softness), cornerDistance);
  cornerFade *= cornerFadeCircles;
  border += cornerFade;
  return border;
}

${ textureRandomizerGB }

fn randomG(p: vec2f) -> f32 {
  let uv = floor(p) / 100.0 + vec2f(0.5);
  return textureSampleLevel(u_noiseTexture_tex, u_noiseTexture_samp, fract(uv), 0.0).g;
}

fn valueNoise(st: vec2f) -> f32 {
  let i = floor(st);
  let f = fract(st);
  let a = randomG(i);
  let b = randomG(i + vec2f(1.0, 0.0));
  let c = randomG(i + vec2f(0.0, 1.0));
  let d = randomG(i + vec2f(1.0, 1.0));
  let u_val = f * f * (vec2f(3.0) - 2.0 * f);
  let x1 = mix(a, b, u_val.x);
  let x2 = mix(c, d, u_val.x);
  return mix(x1, x2, u_val.y);
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let firstFrameOffset: f32 = 109.0;
  let t = 1.2 * (u.u_time + firstFrameOffset);

  var borderUV = input.v_responsiveUV;
  let pulse = u.u_pulse * beat(0.18 * u.u_time);

  let canvasRatio = input.v_responsiveBoxGivenSize.x / input.v_responsiveBoxGivenSize.y;
  var halfSize = vec2f(0.5);
  borderUV.x *= max(canvasRatio, 1.0);
  borderUV.y /= min(canvasRatio, 1.0);
  halfSize.x *= max(canvasRatio, 1.0);
  halfSize.y /= min(canvasRatio, 1.0);

  var mL = u.u_marginLeft;
  var mR = u.u_marginRight;
  var mT = u.u_marginTop;
  var mB = u.u_marginBottom;
  var mX = mL + mR;
  var mY = mT + mB;

  if (u.u_aspectRatio > 0.0) {
    let shapeRatio = canvasRatio * (1.0 - mX) / max(1.0 - mY, 1e-6);
    let freeX = select(0.0, (1.0 - mX) * (1.0 - 1.0 / max(abs(shapeRatio), 1e-6)), shapeRatio > 1.0);
    let freeY = select(0.0, (1.0 - mY) * (1.0 - shapeRatio), shapeRatio < 1.0);
    mL += freeX * 0.5;
    mR += freeX * 0.5;
    mT += freeY * 0.5;
    mB += freeY * 0.5;
    mX = mL + mR;
    mY = mT + mB;
  }

  let thickness = 0.5 * u.u_thickness * min(halfSize.x, halfSize.y);

  halfSize.x *= (1.0 - mX);
  halfSize.y *= (1.0 - mY);

  let centerShift = vec2f(
    (mL - mR) * max(canvasRatio, 1.0) * 0.5,
    (mB - mT) / min(canvasRatio, 1.0) * 0.5
  );

  borderUV -= centerShift;
  halfSize -= vec2f(mix(thickness, 0.0, u.u_softness));

  let radius = mix(0.0, min(halfSize.x, halfSize.y), u.u_roundness);
  let d = abs(borderUV) - halfSize + vec2f(radius);
  let outsideDistance = length(max(d, vec2f(0.0001))) - radius;
  let insideDistance = min(max(d.x, d.y), 0.0001);
  let cornerDistance = abs(min(max(d.x, d.y) - 0.45 * radius, 0.0));
  let distance_val = outsideDistance + insideDistance;

  let borderThickness = mix(thickness, 3.0 * thickness, u.u_softness);
  var border = roundedBox(borderUV, halfSize, distance_val, cornerDistance, borderThickness, u.u_softness);
  border = pow(border, 1.0 + u.u_softness);

  let smokeUV = 0.3 * u.u_smokeSize * input.v_patternUV;
  var smoke = clamp(3.0 * valueNoise(2.7 * smokeUV + vec2f(0.5 * t)), 0.0, 1.0);
  smoke -= valueNoise(3.4 * smokeUV - vec2f(0.5 * t));
  var smokeThickness = thickness + 0.2;
  smokeThickness = min(0.4, max(smokeThickness, 0.1));
  smoke *= roundedBox(borderUV, halfSize, distance_val, cornerDistance, smokeThickness, 1.0);
  smoke = 30.0 * smoke * smoke;
  smoke *= mix(0.0, 0.5, pow(u.u_smoke, 2.0));
  smoke *= mix(1.0, pulse, u.u_pulse);
  smoke = clamp(smoke, 0.0, 1.0);
  border += smoke;

  border = clamp(border, 0.0, 1.0);

  var blendColor = vec3f(0.0);
  var blendAlpha: f32 = 0.0;
  var addColor = vec3f(0.0);
  var addAlpha: f32 = 0.0;

  let bloom = 4.0 * u.u_bloom;
  let intensity = 1.0 + (1.0 + 4.0 * u.u_softness) * u.u_intensity;

  let angle = atan2(borderUV.y, borderUV.x) / TWO_PI;

  for (var colorIdx: i32 = 0; colorIdx < ${ pulsingBorderMeta.maxColorCount }; colorIdx++) {
    if (colorIdx < i32(u.u_colorsCount)) {
    let colorIdxF = f32(colorIdx);

    let c = u.u_colors[colorIdx].rgb * u.u_colors[colorIdx].a;
    let a = u.u_colors[colorIdx].a;

    for (var spotIdx: i32 = 0; spotIdx < ${ pulsingBorderMeta.maxSpots }; spotIdx++) {
      if (spotIdx < i32(u.u_spots)) {
      let spotIdxF = f32(spotIdx);

      let randVal = randomGB(vec2f(spotIdxF * 10.0 + 2.0, 40.0 + colorIdxF));

      var time = (0.1 + 0.15 * abs(sin(spotIdxF * (2.0 + colorIdxF)) * cos(spotIdxF * (2.0 + 2.5 * colorIdxF)))) * t + randVal.x * 3.0;
      time *= mix(1.0, -1.0, step(0.5, randVal.y));

      var mask = 0.5 + 0.5 * mix(
        sin(t + spotIdxF * (5.0 - 1.5 * colorIdxF)),
        cos(t + spotIdxF * (3.0 + 1.3 * colorIdxF)),
        step(glsl_mod_f32(colorIdxF, 2.0), 0.5)
      );

      let p = clamp(2.0 * u.u_pulse - randVal.x, 0.0, 1.0);
      mask = mix(mask, pulse, p);

      let atg1 = fract(angle + time);
      var spotSize = 0.05 + 0.6 * pow(u.u_spotSize, 2.0) + 0.05 * randVal.x;
      spotSize = mix(spotSize, 0.1, p);
      var sector = sst(0.5 - spotSize, 0.5, atg1) * (1.0 - sst(0.5, 0.5 + spotSize, atg1));

      sector *= mask;
      sector *= border;
      sector *= intensity;
      sector = clamp(sector, 0.0, 1.0);

      let srcColor = c * sector;
      let srcAlpha = a * sector;

      blendColor += ((1.0 - blendAlpha) * srcColor);
      blendAlpha = blendAlpha + (1.0 - blendAlpha) * srcAlpha;
      addColor += srcColor;
      addAlpha += srcAlpha;
      }
    }
    }
  }

  let accumColor = mix(blendColor, addColor, bloom);
  var accumAlpha = mix(blendAlpha, addAlpha, bloom);
  accumAlpha = clamp(accumAlpha, 0.0, 1.0);

  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
  var color = accumColor + (1.0 - accumAlpha) * bgColor;
  var opacity = accumAlpha + (1.0 - accumAlpha) * u.u_colorBack.a;

  ${ colorBandingFix }

  return vec4f(color, opacity);
}`;

export interface PulsingBorderUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_roundness: number;
  u_thickness: number;
  u_marginLeft: number;
  u_marginRight: number;
  u_marginTop: number;
  u_marginBottom: number;
  u_aspectRatio: (typeof PulsingBorderAspectRatios)[PulsingBorderAspectRatio];
  u_softness: number;
  u_intensity: number;
  u_bloom: number;
  u_spots: number;
  u_spotSize: number;
  u_pulse: number;
  u_smoke: number;
  u_smokeSize: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface PulsingBorderParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  roundness?: number;
  thickness?: number;
  margin?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  aspectRatio?: PulsingBorderAspectRatio;
  softness?: number;
  intensity?: number;
  bloom?: number;
  spots?: number;
  spotSize?: number;
  pulse?: number;
  smoke?: number;
  smokeSize?: number;
}

export const PulsingBorderAspectRatios = {
  auto: 0,
  square: 1,
} as const;

export type PulsingBorderAspectRatio = keyof typeof PulsingBorderAspectRatios;

import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, rotation2, proceduralHash21 } from '../shader-utils.js';

/**
 * Fluted glass image filter that transforms an image into streaked, ribbed distortions,
 * giving a mix of clarity and obscurity.
 *
 * Fragment shader uniforms:
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_rotation (float): Overall rotation angle of the graphics in degrees (0 to 360)
 * - u_image (sampler2D): Source image texture
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colorShadow (vec4): Shadows color in RGBA
 * - u_colorHighlight (vec4): Highlights color in RGBA
 * - u_shadows (float): Color gradient added over image and background, following distortion shape (0 to 1)
 * - u_highlights (float): Thin strokes along distortion shape, useful for antialiasing on small grid (0 to 1)
 * - u_size (float): Size of the distortion shape grid (0 to 1)
 * - u_shape (float): Grid shape (1 = lines, 2 = linesIrregular, 3 = wave, 4 = zigzag, 5 = pattern)
 * - u_angle (float): Direction of the grid relative to the image in degrees (0 to 180)
 * - u_distortionShape (float): Shape of distortion (1 = prism, 2 = lens, 3 = contour, 4 = cascade, 5 = flat)
 * - u_distortion (float): Power of distortion applied within each stripe (0 to 1)
 * - u_shift (float): Texture shift in direction opposite to the grid (-1 to 1)
 * - u_stretch (float): Extra distortion along the grid lines (0 to 1)
 * - u_blur (float): One-directional blur over the image and extra blur around edges (0 to 1)
 * - u_edges (float): Glass distortion and softness on the image edges (0 to 1)
 * - u_marginLeft (float): Distance from the left edge to the effect (0 to 1)
 * - u_marginRight (float): Distance from the right edge to the effect (0 to 1)
 * - u_marginTop (float): Distance from the top edge to the effect (0 to 1)
 * - u_marginBottom (float): Distance from the bottom edge to the effect (0 to 1)
 * - u_grainMixer (float): Strength of grain distortion applied to shape edges (0 to 1)
 * - u_grainOverlay (float): Post-processing black/white grain overlay (0 to 1)
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_imageUV (vec2): Image UV coordinates with global sizing (rotation, scale, offset, etc) applied
 *
 * Vertex shader uniforms:
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_originX (float): Reference point for positioning world width in the canvas (0 to 1)
 * - u_originY (float): Reference point for positioning world height in the canvas (0 to 1)
 * - u_fit (float): How to fit the rendered shader into the canvas dimensions (0 = none, 1 = contain, 2 = cover)
 * - u_scale (float): Overall zoom level of the graphics (0.01 to 4)
 * - u_rotation (float): Overall rotation angle of the graphics in degrees (0 to 360)
 * - u_offsetX (float): Horizontal offset of the graphics center (-1 to 1)
 * - u_offsetY (float): Vertical offset of the graphics center (-1 to 1)
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 *
 */

export const flutedGlassFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorBack: vec4f,
  u_colorShadow: vec4f,
  u_colorHighlight: vec4f,
  u_size: f32,
  u_shadows: f32,
  u_angle: f32,
  u_stretch: f32,
  u_shape: f32,
  u_distortion: f32,
  u_highlights: f32,
  u_distortionShape: f32,
  u_shift: f32,
  u_blur: f32,
  u_edges: f32,
  u_marginLeft: f32,
  u_marginRight: f32,
  u_marginTop: f32,
  u_marginBottom: f32,
  u_grainMixer: f32,
  u_grainOverlay: f32,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

@group(1) @binding(0) var u_image_tex: texture_2d<f32>;
@group(1) @binding(1) var u_image_samp: sampler;

${declarePI}
${rotation2}
${proceduralHash21}

fn fwidth_f32(x: f32) -> f32 {
  return abs(dpdx(x)) + abs(dpdy(x));
}
fn fwidth_vec2(v: vec2f) -> vec2f {
  return abs(dpdx(v)) + abs(dpdy(v));
}

fn valueNoise(st: vec2f) -> f32 {
  let i = floor(st);
  let f = fract(st);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  let u_val = f * f * (vec2f(3.0) - 2.0 * f);
  let x1 = mix(a, b, u_val.x);
  let x2 = mix(c, d, u_val.x);
  return mix(x1, x2, u_val.y);
}

fn getUvFrame(uv: vec2f, softness: f32) -> f32 {
  let aax = 2.0 * fwidth_f32(uv.x);
  let aay = 2.0 * fwidth_f32(uv.y);
  let left   = smoothstep(0.0, aax + softness, uv.x);
  let right  = 1.0 - smoothstep(1.0 - softness - aax, 1.0, uv.x);
  let bottom = smoothstep(0.0, aay + softness, uv.y);
  let top    = 1.0 - smoothstep(1.0 - softness - aay, 1.0, uv.y);
  return left * right * bottom * top;
}

const MAX_RADIUS: i32 = 50;
fn samplePremultiplied(uv: vec2f) -> vec4f {
  let c = textureSampleLevel(u_image_tex, u_image_samp, uv, 0.0);
  return vec4f(c.rgb * c.a, c.a);
}
fn getBlur(uv: vec2f, texelSize: vec2f, dir: vec2f, sigma: f32) -> vec4f {
  if (sigma <= 0.5) { return textureSampleLevel(u_image_tex, u_image_samp, uv, 0.0); }
  let radius = i32(min(f32(MAX_RADIUS), ceil(3.0 * sigma)));

  let twoSigma2 = 2.0 * sigma * sigma;
  let gaussianNorm = 1.0 / sqrt(TWO_PI * sigma * sigma);

  var sum = samplePremultiplied(uv) * gaussianNorm;
  var weightSum = gaussianNorm;

  for (var i: i32 = 1; i <= MAX_RADIUS; i++) {
    if (i <= radius) {
      let x = f32(i);
      let w = exp(-(x * x) / twoSigma2) * gaussianNorm;

      let offset = dir * texelSize * x;
      let s1 = samplePremultiplied(uv + offset);
      let s2 = samplePremultiplied(uv - offset);

      sum += (s1 + s2) * w;
      weightSum += 2.0 * w;
    }
  }

  var result = sum / weightSum;
  if (result.a > 0.0) {
    result = vec4f(result.rgb / result.a, result.a);
  }

  return result;
}

fn rotateAspect(p_in: vec2f, a: f32, aspect: f32) -> vec2f {
  var p = p_in;
  p = vec2f(p.x * aspect, p.y);
  p = rotate(p, a);
  p = vec2f(p.x / aspect, p.y);
  return p;
}

fn smoothFract(x: f32) -> f32 {
  let f = fract(x);
  let w = fwidth_f32(x);

  let edge = abs(f - 0.5) - 0.5;
  let band = smoothstep(-w, w, edge);

  return mix(f, 1.0 - f, band);
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {

  let patternRotation = -u.u_angle * PI / 180.0;
  let patternSize = mix(200.0, 5.0, u.u_size);

  var uv = input.v_imageUV;

  let uvMask = input.position.xy / u.u_resolution.xy;
  let sw = vec2f(0.005);
  let margins = vec4f(u.u_marginLeft, u.u_marginTop, u.u_marginRight, u.u_marginBottom);
  let mask =
  smoothstep(margins[0], margins[0] + sw.x, uvMask.x + sw.x) *
  smoothstep(margins[2], margins[2] + sw.x, 1.0 - uvMask.x + sw.x) *
  smoothstep(margins[1], margins[1] + sw.y, uvMask.y + sw.y) *
  smoothstep(margins[3], margins[3] + sw.y, 1.0 - uvMask.y + sw.y);
  let maskOuter =
  smoothstep(margins[0] - sw.x, margins[0], uvMask.x + sw.x) *
  smoothstep(margins[2] - sw.x, margins[2], 1.0 - uvMask.x + sw.x) *
  smoothstep(margins[1] - sw.y, margins[1], uvMask.y + sw.y) *
  smoothstep(margins[3] - sw.y, margins[3], 1.0 - uvMask.y + sw.y);
  let maskStroke = maskOuter - mask;
  let maskInner =
  smoothstep(margins[0] - 2.0 * sw.x, margins[0], uvMask.x) *
  smoothstep(margins[2] - 2.0 * sw.x, margins[2], 1.0 - uvMask.x) *
  smoothstep(margins[1] - 2.0 * sw.y, margins[1], uvMask.y) *
  smoothstep(margins[3] - 2.0 * sw.y, margins[3], 1.0 - uvMask.y);
  let maskStrokeInner = maskInner - mask;

  uv -= vec2f(0.5);
  uv *= patternSize;
  uv = rotateAspect(uv, patternRotation, u.u_imageAspectRatio);

  var curve: f32 = 0.0;
  let patternY = uv.y / u.u_imageAspectRatio;
  if (u.u_shape > 4.5) {
    // pattern
    curve = 0.5 + 0.5 * sin(0.5 * PI * uv.x) * cos(0.5 * PI * patternY);
  } else if (u.u_shape > 3.5) {
    // zigzag
    curve = 10.0 * abs(fract(0.1 * patternY) - 0.5);
  } else if (u.u_shape > 2.5) {
    // wave
    curve = 4.0 * sin(0.23 * patternY);
  } else if (u.u_shape > 1.5) {
    // lines irregular
    curve = 0.5 + 0.5 * sin(0.5 * uv.x) * sin(1.7 * uv.x);
  } else {
    // lines
  }

  let UvToFract = uv + vec2f(curve);
  var fractOrigUV = fract(uv);
  var floorOrigUV = floor(uv);

  var x = smoothFract(UvToFract.x);
  let xNonSmooth = fract(UvToFract.x) + 0.0001;

  var highlightsWidth = 2.0 * max(0.001, fwidth_f32(UvToFract.x));
  highlightsWidth += 2.0 * maskStrokeInner;
  var highlights = smoothstep(0.0, highlightsWidth, xNonSmooth);
  highlights *= smoothstep(1.0, 1.0 - highlightsWidth, xNonSmooth);
  highlights = 1.0 - highlights;
  highlights *= u.u_highlights;
  highlights = clamp(highlights, 0.0, 1.0);
  highlights *= mask;

  var shadows = pow(x, 1.3);
  var distortion: f32 = 0.0;
  var fadeX: f32 = 1.0;
  var frameFade: f32 = 0.0;

  var aa = fwidth_f32(xNonSmooth);
  aa = max(aa, fwidth_f32(uv.x));
  aa = max(aa, fwidth_f32(UvToFract.x));
  aa = max(aa, 0.0001);

  if (u.u_distortionShape == 1.0) {
    distortion = -pow(1.5 * x, 3.0);
    distortion += (0.5 - u.u_shift);

    frameFade = pow(1.5 * x, 3.0);
    aa = max(0.2, aa);
    aa += mix(0.2, 0.0, u.u_size);
    fadeX = smoothstep(0.0, aa, xNonSmooth) * smoothstep(1.0, 1.0 - aa, xNonSmooth);
    distortion = mix(0.5, distortion, fadeX);
  } else if (u.u_distortionShape == 2.0) {
    distortion = 2.0 * pow(x, 2.0);
    distortion -= (0.5 + u.u_shift);

    frameFade = pow(abs(x - 0.5), 4.0);
    aa = max(0.2, aa);
    aa += mix(0.2, 0.0, u.u_size);
    fadeX = smoothstep(0.0, aa, xNonSmooth) * smoothstep(1.0, 1.0 - aa, xNonSmooth);
    distortion = mix(0.5, distortion, fadeX);
    frameFade = mix(1.0, frameFade, 0.5 * fadeX);
  } else if (u.u_distortionShape == 3.0) {
    distortion = pow(2.0 * (xNonSmooth - 0.5), 6.0);
    distortion -= 0.25;
    distortion -= u.u_shift;

    frameFade = 1.0 - 2.0 * pow(abs(x - 0.4), 2.0);
    aa = 0.15;
    aa += mix(0.1, 0.0, u.u_size);
    fadeX = smoothstep(0.0, aa, xNonSmooth) * smoothstep(1.0, 1.0 - aa, xNonSmooth);
    frameFade = mix(1.0, frameFade, fadeX);

  } else if (u.u_distortionShape == 4.0) {
    x = xNonSmooth;
    distortion = sin((x + 0.25) * TWO_PI);
    shadows = 0.5 + 0.5 * asin(distortion) / (0.5 * PI);
    distortion *= 0.5;
    distortion -= u.u_shift;
    frameFade = 0.5 + 0.5 * sin(x * TWO_PI);
  } else if (u.u_distortionShape == 5.0) {
    distortion -= pow(abs(x), 0.2) * x;
    distortion += 0.33;
    distortion -= 3.0 * u.u_shift;
    distortion *= 0.33;

    frameFade = 0.3 * (smoothstep(0.0, 1.0, x));
    shadows = pow(x, 2.5);

    aa = max(0.1, aa);
    aa += mix(0.1, 0.0, u.u_size);
    fadeX = smoothstep(0.0, aa, xNonSmooth) * smoothstep(1.0, 1.0 - aa, xNonSmooth);
    distortion *= fadeX;
  }

  let dudx = dpdx(input.v_imageUV);
  let dudy = dpdy(input.v_imageUV);
  var grainUV = input.v_imageUV - vec2f(0.5);
  grainUV *= (0.8 / vec2f(length(dudx), length(dudy)));
  grainUV += vec2f(0.5);
  let grain = valueNoise(grainUV);
  let grainSmooth = smoothstep(0.4, 0.7, grain);
  let grainMixed = grainSmooth * u.u_grainMixer;
  distortion = mix(distortion, 0.0, grainMixed);

  shadows = min(shadows, 1.0);
  shadows += maskStrokeInner;
  shadows *= mask;
  shadows = min(shadows, 1.0);
  shadows *= pow(u.u_shadows, 2.0);
  shadows = clamp(shadows, 0.0, 1.0);

  distortion *= 3.0 * u.u_distortion;
  frameFade *= u.u_distortion;

  fractOrigUV = vec2f(fractOrigUV.x + distortion, fractOrigUV.y);
  floorOrigUV = rotateAspect(floorOrigUV, -patternRotation, u.u_imageAspectRatio);
  fractOrigUV = rotateAspect(fractOrigUV, -patternRotation, u.u_imageAspectRatio);

  uv = (floorOrigUV + fractOrigUV) / patternSize;
  uv += vec2f(pow(maskStroke, 4.0));

  uv += vec2f(0.5);

  uv = mix(input.v_imageUV, uv, smoothstep(0.0, 0.7, mask));
  var blur = mix(0.0, 50.0, u.u_blur);
  blur = mix(0.0, blur, smoothstep(0.5, 1.0, mask));

  var edgeDistortion = mix(0.0, 0.04, u.u_edges);
  edgeDistortion += 0.06 * frameFade * u.u_edges;
  edgeDistortion *= mask;
  let frame = getUvFrame(uv, edgeDistortion);

  var stretch = 1.0 - smoothstep(0.0, 0.5, xNonSmooth) * smoothstep(1.0, 1.0 - 0.5, xNonSmooth);
  stretch = pow(stretch, 2.0);
  stretch *= mask;
  stretch *= getUvFrame(uv, 0.1 + 0.05 * mask * frameFade);
  uv = vec2f(uv.x, mix(uv.y, 0.5, u.u_stretch * stretch));

  var image = getBlur(uv, 1.0 / u.u_resolution / u.u_pixelRatio, vec2f(0.0, 1.0), blur);
  image = vec4f(image.rgb * image.a, image.a);
  var backColor = u.u_colorBack;
  backColor = vec4f(backColor.rgb * backColor.a, backColor.a);
  var highlightColor = u.u_colorHighlight;
  highlightColor = vec4f(highlightColor.rgb * highlightColor.a, highlightColor.a);
  let shadowColor = u.u_colorShadow;

  var color = highlightColor.rgb * highlights;
  var opacity = highlightColor.a * highlights;

  shadows = mix(shadows * shadowColor.a, 0.0, highlights);
  color = mix(color, shadowColor.rgb * shadowColor.a, 0.5 * shadows);
  color += 0.5 * pow(shadows, 0.5) * shadowColor.rgb;
  opacity += shadows;
  color = clamp(color, vec3f(0.0), vec3f(1.0));
  opacity = clamp(opacity, 0.0, 1.0);

  color += image.rgb * (1.0 - opacity) * frame;
  opacity += image.a * (1.0 - opacity) * frame;

  color += backColor.rgb * (1.0 - opacity);
  opacity += backColor.a * (1.0 - opacity);

  var grainOverlay = valueNoise(rotate(grainUV, 1.0) + vec2f(3.0));
  grainOverlay = mix(grainOverlay, valueNoise(rotate(grainUV, 2.0) + vec2f(-1.0)), 0.5);
  grainOverlay = pow(grainOverlay, 1.3);

  let grainOverlayV = grainOverlay * 2.0 - 1.0;
  let grainOverlayColor = vec3f(step(0.0, grainOverlayV));
  var grainOverlayStrength = u.u_grainOverlay * abs(grainOverlayV);
  grainOverlayStrength = pow(grainOverlayStrength, 0.8);
  grainOverlayStrength *= mask;
  color = mix(color, grainOverlayColor, 0.35 * grainOverlayStrength);

  opacity += 0.5 * grainOverlayStrength;
  opacity = clamp(opacity, 0.0, 1.0);

  return vec4f(color, opacity);
}
`;

export interface FlutedGlassUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorBack: [number, number, number, number];
  u_colorShadow: [number, number, number, number];
  u_colorHighlight: [number, number, number, number];
  u_shadows: number;
  u_size: number;
  u_angle: number;
  u_distortion: number;
  u_shift: number;
  u_blur: number;
  u_edges: number;
  u_marginLeft: number;
  u_marginRight: number;
  u_marginTop: number;
  u_marginBottom: number;
  u_stretch: number;
  u_distortionShape: (typeof GlassDistortionShapes)[GlassDistortionShape];
  u_highlights: number;
  u_shape: (typeof GlassGridShapes)[GlassGridShape];
  u_grainMixer: number;
  u_grainOverlay: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface FlutedGlassParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorBack?: string;
  colorShadow?: string;
  colorHighlight?: string;
  shadows?: number;
  size?: number;
  angle?: number;
  distortion?: number;
  shift?: number;
  blur?: number;
  edges?: number;
  margin?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  stretch?: number;
  distortionShape?: GlassDistortionShape;
  highlights?: number;
  shape?: GlassGridShape;
  grainMixer?: number;
  grainOverlay?: number;
}

export const GlassGridShapes = {
  lines: 1,
  linesIrregular: 2,
  wave: 3,
  zigzag: 4,
  pattern: 5,
} as const;

export const GlassDistortionShapes = {
  prism: 1,
  lens: 2,
  contour: 3,
  cascade: 4,
  flat: 5,
} as const;

export type GlassDistortionShape = keyof typeof GlassDistortionShapes;
export type GlassGridShape = keyof typeof GlassGridShapes;

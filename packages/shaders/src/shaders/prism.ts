import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, proceduralHash21 } from '../shader-utils.js';

export const prismMeta = {
  maxColorSteps: 40,
} as const;

export const PrismShapes = {
  linear: 1,
  radial: 2,
  cylinder: 3,
  zoom: 4,
  bubble: 5,
  barrel: 6,
  flare: 7,
} as const;

export type PrismShape = keyof typeof PrismShapes;

/**
 * Prism image filter that samples an image several times along a dispersion axis and gives each
 * sample its own color, the way glass refracts each wavelength by a different amount. The palette
 * is what the image splits into: three colors give a classic lens fringe, two an opposed pair,
 * eight a full spectrum. u_hue turns the palette as a whole, so red/green/blue at 0 becomes
 * cyan/magenta/yellow at 180.
 *
 * The colors work subtractively, like ink rather than light: a sample carries everything its color
 * is missing, so a sample landing on a dark feature takes its own color out of the result and
 * leaves it showing on the neighbours. That is what puts the palette colors on screen for a dark
 * subject on a light ground, which is most photographs. It reverses for a light subject on a dark
 * ground, where the fringes come out complemented. This is why a black-on-transparent logo wants an
 * opaque u_colorBack: on transparent it disperses into faint tinted edges, on white it reads as a
 * dark subject and splits into the full palette.
 *
 * The palette is always evenly spaced hues at full saturation, which is what keeps the maths simple
 * downstream: however many colors there are and wherever u_hue puts them, they cover the wheel, so
 * every channel is carried by some of them and none is carried by all of them. Each channel can
 * then be divided by its own weight, leaving the image untouched where the samples line up
 * (shift = 0) without any risk of a channel dividing a vanishing weight back out of itself.
 *
 * Fragment shader uniforms:
 * - u_image (sampler2D): Source image texture
 * - u_colorBack (vec4): Color filling the picture's transparent areas and everything past its edge,
 *   in RGBA; a transparent value leaves those areas transparent with a colored rim
 * - u_colorSteps (float): Number of colors the image splits into, doubling as the sample count (2 to 40)
 * - u_hue (float): Turns the whole palette around the hue wheel in degrees (0 to 360)
 * - u_shift (float): Distance the outermost samples travel apart,
 *   as a fraction of the image width (0 to 1, mapped to 0 to 10%)
 * - u_shiftBias (float): Warps the dispersion curve, bunching the middle colors toward the last
 *   color (-1) or the first (1); 0 spaces them evenly (-1 to 1)
 * - u_shape (float): Direction rule the samples travel along (1 = linear, 2 = radial, 3 = cylinder,
 *   4 = zoom, 5 = bubble, 6 = barrel, 7 = flare). Radial scales the whole frame about the centre;
 *   zoom is the same but one-sided like a zoom blur; bubble windows radial into a round disc that
 *   fades before the corners; barrel grows with the square of the radius so the edges bulge like a
 *   lens; flare is constant-length radial streaks the same reach everywhere
 * - u_angle (float): Direction of the shift in degrees; turns the line for linear and cylinder,
 *   does nothing for the radially symmetric shapes (0 to 360)
 * - u_noise (float): Turbulence added to the shift direction, on top of any shape (0 to 1)
 * - u_noiseFrequency (float): Spatial frequency of the turbulence field; higher is finer-grained
 * - u_noiseOffset (float): Slides the turbulence field to a different patch
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

// language=GLSL
export const prismFragmentShader: string = `#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;
uniform vec4 u_colorBack;
uniform float u_colorSteps;
uniform float u_hue;
uniform float u_shift;
uniform float u_shiftBias;
uniform float u_shape;
uniform float u_angle;
uniform float u_noise;
uniform float u_noiseFrequency;
uniform float u_noiseOffset;

in vec2 v_imageUV;

out vec4 fragColor;

${declarePI}
${proceduralHash21}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1., 0.));
  float c = hash21(i + vec2(0., 1.));
  float d = hash21(i + vec2(1., 1.));
  vec2 u = f * f * (3. - 2. * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float getUvFrame(vec2 uv) {
  float aax = 2. * fwidth(uv.x);
  float aay = 2. * fwidth(uv.y);
  float left   = smoothstep(0., aax, uv.x);
  float right  = 1. - smoothstep(1. - aax, 1., uv.x);
  float bottom = smoothstep(0., aay, uv.y);
  float top    = 1. - smoothstep(1. - aay, 1., uv.y);
  return left * right * bottom * top;
}

// The image sampled at uv and composited over the background, returned premultiplied. Both the
// picture's own transparency and everything past its edge (frame = 0) read as the same absence and
// get filled by the background, so a black-on-transparent logo behaves like a photo once the
// background is opaque. Each sample tests the frame itself: a shared mask would drag border pixels
// sideways instead of letting them meet the background where they fall.
vec4 sampleOverBack(vec2 uv) {
  vec4 img = texture(u_image, uv);
  float cover = img.a * getUvFrame(uv);
  vec3 backPremult = u_colorBack.rgb * u_colorBack.a;
  return vec4(img.rgb * cover + backPremult * (1. - cover), cover + u_colorBack.a * (1. - cover));
}

// Full saturation hue wheel, t running 0 to 1 from red back around to red.
vec3 hueColor(float t) {
  return clamp(abs(mod(t * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.);
}

float dispersionCurve(float t) {
  return pow(t, exp2(2. * u_shiftBias));
}

// Half the span the samples fan across, before the per-sample curve spreads them from +axis to
// -axis. Every shape is a different rule for this one vector, so the accumulation loop below never
// has to know which shape is running. Worked out around the image centre in aspect-corrected space
// so radial stays circular and the angle reads true on a non-square image, then undone on the way
// out.
vec2 shapeAxis(vec2 uv) {
  float amount = .1 * u_shift;
  float a = radians(u_angle);
  vec2 dir = vec2(cos(a), sin(a));

  vec2 p = uv - .5;
  p.x *= u_imageAspectRatio;

  int shape = int(u_shape);
  float r = length(p);
  vec2 axis;
  if (shape == 2 || shape == 4) {
    // radial and zoom both scale about the centre, growing from nothing there to the edges; they
    // part ways only in main, where radial brackets the pixel and zoom trails to one side of it
    axis = p * 2. * amount;
  } else if (shape == 3) {
    // cylinder: the radial scaling of one axis only, zero along the centre line, growing sideways
    axis = dir * dot(p, dir) * 2. * amount;
  } else if (shape == 5) {
    // bubble: radial, but windowed into a centred disc so it fades out before the rectangular
    // corners instead of tracing them; the effect reads as a round hotspot rather than a scaled frame
    axis = p * 2. * amount * (1. - smoothstep(.35, .5, r));
  } else if (shape == 6) {
    // barrel: magnitude grows with the square of the radius, so the centre stays put while the edges
    // bulge and straight lines bow outward, the way a spherical lens distorts
    axis = p * 4. * amount * r;
  } else if (shape == 7) {
    // flare: direction only from the centre, every streak the same length whatever the radius; the
    // tiny smoothstep keeps the undefined direction at the exact centre from flickering
    axis = (r > 1e-4 ? p / r : vec2(0.)) * 2. * amount * smoothstep(0., .08, r);
  } else {
    // linear: one fixed direction everywhere
    axis = dir * amount;
  }

  // Noise turns the direction, leaving the shape's magnitude field intact, so any shape can be
  // roughened without becoming a shape of its own. The offset slides the field to a different patch.
  if (u_noise > 0.) {
    float turn = (valueNoise(p * u_noiseFrequency + u_noiseOffset) - .5) * TWO_PI * u_noise;
    float cs = cos(turn), sn = sin(turn);
    axis = mat2(cs, -sn, sn, cs) * axis;
  }

  axis.x /= u_imageAspectRatio;
  return axis;
}

void main() {
  vec2 uv = v_imageUV;
  vec2 axis = shapeAxis(uv);
  bool oneSided = int(u_shape) == 4;

  int count = int(u_colorSteps);
  vec3 colorSum = vec3(0.);
  vec3 coverSum = vec3(0.);
  vec3 weightSum = vec3(0.);

  for (int i = 0; i < ${prismMeta.maxColorSteps}; i++) {
    if (i >= count) break;

    // Two different spacings: the colors step around the hue wheel without repeating the one they
    // started on, while their positions run the dispersion axis end to end.
    float hue = u_hue / 360. + float(i) / float(count);
    float t = float(i) / float(count - 1);

    // Radial and the rest bracket the pixel, sampling from +axis through it to -axis. Zoom instead
    // trails from the pixel out to +axis only, so the same tap count reads as a one-sided streak.
    float c = dispersionCurve(t);
    vec2 offset = oneSided ? axis * c : mix(axis, -axis, c);
    vec4 tap = sampleOverBack(uv + offset);
    vec3 weight = 1. - hueColor(hue);

    colorSum += tap.rgb * weight;
    coverSum += tap.a * weight;
    weightSum += weight;
  }

  // Coverage is accumulated per channel with the same weights as the color, so on a cutout the
  // silhouette splits into a colored rim exactly the way the picture does. The single output alpha
  // takes the widest-reaching channel, so that rim stays visible instead of averaging itself away.
  vec3 color = colorSum / max(weightSum, 1e-4);
  vec3 cover = coverSum / max(weightSum, 1e-4);
  fragColor = vec4(color, max(max(cover.r, cover.g), cover.b));
}
`;

export interface PrismUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorBack: [number, number, number, number];
  u_colorSteps: number;
  u_hue: number;
  u_shift: number;
  u_shiftBias: number;
  u_shape: (typeof PrismShapes)[PrismShape];
  u_angle: number;
  u_noise: number;
  u_noiseFrequency: number;
  u_noiseOffset: number;
}

export interface PrismParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorBack?: string;
  colorSteps?: number;
  hue?: number;
  shift?: number;
  shiftBias?: number;
  shape?: PrismShape;
  angle?: number;
  noise?: number;
  noiseFrequency?: number;
  noiseOffset?: number;
}

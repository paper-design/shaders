import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, proceduralHash21 } from '../shader-utils.js';

export const prismMeta = {
  maxColorSteps: 40,
} as const;

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
 * The direction the samples travel is a vector field, described rather than picked from a list:
 * u_radiality blends a fixed angle into an outward-from-centre shift that grows with radius, and
 * u_centerFalloff / u_edgeFalloff / u_profileCurve reshape how the strength rises and falls between
 * the centre and the edge. Together they cover the familiar named looks and everything between them:
 * a fixed angle is a straight shift; full radiality is a rounded radial split on its own; add edge
 * falloff and it tightens into a disc; curve the ramp toward the edge and it bulges like a barrel.
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
 * - u_angle (float): Direction of the shift in degrees when it is not radial (0 to 360)
 * - u_radiality (float): Blends the shift from the fixed angle (0) to an outward-from-centre shift
 *   that grows with radius (1); raising it adds the off-axis shift a straight angle never had (0 to 1)
 * - u_centerFalloff (float): How much the shift strength drops toward the centre; 0 leaves it full,
 *   1 fades it to nothing at the centre (0 to 1)
 * - u_edgeFalloff (float): How much the shift strength drops toward the edge; 0 leaves it full,
 *   1 fades it to nothing at the edge (0 to 1)
 * - u_profileCurve (float): Bends the strength ramp between centre and edge, toward the edge for a
 *   barrel-like bulge (1) or toward the centre (-1); 0 is a straight ramp (-1 to 1)
 * - u_oneSided (bool): Samples trail to one side of each pixel instead of bracketing it, turning a
 *   radial split into a one-sided zoom blur
 * - u_noise (float): Turbulence added to the shift direction (0 to 1)
 * - u_noiseFrequency (float): Spatial frequency of the turbulence field; higher is finer-grained
 * - u_noiseOffset (float): Slides the turbulence field to a different patch
 * - u_distortion (float): Fisheye warp of the image geometry, separate from the color shift; 0 leaves
 *   it flat, 1 is a full fisheye bulge with the corners running off into the background (0 to 1)
 * - u_debugCircle (bool): Testing overlay drawing the largest circle that fits the image box, the
 *   radius the shift falloffs, radiality and fisheye all pivot around
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
uniform float u_angle;
uniform float u_radiality;
uniform float u_centerFalloff;
uniform float u_edgeFalloff;
uniform float u_profileCurve;
uniform bool u_oneSided;
uniform float u_noise;
uniform float u_noiseFrequency;
uniform float u_noiseOffset;
uniform float u_distortion;
uniform bool u_debugCircle;

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

vec4 sampleOverBack(vec2 uv) {
  vec4 img = texture(u_image, uv);
  float cover = img.a * getUvFrame(uv);
  vec3 backPremult = u_colorBack.rgb * u_colorBack.a;
  return vec4(img.rgb * cover + backPremult * (1. - cover), cover + u_colorBack.a * (1. - cover));
}

vec3 hueColor(float t) {
  return clamp(abs(mod(t * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.);
}

// Radius of the largest circle that fits the image box, in the aspect-corrected centred space. The
// box spans the aspect ratio horizontally and 1 vertically, so the circle touches whichever pair of
// edges is nearer: half-height on a landscape image, half-width on a portrait one. The radial shift,
// the fisheye and the testing overlay all measure against this so they round to the same circle.
float boxInradius() {
  return .5 * min(u_imageAspectRatio, 1.);
}

float dispersionCurve(float t) {
  return pow(t, exp2(2. * u_shiftBias));
}

vec2 shapeAxis(vec2 uv) {
  float amount = .1 * u_shift;
  float a = radians(u_angle);
  vec2 uniformDir = vec2(cos(a), sin(a));

  vec2 p = uv - .5;
  p.x *= u_imageAspectRatio;
  float r = length(p);
  float R = boxInradius();

  vec2 radial = p / R;
  float rl = length(radial);
  if (rl > 1.) radial /= rl;
  vec2 base = mix(uniformDir, radial, u_radiality);

  float coord = mix(abs(dot(p, uniformDir)), r, u_radiality);
  float qn = clamp(coord / R, 0., 1.);

  float ramp = pow(qn, exp2(2. * u_profileCurve));
  float strength = mix(1., ramp, u_centerFalloff) * mix(1., 1. - qn, u_edgeFalloff);

  vec2 axis = base * amount * strength;

  if (u_noise > 0.) {
    float turn = (valueNoise(p * u_noiseFrequency + u_noiseOffset) - .5) * TWO_PI * u_noise;
    float cs = cos(turn), sn = sin(turn);
    axis = mat2(cs, -sn, sn, cs) * axis;
  }

  axis.x /= u_imageAspectRatio;
  return axis;
}

vec2 fisheye(vec2 uv) {
  if (u_distortion <= 0.) return uv;

  vec2 p = uv - .5;
  p.x *= u_imageAspectRatio;
  float r = length(p);
  if (r < 1e-5) return uv;

  float rn = r / boxInradius();
  float a = u_distortion * 1.4;
  float srcR = tan(min(rn * a, 1.53)) / tan(a);
  p *= srcR / rn;

  p.x /= u_imageAspectRatio;
  return p + .5;
}

void main() {
  vec2 uv = v_imageUV;
  vec2 baseUV = fisheye(uv);
  vec2 axis = shapeAxis(uv);

  int count = int(u_colorSteps);
  vec3 colorSum = vec3(0.);
  vec3 coverSum = vec3(0.);
  vec3 weightSum = vec3(0.);

  for (int i = 0; i < ${prismMeta.maxColorSteps}; i++) {
    if (i >= count) break;

    float hue = u_hue / 360. + float(i) / float(count);
    float t = float(i) / float(count - 1);

    float c = dispersionCurve(t);
    vec2 offset = u_oneSided ? axis * c : mix(axis, -axis, c);
    vec4 tap = sampleOverBack(baseUV + offset);
    vec3 weight = 1. - hueColor(hue);

    colorSum += tap.rgb * weight;
    coverSum += tap.a * weight;
    weightSum += weight;
  }

  vec3 color = colorSum / max(weightSum, 1e-4);
  vec3 cover = coverSum / max(weightSum, 1e-4);
  fragColor = vec4(color, max(max(cover.r, cover.g), cover.b));

  // Testing overlay: the largest circle that fits the image box, touching the nearer pair of edges.
  // This is the radius 0.5 the shift falloffs, the radiality clamp and the fisheye all pivot around.
  if (u_debugCircle) {
    vec2 pc = v_imageUV - .5;
    pc.x *= u_imageAspectRatio;
    float d = abs(length(pc) - boxInradius());
    float aa = fwidth(length(pc));
    float ring = 1. - smoothstep(1.5 * aa, 2.5 * aa, d);
    fragColor.rgb = mix(fragColor.rgb, vec3(1., 0., 0.), ring);
    fragColor.a = max(fragColor.a, ring);
  }
}
`;

export interface PrismUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorBack: [number, number, number, number];
  u_colorSteps: number;
  u_hue: number;
  u_shift: number;
  u_shiftBias: number;
  u_angle: number;
  u_radiality: number;
  u_centerFalloff: number;
  u_edgeFalloff: number;
  u_profileCurve: number;
  u_oneSided: boolean;
  u_noise: number;
  u_noiseFrequency: number;
  u_noiseOffset: number;
  u_distortion: number;
  u_debugCircle: boolean;
}

export interface PrismParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorBack?: string;
  colorSteps?: number;
  hue?: number;
  shift?: number;
  shiftBias?: number;
  angle?: number;
  radiality?: number;
  centerFalloff?: number;
  edgeFalloff?: number;
  profileCurve?: number;
  oneSided?: boolean;
  noise?: number;
  noiseFrequency?: number;
  noiseOffset?: number;
  distortion?: number;
  debugCircle?: boolean;
}

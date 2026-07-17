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
 * u_perspective blends a fixed angle into an outward-from-centre shift that grows with radius, and
 * u_focusCenter / u_focusEdges reshape how the strength rises and falls between the centre and the
 * edge. Together they cover the familiar named looks and everything between them: a fixed angle is a
 * straight shift; full radiality is a rounded radial split on its own; add edge falloff and it
 * tightens into a disc.
 *
 * Fragment shader uniforms:
 * - u_image (sampler2D): Source image texture
 * - u_colorBack (vec4): Color filling the picture's transparent areas and everything past its edge,
 *   in RGBA; a transparent value leaves those areas transparent with a colored rim
 * - u_colorSteps (float): Number of colors the image splits into, doubling as the sample count (2 to 40)
 * - u_hue (float): Turns the whole palette around the hue wheel in degrees (0 to 360)
 * - u_shift (float): Distance the outermost samples travel apart,
 *   as a fraction of the image width (0 to 1, mapped to 0 to 10%)
 * - u_shiftBias (float): Warps the dispersion curve, bunching the colors toward one end of the fan
 *   and spreading them at the other with the ends pinned; 0 spaces them evenly (-1 to 1)
 * - u_shiftAngle (float): Direction of the shift in degrees when it is not radial (0 to 360)
 * - u_perspective (float): Blends the shift from the fixed angle (0) to an outward-from-centre shift
 *   that grows with radius (1); raising it adds the off-axis shift a straight angle never had (0 to 1)
 * - u_focusCenter (float): Radius (as a fraction of the inscribed circle) over which the shift
 *   fades in from nothing at the centre; 0 leaves it full to the centre (0 to 1)
 * - u_focusEdges (float): Radius (as a fraction of the inscribed circle) over which the shift fades
 *   out to nothing at the edge; 0 leaves it full to the edge (0 to 1)
 * - u_noise (float): Turbulence added to the shift direction (0 to 1)
 * - u_noiseFrequency (float): Spatial frequency of the turbulence field; higher is finer-grained
 * - u_noiseOffset (float): Slides the turbulence field to a different patch
 * - u_distortion (float): Radial fisheye warp of the image geometry, separate from the color shift;
 *   0 leaves it flat, 1 is a full bulge with the corners running off into the background (0 to 1)
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
uniform float u_shiftAngle;
uniform float u_perspective;
uniform float u_focusCenter;
uniform float u_focusEdges;
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
                                            
float boxInradius() {
  return .5 * min(u_imageAspectRatio, 1.);
}

float boxOutradius() {
  return .5 * length(vec2(u_imageAspectRatio, 1.));
}

float shiftReach() {
  return .2 * u_shift;
}

float shiftNormRadius() {
  return boxOutradius() + shiftReach();
}

float dispersionCurve(float t) {
  float exponent = 1. + 2. * abs(u_shiftBias);
  float mirroredT = u_shiftBias < 0. ? 1. - t : t;
  float curved = pow(mirroredT, exponent);// - (pow(.5, exponent) - .5);
  return u_shiftBias < 0. ? 1. - curved : curved;
}

vec2 getShift(vec2 uv) {
  float reach = shiftReach();
  float angleRad = radians(u_shiftAngle);
  vec2 uniformDir = vec2(cos(angleRad), sin(angleRad));

  vec2 fromCenter = uv - .5;
  fromCenter.x *= u_imageAspectRatio;
  float radius = length(fromCenter);
  float inradius = boxInradius();
  float outradius = boxOutradius();

  vec2 radialDir = fromCenter / shiftNormRadius();
  float radialLen = length(radialDir);
  if (radialLen > 1.) radialDir /= radialLen;
  vec2 shiftDir = mix(uniformDir, radialDir, u_perspective);

  float inner = mix(1., smoothstep(0., mix(inradius, outradius, u_focusCenter), radius), u_focusCenter);
  float boxDist = max(abs(uv.x - .5), abs(uv.y - .5)) * 2.;
  float outer = mix(1., 1. - smoothstep(1. - u_focusEdges, 1., boxDist), u_focusEdges);
  float strength = inner * outer;

  vec2 axis = shiftDir * reach * strength;

  if (u_noise > 0.) {
    float turn = (valueNoise(fromCenter * u_noiseFrequency + u_noiseOffset) - .5) * TWO_PI * u_noise;
    float cs = cos(turn), sn = sin(turn);
    axis = mat2(cs, -sn, sn, cs) * axis;
  }

  axis.x /= u_imageAspectRatio;
  return axis;
}

vec2 imageDistortion(vec2 uv) {
  if (u_distortion <= 0.) return uv;

  vec2 fromCenter = uv - .5;
  fromCenter.x *= u_imageAspectRatio;
  float inradius = boxInradius();
  float bulge = u_distortion * 1.4;
  float tanBulge = tan(bulge);

  float radius = length(fromCenter);
  if (radius > 1e-5) {
    float srcRadius = tan(min(radius / inradius * bulge, 1.53)) / tanBulge;
    fromCenter *= srcRadius * inradius / radius;
  }

  fromCenter.x /= u_imageAspectRatio;
  return fromCenter + .5;
}

void main() {
  vec2 uv = v_imageUV;
  vec2 baseUV = imageDistortion(uv);
  vec2 shift = getShift(uv);

  int count = int(u_colorSteps);
  vec3 colorSum = vec3(0.);
  vec3 coverSum = vec3(0.);
  vec3 weightSum = vec3(0.);

  for (int i = 0; i < ${prismMeta.maxColorSteps}; i++) {
    if (i >= count) break;

    float hue = u_hue / 360. + float(i) / float(count);
    float t = float(i) / float(count - 1);

    float spread = dispersionCurve(t);
    vec2 offset = mix(shift, -shift, spread);
    vec4 tap = sampleOverBack(baseUV + offset);
    vec3 weight = 1. - hueColor(hue);

    colorSum += tap.rgb * weight;
    coverSum += tap.a * weight;
    weightSum += weight;
  }

  vec3 color = colorSum / max(weightSum, 1e-4);
  vec3 cover = coverSum / max(weightSum, 1e-4);
  fragColor = vec4(color, max(max(cover.r, cover.g), cover.b));

  if (u_debugCircle) {
    vec2 fromCenter = v_imageUV - .5;
    fromCenter.x *= u_imageAspectRatio;
    float len = length(fromCenter);
    float aaWidth = fwidth(len);
    float ringIn = 1. - smoothstep(1.5 * aaWidth, 2.5 * aaWidth, abs(len - boxInradius()));
    float ringOut = 1. - smoothstep(1.5 * aaWidth, 2.5 * aaWidth, abs(len - shiftNormRadius()));
    fragColor.rgb = mix(fragColor.rgb, vec3(1., 0., 0.), ringIn);
    fragColor.rgb = mix(fragColor.rgb, vec3(0., .4, 1.), ringOut);
    fragColor.a = max(fragColor.a, max(ringIn, ringOut));
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
  u_shiftAngle: number;
  u_perspective: number;
  u_focusCenter: number;
  u_focusEdges: number;
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
  shiftAngle?: number;
  perspective?: number;
  focusCenter?: number;
  focusEdges?: number;
  noise?: number;
  noiseFrequency?: number;
  noiseOffset?: number;
  distortion?: number;
  debugCircle?: boolean;
}

import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { simplexNoise, declarePI, colorBandingFix } from '../shader-utils.js';

/**
 * A single-colored animated spiral that morphs across a wide range of shapes -
 * from crisp, thin-lined geometry to flowing whirlpool forms and wavy, abstract rings.
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
 * Vertex shader outputs (used in fragment shader):
 * - v_patternUV (vec2): UV coordinates in pixels (scaled by 0.01 for precision), with rotation and offset applied
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colorFront (vec4): Foreground (ink) color in RGBA
 * - u_density (float): Spacing of the turns, 1 = evenly spaced, lower = denser toward the center, 0 = single radial sector (0 to 1)
 * - u_distortion (float): Power of shape distortion applied along the spiral (0 to 1)
 * - u_strokeWidth (float): Thickness of spiral curve (0 to 1)
 * - u_strokeTaper (float): How much the stroke thins away from the center, 0 = constant width, negative = stroke thickens away from the center (-1 to 1)
 * - u_strokeCap (float): Shape of the stroke end at the center, 0 = pointed, 1 = round (0 to 1)
 * - u_noise (float): Noise distortion applied over the canvas, needs noiseFrequency > 0 (0 to 1)
 * - u_noiseFrequency (float): Noise frequency, needs noise > 0 (0 to 1)
 * - u_softness (float): Color transition sharpness, 0 = hard edge, 1 = smooth gradient (0 to 1)
 *
 */

// language=GLSL
export const spiralFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorFront;
uniform float u_density;
uniform float u_distortion;
uniform float u_strokeWidth;
uniform float u_strokeCap;
uniform float u_strokeTaper;
uniform float u_noise;
uniform float u_noiseFrequency;
uniform float u_softness;

in vec2 v_patternUV;

out vec4 fragColor;

${ declarePI }
${ simplexNoise }

void spiralCurve(float s, float d, float t, float nz, out vec2 c, out vec2 cp, out vec2 cpp) {
  float sc = max(s, 1e-4);
  float L = pow(sc, d);
  float a = 4. * L - .5 * t;
  float b = PI + L + .5 * t;
  float D = u_distortion * sin(a) * cos(b);
  float dD = u_distortion * (4. * cos(a) * cos(b) - sin(a) * sin(b));
  float phi = TWO_PI * (-L + D - nz) + t;
  float phiP = TWO_PI * (-1. + dD) * d * pow(sc, d - 1.);
  vec2 dir = vec2(cos(phi), sin(phi));
  vec2 nrm = vec2(-dir.y, dir.x);
  c = s * dir;
  cp = dir + s * phiP * nrm;
  cpp = 2. * phiP * nrm - s * phiP * phiP * dir;
}

void main() {
  vec2 uv = 2. * v_patternUV;

  float t = u_time;
  float r = length(uv);
  float density = clamp(u_density, 0., 1.);
  float l = pow(max(r, 1e-6), density);
  float angle = atan(uv.y, uv.x) - t;
  float angleNormalised = angle / TWO_PI;

  float nz = 0.;
  if (u_noise > 0.) {
    nz = .125 * u_noise * snoise(16. * pow(u_noiseFrequency, 3.) * uv);
    angleNormalised += nz;
  }

  float offset = l + angleNormalised;
  offset -= u_distortion * (sin(4. * l - .5 * t) * cos(PI + l + .5 * t));
  float stripe = fract(offset);

  float shape = 2. * abs(stripe - .5);

  float exactMix = (1. - smoothstep(.6, 1., l)) * smoothstep(.1, .25, density) * clamp(u_strokeCap, 0., 1.);
  float shapeExact = shape;
  float exactPixel = 0.;
  float uvPixel = length(dFdx(uv));
  if (exactMix > 0.) {
    float dExact = max(density, .1);
    vec2 c, cp, cpp;
    float lCurve = l - (offset - floor(offset + .5));
    float bestDist = 1e4;
    float bestS = 0.;
    for (int k = 0; k < 4; k++) {
      float s = (k == 3) ? r : pow(max(lCurve + float(k - 1), 0.), 1. / dExact);
      for (int i = 0; i < 4; i++) {
        spiralCurve(s, dExact, t, nz, c, cp, cpp);
        vec2 diff = c - uv;
        float h = dot(diff, cp);
        float hp = dot(cp, cp) + dot(diff, cpp);
        s = max(s - clamp(h / max(hp, 1e-3), -.15, .15), 0.);
      }
      spiralCurve(s, dExact, t, nz, c, cp, cpp);
      float dist = length(c - uv);
      if (dist < bestDist) {
        bestDist = dist;
        bestS = s;
      }
    }

    float spacing = pow(max(bestS, .5), 1. - dExact) / dExact;
    shapeExact = 1. - 2. * bestDist / spacing;
    exactPixel = uvPixel / spacing;
  }
  shape = mix(shape, shapeExact, exactMix);

  float fw = fwidth(offset);
  float pixelSize = mix(fw, fwidth(shape), clamp(fw, 0., 1.));
  pixelSize = mix(pixelSize, exactPixel, exactMix);

  float minWidth = min(pixelSize, .5);
  float strokeWidth = clamp(u_strokeWidth, minWidth, 1. - minWidth);
  strokeWidth *= max(0., 1. - clamp(u_strokeTaper, -1., 1.) * l);
  strokeWidth = min(strokeWidth, 1.);
  float width = 1. - strokeWidth;

  float res = smoothstep(width - pixelSize - u_softness, width + pixelSize + u_softness, shape);
  res *= clamp(strokeWidth / max(pixelSize, 1e-4), 0., 1.);
  res = mix(res, 1., clamp(1. - width / max(pixelSize, 1e-4), 0., 1.));

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  ${ colorBandingFix }

  fragColor = vec4(color, opacity);
}
`;

export interface SpiralUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colorFront: [number, number, number, number];
  u_density: number;
  u_distortion: number;
  u_strokeWidth: number;
  u_strokeTaper: number;
  u_strokeCap: number;
  u_noise: number;
  u_noiseFrequency: number;
  u_softness: number;
}

export interface SpiralParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colorFront?: string;
  density?: number;
  distortion?: number;
  strokeWidth?: number;
  strokeTaper?: number;
  strokeCap?: number;
  noise?: number;
  noiseFrequency?: number;
  softness?: number;
}

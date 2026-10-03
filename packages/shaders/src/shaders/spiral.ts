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

void spiralCurve(highp float u, highp float d, highp float t, out highp vec2 c, out highp vec2 cp, out highp vec2 cpp) {
  highp float uc = max(u, 1e-4);
  highp float s = pow(uc, 1. / d);
  highp float ds = s / (d * uc);
  highp float phi = t - TWO_PI * u;
  highp vec2 dir = vec2(cos(phi), sin(phi));
  highp vec2 nrm = vec2(-dir.y, dir.x);
  c = s * dir;
  cp = ds * dir - TWO_PI * s * nrm;
  cpp = -2. * TWO_PI * ds * nrm - TWO_PI * TWO_PI * s * dir;
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
  float distortionShift = u_distortion * (sin(4. * l - .5 * t) * cos(PI + l + .5 * t));
  offset -= distortionShift;
  float stripe = fract(offset);

  float shape = 2. * abs(stripe - .5);

  float exactMix = (1. - smoothstep(.6, 1., l)) * smoothstep(.1, .25, density) * clamp(u_strokeCap, 0., 1.);
  float shapeExact = shape;
  float signedExact = 0.;
  highp float warpAngle = TWO_PI * (nz - distortionShift);
  highp vec2 uvWarp = mat2(cos(warpAngle), sin(warpAngle), -sin(warpAngle), cos(warpAngle)) * uv;
  if (exactMix > 0.) {
    highp float dExact = max(density, .1);
    highp vec2 c, cp, cpp;
    highp float lCurve = l - (offset - floor(offset + .5));
    highp float bestDist = 1e4;
    highp float bestU = 0.;
    highp float bestSigned = 0.;
    for (int k = 0; k < 3; k++) {
      highp float u = (k == 2) ? l : max(lCurve + float(k - 1), 0.);
      for (int i = 0; i < 2; i++) {
        spiralCurve(u, dExact, t, c, cp, cpp);
        highp vec2 diff = c - uvWarp;
        highp float h = dot(diff, cp);
        highp float hp = dot(cp, cp) + dot(diff, cpp);
        u = max(u - clamp(h / max(hp, 1e-4), -.15, .15), 0.);
      }
      spiralCurve(u, dExact, t, c, cp, cpp);
      highp float dist = length(c - uvWarp);
      if (dist < bestDist) {
        bestDist = dist;
        bestU = u;
        bestSigned = dot(uvWarp - c, vec2(-cp.y, cp.x)) / max(length(cp), 1e-8);
      }
    }

    highp float bestS = pow(max(bestU, 1e-4), 1. / dExact);
    highp float spacing = pow(max(bestS, .5), 1. - dExact) / dExact;
    shapeExact = 1. - 2. * bestDist / spacing;
    signedExact = bestSigned / spacing;
  }
  float exactPixel = length(vec2(dFdx(signedExact), dFdy(signedExact)));
  shape = mix(shape, shapeExact, exactMix);

  vec2 offsetGrad = vec2(dFdx(offset), dFdy(offset));
  float fw = length(offsetGrad - round(offsetGrad));
  float pixelSize = mix(fw, min(exactPixel, fw), exactMix);

  float minWidth = min(pixelSize, .5);
  float baseWidth = clamp(u_strokeWidth, minWidth, 1. - minWidth);
  float taperFactor = 1. - clamp(u_strokeTaper, -1., 1.) * l;
  float taperCut = .5 * minWidth / max(baseWidth, 1e-5);
  float taperEnd = clamp((taperFactor - taperCut) / max(fwidth(taperFactor), 1e-5) + .5, 0., 1.);
  float strokeWidth = min(max(baseWidth * taperFactor, minWidth), 1.);
  float width = 1. - strokeWidth;

  float edge = clamp((shape - width + pixelSize + u_softness) / (2. * (pixelSize + u_softness)), 0., 1.);
  float res = mix(edge, edge * edge * (3. - 2. * edge), u_softness / (u_softness + pixelSize));
  res *= taperEnd;
  res = mix(res, 1., clamp(1. - width / max(pixelSize, 1e-4), 0., 1.));

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;

  vec3 colorLinear = pow(u_colorFront.rgb, vec3(2.2)) * opacity + pow(u_colorBack.rgb, vec3(2.2)) * bgOpacity * (1. - opacity);

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  colorLinear = pow(colorLinear / max(opacity, 1e-4), vec3(1. / 2.2)) * opacity;
  color = mix(color, colorLinear, pixelSize / (pixelSize + u_softness));

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

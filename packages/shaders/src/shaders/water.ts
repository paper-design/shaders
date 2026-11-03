import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2, simplexNoise } from '../shader-utils.js';

/**
 * Water-like surface distortion with natural caustic realism. Works as an image filter or standalone animated texture.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_image (sampler2D): Optional source image texture
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colorHighlight (vec4): Highlight color in RGBA, needs highlights > 0
 * - u_highlights (float): Coloring added over image/background following caustic shape, needs colorHighlight alpha > 0 (0 to 1)
 * - u_layering (float): Power of 2nd layer of caustic distortion, needs caustic or highlights > 0 (0 to 1)
 * - u_edges (float): Caustic distortion power on the image edges, needs image and caustic > 0 (0 to 1)
 * - u_waves (float): Additional distortion based on simplex noise, independent from caustic (0 to 1)
 * - u_caustic (float): Power of caustic distortion, needs image (0 to 1)
 * - u_size (float): Pattern scale relative to the image (0.01 to 7)
 * - u_dispersion (float): Color fringing along the caustic lines, calm water stays clean, follows edges on the image frame, also splits highlights, needs image and caustic > 0, or highlights > 0 (0 to 1)
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_imageUV (vec2): UV coordinates for sampling the source image, with fit, scale, rotation, and offset applied
 *
 * Vertex shader uniforms:
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_originX (float): Reference point for positioning world width in the canvas (0 to 1)
 * - u_originY (float): Reference point for positioning world height in the canvas (0 to 1)
 * - u_worldWidth (float): Virtual width of the graphic before it's scaled to fit the canvas
 * - u_worldHeight (float): Virtual height of the graphic before it's scaled to fit the canvas
 * - u_fit (float): How to fit the rendered shader into the canvas dimensions (0 = none, 1 = contain, 2 = cover)
 * - u_scale (float): Overall zoom level of the graphics (0.1 to 4)
 * - u_rotation (float): Overall rotation angle of the graphics in degrees (0 to 360)
 * - u_offsetX (float): Horizontal offset of the graphics center (-1 to 1)
 * - u_offsetY (float): Vertical offset of the graphics center (-1 to 1)
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 *
 */

// language=GLSL
export const waterFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorHighlight;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_size;
uniform float u_highlights;
uniform float u_layering;
uniform float u_edges;
uniform float u_caustic;
uniform float u_waves;
uniform float u_dispersion;
uniform float u_pixelRatio;

in vec2 v_imageUV;

out vec4 fragColor;

${ declarePI }
${ rotation2 }
${ simplexNoise }

float getUvFrame(vec2 uv, vec2 aa) {
  float left   = smoothstep(0., aa.x, uv.x);
  float right = 1.0 - smoothstep(1. - aa.x, 1., uv.x);
  float bottom = smoothstep(0., aa.y, uv.y);
  float top = 1.0 - smoothstep(1. - aa.y, 1., uv.y);

  return left * right * bottom * top;
}

mat2 rotate2D(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

float getCausticNoise(vec2 uv, float t, float scale) {
  vec2 n = vec2(.1);
  vec2 N = vec2(.1);
  mat2 m = rotate2D(.5);
  for (int j = 0; j < 6; j++) {
    uv *= m;
    n *= m;
    vec2 q = uv * scale + float(j) + n + (.5 + .5 * float(j)) * (mod(float(j), 2.) - 1.) * t;
    n += sin(q);
    N += cos(q) / scale;
    scale *= 1.1;
  }
  return (N.x + N.y + 1.);
}

float getCaustic(vec2 uv, float wavesNoise, float t) {
  float causticNoise = getCausticNoise(uv + u_waves * vec2(1., -1.) * wavesNoise, 2. * t, 1.5);
  if (u_layering > 0.) {
    causticNoise += u_layering * getCausticNoise(uv + 2. * u_waves * vec2(1., -1.) * wavesNoise, 1.5 * t, 2.);
  }
  return causticNoise * causticNoise;
}

void main() {
  vec2 imageUV = v_imageUV;
  vec2 patternUV = v_imageUV - .5;
  patternUV = (patternUV * vec2(u_imageAspectRatio, 1.));
  patternUV /= (.01 + .09 * u_size);

  float t = u_time;

  float wavesNoise = snoise((.3 + .1 * sin(t)) * .1 * patternUV + vec2(0., .4 * t));

  float causticNoise = getCausticNoise(patternUV + u_waves * vec2(1., -1.) * wavesNoise, 2. * t, 1.5);

  if (u_layering > 0.) {
    causticNoise += u_layering * getCausticNoise(patternUV + 2. * u_waves * vec2(1., -1.) * wavesNoise, 1.5 * t, 2.);
  }
  float causticRoot = causticNoise;
  causticNoise = causticNoise * causticNoise;

  float edgesDistortion = smoothstep(0., .1, imageUV.x);
  edgesDistortion *= smoothstep(0., .1, imageUV.y);
  edgesDistortion *= (smoothstep(1., 1.1, imageUV.x) + (1.0 - smoothstep(.8, .95, imageUV.x)));
  edgesDistortion *= (1.0 - smoothstep(.9, 1., imageUV.y));
  edgesDistortion = mix(edgesDistortion, 1., u_edges);

  float causticNoiseDistortion = .02 * causticNoise * edgesDistortion;

  float wavesDistortion = .1 * u_waves * wavesNoise;

  imageUV += vec2(wavesDistortion, -wavesDistortion);
  imageUV += (u_caustic * causticNoiseDistortion);

  vec2 frameAA = vec2(2. * fwidth(imageUV.x), 2. * fwidth(imageUV.y));

  vec4 backColor = u_colorBack;
  backColor.rgb *= backColor.a;

  vec3 color;
  float opacity;

  if (u_dispersion > 0. && u_caustic > 0.) {
    vec2 imageAxisX = vec2(dFdx(v_imageUV.x), dFdy(v_imageUV.x));
    vec2 imageAxisY = vec2(dFdx(v_imageUV.y), dFdy(v_imageUV.y));
    vec2 uvPerPx = vec2(length(imageAxisX), length(imageAxisY));

    float dispersionRadius = length((v_imageUV - .5) * vec2(u_imageAspectRatio, 1.));
    float dispersionAngle = PI * (.25 + .5 * sin(14. * dispersionRadius + 4. * wavesNoise));
    vec2 dispersionDir = vec2(cos(dispersionAngle), sin(dispersionAngle));

    float causticPush = max(causticRoot, 0.);
    causticPush = u_caustic * causticPush * causticPush * edgesDistortion;
    float dispersionPx = 60. * u_pixelRatio * u_dispersion * causticPush / (causticPush + 1.);
    vec2 dispersion = dispersionPx * dispersionDir * uvPerPx;

    vec2 imageUVdx = dFdx(imageUV);
    vec2 imageUVdy = dFdy(imageUV);
    vec2 tapDx = abs(imageUVdx) + .5 * abs(dFdx(dispersion)) + abs(dispersion) / 4.;
    vec2 tapDy = abs(imageUVdy) + .5 * abs(dFdy(dispersion)) + abs(dispersion) / 4.;

    if (dispersionPx <= 0.) {
      float frame = getUvFrame(imageUV, frameAA);
      vec4 image = textureGrad(u_image, imageUV, imageUVdx, imageUVdy);
      color = mix(backColor.rgb, image.rgb, image.a * frame);
      opacity = backColor.a + image.a * frame;
    } else {
      highp float jitter = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(.06711056, .00583715))));

      vec3 dispersedColor = vec3(0.);
      vec3 dispersedCoverage = vec3(0.);
      vec3 weightSum = vec3(0.);
      vec2 tapReach = .5 * abs(dispersion) + frameAA;
      bool tapsNearFrame = any(lessThan(imageUV - tapReach, vec2(0.))) || any(greaterThan(imageUV + tapReach, vec2(1.)));
      for (int i = 0; i < 5; i++) {
        float s = (float(i) + jitter) / 5.;
        vec3 weight = clamp(1. - 2. * abs(s - vec3(0., .5, 1.)), 0., 1.);
        vec2 tapUV = imageUV + (s - .5) * dispersion;
        vec4 tap = textureGrad(u_image, tapUV, tapDx, tapDy);
        float tapCoverage = tapsNearFrame ? tap.a * getUvFrame(tapUV, frameAA) : tap.a;
        dispersedColor += weight * tap.rgb * tapCoverage;
        dispersedCoverage += weight * tapCoverage;
        weightSum += weight;
      }
      dispersedCoverage /= weightSum;
      color = backColor.rgb * (1. - dispersedCoverage) + dispersedColor / weightSum;
      opacity = backColor.a + max(dispersedCoverage.r, max(dispersedCoverage.g, dispersedCoverage.b));
    }
  } else {
    float frame = getUvFrame(imageUV, frameAA);
    vec4 image = texture(u_image, imageUV);
    color = mix(backColor.rgb, image.rgb, image.a * frame);
    opacity = backColor.a + image.a * frame;
  }

  vec3 highlightColorFringe = vec3(0.);
  float highlightOpacityFringe = 0.;
  if (u_dispersion > 0. && u_highlights > 0. && u_colorHighlight.a > 0.) {
    float highlightDelay = .08 * u_dispersion;
    float causticFringe = getCaustic(patternUV, wavesNoise, t - highlightDelay) - causticNoise;
    causticFringe *= u_highlights * u_colorHighlight.a;
    float highlightValue = max(u_colorHighlight.r, max(u_colorHighlight.g, u_colorHighlight.b));
    vec3 causticFringeRGB = vec3(causticFringe, 0., -causticFringe);
    highlightColorFringe = .05 * causticFringeRGB * (highlightValue - color) + .025 * causticFringeRGB * (.5 + .5 * wavesNoise);
    highlightOpacityFringe = .025 * abs(causticFringe) * (1.5 + .5 * wavesNoise);
  }

  float hightlight = .025 * u_highlights * causticNoise;
  hightlight *= u_colorHighlight.a;
  color = mix(color, u_colorHighlight.rgb, .05 * u_highlights * causticNoise * u_colorHighlight.a);
  opacity += hightlight;

  color += hightlight * (.5 + .5 * wavesNoise);
  opacity += hightlight * (.5 + .5 * wavesNoise);

  color += highlightColorFringe;
  opacity += highlightOpacityFringe;

  opacity = clamp(opacity, 0., 1.);

  fragColor = vec4(color, opacity);
}
`;

export interface WaterUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorBack: [number, number, number, number];
  u_colorHighlight: [number, number, number, number];
  u_highlights: number;
  u_layering: number;
  u_edges: number;
  u_caustic: number;
  u_waves: number;
  u_size: number;
  u_dispersion: number;
}

export interface WaterParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorBack?: string;
  colorHighlight?: string;
  highlights?: number;
  layering?: number;
  edges?: number;
  caustic?: number;
  waves?: number;
  size?: number;
  dispersion?: number;
}

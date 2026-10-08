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
 * - u_angle (float): Axis of the caustic distortion in degrees, waves push perpendicular to it, needs caustic or waves > 0 (0 to 360)
 * - u_dispersion (float): Color fringing that grows with the caustic distortion and follows edges on the image frame, also splits highlights, needs image and caustic > 0 or highlights > 0 (0 to 1)
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
uniform float u_angle;
uniform float u_dispersion;

in vec2 v_imageUV;

out vec4 fragColor;

${ declarePI }
${ rotation2 }
${ simplexNoise }

float getUvFrame(vec2 uv) {
  float aax = 2. * fwidth(uv.x);
  float aay = 2. * fwidth(uv.y);

  float left   = smoothstep(0., aax, uv.x);
  float right = 1.0 - smoothstep(1. - aax, 1., uv.x);
  float bottom = smoothstep(0., aay, uv.y);
  float top = 1.0 - smoothstep(1. - aay, 1., uv.y);

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

  float causticNoise = getCaustic(patternUV, wavesNoise, t);

  float angle = u_angle * PI / 180.;
  vec2 causticDir = -vec2(sin(angle), -cos(angle));
  vec2 wavesDir = vec2(causticDir.y, -causticDir.x);

  vec2 fade = .1 + .1 * abs(causticDir);
  float edgesMask = smoothstep(0., fade.x, imageUV.x);
  edgesMask *= smoothstep(0., fade.y, imageUV.y);
  edgesMask *= 1. - smoothstep(1. - fade.x, 1., imageUV.x);
  edgesMask *= 1. - smoothstep(1. - fade.y, 1., imageUV.y);
  float edgesDistortion = mix(edgesMask, 1., u_edges);

  float causticMean = 3.18 + 2.89 * u_layering + 2.43 * u_layering * u_layering;
  float causticNoiseDistortion = .0283 * u_caustic * (causticNoise - causticMean) * edgesDistortion;
  float wavesDistortion = .1414 * u_waves * wavesNoise;

  vec2 causticDistortion = causticNoiseDistortion * causticDir;
  vec2 distortion = causticDistortion + wavesDistortion * wavesDir;
  distortion.x /= u_imageAspectRatio;
  causticDistortion.x /= u_imageAspectRatio;

  float dispersion = .3 * u_dispersion * edgesDistortion;
  imageUV += distortion;
  vec2 uvR = imageUV - causticDistortion * dispersion;
  vec2 uvB = imageUV + causticDistortion * dispersion;

  float frame = getUvFrame(imageUV);
  vec3 frameRGB = vec3(frame);

  vec4 image = texture(u_image, imageUV);
  if (u_dispersion > 0.) {
    image.r = texture(u_image, uvR).r;
    image.b = texture(u_image, uvB).b;
    frameRGB.r = getUvFrame(uvR);
    frameRGB.b = getUvFrame(uvB);
  }

  vec4 backColor = u_colorBack;
  backColor.rgb *= backColor.a;

  vec3 color = mix(backColor.rgb, image.rgb, image.a * frameRGB);
  float opacity = backColor.a + image.a * frame;

  vec3 causticRGB = vec3(causticNoise);
  if (u_dispersion > 0. && u_highlights > 0.) {
    vec2 highlightShift = .15 * u_dispersion * causticDir;
    causticRGB.r = getCaustic(patternUV - highlightShift, wavesNoise, t);
    causticRGB.b = getCaustic(patternUV + highlightShift, wavesNoise, t);
  }

  vec3 highlight = .025 * u_highlights * u_colorHighlight.a * causticRGB;
  color = mix(color, u_colorHighlight.rgb, .05 * u_highlights * u_colorHighlight.a * causticRGB);
  float highlightOpacity = max(highlight.r, max(highlight.g, highlight.b));
  opacity += highlightOpacity;

  color += highlight * (.5 + .5 * wavesNoise);
  opacity += highlightOpacity * (.5 + .5 * wavesNoise);

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
  u_angle: number;
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
  angle?: number;
  dispersion?: number;
}

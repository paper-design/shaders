import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, textureRandomizerR, colorBandingFix } from '../shader-utils.js';

export const smokeRingMeta = {
  maxColorCount: 10,
  maxNoiseIterations: 8,
} as const;

/**
 * Radial multi-colored gradient shaped with layered noise for a natural, smoky aesthetic.
 *
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colors (vec4[]): Up to 10 gradient colors in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_thickness (float): Thickness of the ring shape (0.01 to 1)
 * - u_radius (float): Radius of the ring shape (0 to 1)
 * - u_innerShape (float): Ring inner fill amount (0 to 4)
 * - u_noiseIterations (float): Number of noise layers, more layers gives more details (1 to 8)
 * - u_noiseScale (float): Noise frequency (0.01 to 5)
 * - u_noiseTexture (sampler2D): Pre-computed randomizer source texture
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

// language=GLSL
export const smokeRingFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${ smokeRingMeta.maxColorCount }];
uniform float u_colorsCount;

uniform float u_thickness;
uniform float u_radius;
uniform float u_innerShape;
uniform float u_noiseScale;
uniform float u_noiseIterations;

${ sizingVariablesDeclaration }

out vec4 fragColor;

${ declarePI }
${ textureRandomizerR }
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}
float fbm(in vec2 n) {
  float total = 0.0, amplitude = .4;
  for (int i = 0; i < ${ smokeRingMeta.maxNoiseIterations }; i++) {
    if (i >= int(u_noiseIterations)) break;
    total += valueNoise(n) * amplitude;
    n *= 1.99;
    amplitude *= 0.65;
  }
  return total;
}

float getNoise(vec2 uv, vec2 pUv, float t) {
  float noiseLeft = fbm(pUv + .03 * t);
  float period = max(abs(u_noiseScale * TWO_PI), 1e-6);
  pUv.x = fract(pUv.x / period) * period;
  float noiseRight = fbm(pUv + .03 * t);
  return mix(noiseRight, noiseLeft, smoothstep(-.25, .25, uv.x));
}

float getRingShape(vec2 uv) {
  float radius = u_radius;
  float thickness = u_thickness;

  float distance = length(uv);
  float ringValue = 1. - smoothstep(radius, radius + thickness, distance);
  ringValue *= smoothstep(radius - pow(u_innerShape, 3.) * thickness, radius, distance);

  return ringValue;
}

void main() {
  vec2 shape_uv = v_objectUV;

  float t = u_time;

  float cycleDuration = 3.;
  float period2 = 2.0 * cycleDuration;
  float localTime1 = fract((0.1 * t + cycleDuration) / period2) * period2;
  float localTime2 = fract((0.1 * t) / period2) * period2;
  float timeBlend = .5 + .5 * sin(.1 * t * PI / cycleDuration - .5 * PI);

  float atg = atan(shape_uv.y, shape_uv.x) + .001;
  float l = length(shape_uv);
  vec2 polar_uv1 = vec2(atg, localTime1 - (.5 * l) + 1. / pow(max(1e-4, l), .5));
  polar_uv1 *= u_noiseScale;
  float noise1 = getNoise(shape_uv, polar_uv1, t);

  vec2 polar_uv2 = vec2(atg, localTime2 - (.5 * l) + 1. / pow(max(1e-4, l), .5));
  polar_uv2 *= u_noiseScale;
  float noise2 = getNoise(shape_uv, polar_uv2, t);

  float noise = mix(noise1, noise2, timeBlend);

  shape_uv *= (.8 + 1.2 * noise);

  float ringShape = getRingShape(shape_uv);

  float mixer = ringShape * ringShape * (u_colorsCount - 1.);
  vec4 gradient = u_colors[int(u_colorsCount) - 1];
  gradient.rgb *= gradient.a;
  for (int i = ${ smokeRingMeta.maxColorCount } - 2; i >= 0; i--) {
    float localT = clamp(mixer - float(int(u_colorsCount) - 1 - i - 1), 0., 1.);
    vec4 c = u_colors[i];
    c.rgb *= c.a;
    gradient = mix(gradient, c, localT);
  }

  vec3 color = gradient.rgb * ringShape;
  float opacity = gradient.a * ringShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${ colorBandingFix }

  fragColor = vec4(color, opacity);
}
`;

export interface SmokeRingUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_noiseScale: number;
  u_thickness: number;
  u_radius: number;
  u_innerShape: number;
  u_noiseIterations: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface SmokeRingParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  noiseScale?: number;
  thickness?: number;
  radius?: number;
  innerShape?: number;
  noiseIterations?: number;
}

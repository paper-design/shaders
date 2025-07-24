import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declareImageUV, declarePI, declareRotate, declareRandom, declareSimplexNoise } from '../shader-utils.js';

/**
 */

// language=GLSL
export const waterFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorBack;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_highlights;
uniform float u_temperature;
uniform float u_distortion;
uniform float u_layering;
uniform float u_edges;
uniform float u_caustic;
uniform float u_waves;


${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareRotate}
${declareRandom}
${declareSimplexNoise}
${declareImageUV}


vec2 random2(vec2 p) {
  return vec2(random(p), random(200. * p));
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

void main() {
  vec2 imageUV = v_imageUV;
    vec2 patternUV = v_patternUV;
//  vec2 patternUV = 7. * (v_imageUV / vec2(1., u_imageAspectRatio) - .5);

  float t = 2. * u_time;
  
  float wavesNoise = snoise((.3 + .1 * sin(t)) * .1 * patternUV + vec2(0., .4 * t));

  float causticNoise = getCausticNoise(patternUV + u_waves * wavesNoise, 2. * t, 1.5);

  causticNoise += u_layering * getCausticNoise(patternUV + 2. * u_waves * wavesNoise, 1.5 * t, 2.);
  causticNoise = pow(causticNoise, 2.);
  
  float edgesDistortion = smoothstep(0., .1, imageUV.x);
  edgesDistortion *= smoothstep(0., .1, imageUV.y);
  edgesDistortion *= (smoothstep(1., 1.1, imageUV.x) + smoothstep(.95, .8, imageUV.x));
  edgesDistortion *= smoothstep(1., .9, imageUV.y);
  edgesDistortion = mix(edgesDistortion, 1., u_edges);
  
  float causticNoiseDistortion = .01 * causticNoise * edgesDistortion;
  
  float wavesDistortion = .1 * u_waves * wavesNoise;
  
  imageUV += vec2(wavesDistortion, -wavesDistortion);
  imageUV += (u_caustic * causticNoiseDistortion);

  float frame = getUvFrame(imageUV);

  vec4 image = texture(u_image, imageUV);
  vec4 backColor = u_colorBack;
  backColor.rgb *= backColor.a;
  
  vec3 color = mix(backColor.rgb, image.rgb, image.a * frame);
  float opacity = backColor.a + image.a * frame;

  causticNoise = max(-.2, causticNoise);
  
  float hightlight = .025 * u_highlights * causticNoise;
  color *= (1. + hightlight);
  color += hightlight * vec3(.7 * u_temperature, .5 - .2 * u_temperature, 1. - u_temperature);
  opacity += hightlight;
  
  color += hightlight * (.5 + .5 * wavesNoise);
  opacity += hightlight * (.5 + .5 * wavesNoise);
  
  opacity = clamp(opacity, 0., 1.);

  fragColor = vec4(color, opacity);
}
`;

export interface WaterUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | null;
  u_colorBack: [number, number, number, number];
  u_highlights: number;
  u_temperature: number;
  u_distortion: number;
  u_layering: number;
  u_edges: number;
  u_caustic: number;
  u_waves: number;
}

export interface WaterParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string | null;
  colorBack?: string;
  highlights?: number;
  temperature?: number;
  distortion?: number;
  layering?: number;
  edges?: number;
  caustic?: number;
  waves?: number;
}

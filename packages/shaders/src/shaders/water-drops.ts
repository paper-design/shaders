import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declareRandom, declarePI, declareRotate, declareSimplexNoise, colorBandingFix } from '../shader-utils';

/**

 */
export const waterDropsFragmentShader: string = `#version 300 es
precision highp float;

uniform sampler2D u_noiseTexture;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform vec4 u_colorBack;
uniform vec4 u_shadeColor;
uniform vec4 u_specularColor;
uniform vec4 u_outlineColor;
uniform float u_dropShapeDistortion;
uniform float u_textureing;
uniform float u_specular;
uniform float u_specularNormal;
uniform float u_visibility;
uniform float u_test1;
uniform float u_test2;
uniform float u_outline;


${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareSimplexNoise}

vec2 rand2(vec2 c) {
  mat2 m = mat2(12.9898, .16180, 78.233, .31415);
  return fract(sin(m * c) * vec2(43758.5453, 14142.1));
}

vec2 noise(vec2 p) {
  vec2 co = floor(p);
  vec2 mu = fract(p);
  mu = 3. * mu * mu - 2. * mu * mu * mu;
  vec2 a = rand2((co + vec2(0., 0.)));
  vec2 b = rand2((co + vec2(1., 0.)));
  vec2 c = rand2((co + vec2(0., 1.)));
  vec2 d = rand2((co + vec2(1., 1.)));
  return mix(mix(a, b, mu.x), mix(c, d, mu.x), mu.y);
}

${declareRandom}
${declareRotate}

void main() {

    vec2 uv = v_patternUV * .002;
    
   float t = .1 * u_time;

   vec3 lightDir = normalize(vec3(-.5, .5, -.65));

   vec2 dropDistortion = noise(uv * u_dropShapeDistortion + t);
   vec2 grid_pos = TWO_PI * uv + dropDistortion;

    vec2 pos = fract(grid_pos) - .5;
    float shape = 1. - length(pos);

  vec2 cellIdx = floor(grid_pos);
  cellIdx = noise(cellIdx);
  vec2 cellIdx2 = noise(cellIdx);
  
  shape *= (.5 + .5 * u_visibility);
  
   float contour = smoothstep(.41, .43, shape);
   
    vec3 normal = normalize(vec3(normalize(pos) * sin(length(pos) * 35. * pow(u_test1, 2.)), -2.));
   


   vec3 texturing = 2. * texture(u_noiseTexture, normal.xy + .5).rgb;



   vec3 color = u_colorBack.rgb;
   float opacity = 1.;
   
   vec3 cellColor = vec3(.0, 1.1 - .5 * cellIdx2.y, cellIdx2.x);
   color = mix(u_colorBack.rgb, cellColor, contour);
   
   // color = mix(color, texturing, u_textureing * contour);
   
   float shadow = 1. - dot(normal, lightDir);
   color = mix(color, u_shadeColor.rgb, shadow * contour);
   
   
   float outlineRandomizer = .5 + .5 * cellIdx2.x;
   float outline = smoothstep(.6, .3, shape) * contour;
   color = mix(color, u_outlineColor.rgb, u_outline * outlineRandomizer * outline);

   vec3 specularNormal = normalize(vec3(normalize(pos) * sin(length(pos) * (5. + 10. * u_specularNormal)), -2.));
   float specular = smoothstep(1. - .2 * u_specular, 1.001 - .2 * u_specular, dot(specularNormal, lightDir));
   specular *= u_specularColor.a;   
   color = mix(color, u_specularColor.rgb, specular * contour);
   

   fragColor = vec4(color, opacity);
}

`;

export interface WaterDropsUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_shadeColor: [number, number, number, number];
  u_specularColor: [number, number, number, number];
  u_outlineColor: [number, number, number, number];
  u_dropShapeDistortion: number;
  u_specular: number;
  u_specularNormal: number;
  u_textureing: number;
  u_visibility: number;
  u_test1: number;
  u_test2: number;
  u_outline: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface WaterDropsParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  shadeColor?: string;
  specularColor?: string;
  outlineColor?: string;
  texturing?: number;
  dropShapeDistortion?: number;
  specular?: number;
  specularNormal?: number;
  visibility?: number;
  test1?: number;
  test2?: number;
  outline?: number;
}

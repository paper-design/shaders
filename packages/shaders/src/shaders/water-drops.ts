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
uniform vec4 u_specularColor;
uniform vec4 u_shadowColor;
uniform float u_dropShapeDistortion;
uniform float u_reflectedImage;
uniform float u_specularSize;


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

vec2 random2(vec2 p) {
  return vec2(random(p), random(200. * p));
}

vec3 voronoi(vec2 uv, float time) {
  vec2 i_uv = floor(uv);
  vec2 f_uv = fract(uv);
  
  float spreading = .25;

  float minDist = 1.;
  vec2 randomizer = vec2(0.);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 tileOffset = vec2(float(x), float(y));
      vec2 rand = random2(i_uv + tileOffset);
      vec2 cellCenter = vec2(.5 + 1e-4);
      cellCenter += spreading * cos(time + TWO_PI * rand);
      cellCenter -= .5;
      cellCenter = rotate(cellCenter, random(vec2(rand.x, rand.y)) + .1 * time);
      cellCenter += .5;
      float dist = length(tileOffset + cellCenter - f_uv);
      if (dist < minDist) {
        minDist = dist;
        randomizer = rand;
      }
      minDist = min(minDist, dist);
    }
  }

  return vec3(1. - minDist, randomizer);
}


void main() {

    vec2 uv = v_patternUV * .002;
    
   float t = .1 * u_time;

   vec3 color = u_colorBack.rgb;
   float opacity = 1.;

   vec3 lightDir = normalize(vec3(.5, .5, -.65));

   vec2 dropDistortion = noise(uv * u_dropShapeDistortion + t);
   vec2 grid_pos = TWO_PI * uv + dropDistortion;

    vec2 pos = fract(grid_pos) - .5;
    float shape = 1. - length(pos);

  vec2 cellIdx = floor(grid_pos);
  cellIdx = noise(cellIdx);
  vec2 cellIdx2 = noise(cellIdx * 100. + 1000.);
  
   float dropInnerContour = smoothstep(.41 - fwidth(shape), .41, shape);

    vec3 normal = normalize(vec3(normalize(pos) * sin(length(pos) * 6.), -2.));
    vec3 normal2 = normalize(vec3(normalize(pos) * sin(length(pos) * 10.), -2.));
   
   float specular = smoothstep(1. - .17 * u_specularSize, 1.002 - .17 * u_specularSize, dot(normal, lightDir));
   specular += smoothstep(1. - .1 * u_specularSize, 1.002 - .1 * u_specularSize, dot(normal2, lightDir));
   specular *= u_specularColor.a;

   vec2 texUv = uv + .5;
   texUv = .2 * texUv + normal.xy + .5;
   vec3 reflectedImage = texture(u_noiseTexture, texUv).rgb;

   color = mix(u_colorBack.rgb, vec3(.2 + .5 * cellIdx2.x, .7 - .5 * cellIdx2.y, 1.), dropInnerContour);
   color = mix(color, reflectedImage, u_reflectedImage * dropInnerContour);
   color = mix(color, .2 * vec3(.7 + .5 * cellIdx.x, .7 - .5 * cellIdx.y, 1.), smoothstep(.7, .3, shape) * dot(normal, lightDir) * dropInnerContour);
   color = mix(color, u_specularColor.rgb, specular * dropInnerContour);
   

   fragColor = vec4(color, opacity);
}

`;

export interface WaterDropsUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_specularColor: [number, number, number, number];
  u_shadowColor: [number, number, number, number];
  u_dropShapeDistortion: number;
  u_specularSize: number;
  u_reflectedImage: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface WaterDropsParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  specularColor?: string;
  shadowColor?: string;
  reflectedImage?: number;
  dropShapeDistortion?: number;
  specularSize?: number;
}

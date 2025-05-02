import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declarePI, declareRotate, colorBandingFix } from '../shader-utils';

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

vec2 hash(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

float voronoi(vec2 x) {
  vec2 n = floor(x);
  vec2 f = fract(x);

  float minDist = 8.0;
  for (int j = -1; j <= 1; ++j) {
    for (int i = -1; i <= 1; ++i) {
      vec2 g = vec2(i, j);
      vec2 o = hash(n + g); // hash() should return vec2 in 0-1 range
      vec2 r = g + o - f;
      float d = dot(r, r);
      minDist = min(minDist, d);
    }
  }
  return sqrt(minDist);
}

void main() {
  vec2 shape_uv = v_patternUV;
  shape_uv *= .04;

  float t = .1 * u_time;

  vec3 color = u_colorBack.rgb;
  float opacity = 1.;

  vec3 lightDirection = normalize(vec3(.5, .5, -.65));

  vec2 dropDistortion = noise(shape_uv * u_dropShapeDistortion);
  vec2 grid_pos = TWO_PI * shape_uv + dropDistortion;

  grid_pos -= lightDirection.xy;
  vec2 s = sin(grid_pos);
  float shape = (s.x + s.y);

  grid_pos += lightDirection.xy;
  s = sin(grid_pos);
  float shapeShifted = (s.x + s.y);

  vec2 cellIdx = floor(shape_uv + .25);

  float shapeSaved = shape;
  vec2 dropLifeTimeNoise = noise(cellIdx * 200.);
  float dropLifeTime = max(0., 1. - 2. * fract(t * (dropLifeTimeNoise[0] + .5) + dropLifeTimeNoise[1]));
  shape *= dropLifeTime;
  shapeShifted *= dropLifeTime;

  float showCell = step(noise(cellIdx).r, .15);
  float dropInnerContour = showCell * smoothstep(.38, .4, shape);
  
  float shadow = u_shadowColor.a * smoothstep(.3, .7, shapeShifted);
  shadow *= showCell * (1. - dropInnerContour);


  vec3 normal = normalize(-vec3(cos(grid_pos), shape));

  float diffuse = clamp(dot(normal, lightDirection), .0, 1.);
  float specular = smoothstep(1. - .1 * u_specularSize, 1.01 - .1 * u_specularSize, dot(normal, lightDirection));

  vec2 texUv = shape_uv + .5;
  texUv.y = 1. - texUv.y;
  vec2 textureDistortion = normal.xy * .7;
  vec3 reflectedImage = texture(u_noiseTexture, texUv - textureDistortion).rgb;

  color = mix(color, u_shadowColor.rgb, shadow);
  color = mix(color, reflectedImage, u_reflectedImage * smoothstep(2., .7, shapeSaved) * dropInnerContour);
  color = mix(color, u_shadowColor.rgb * diffuse, .7 * smoothstep(.7, .2, shape) * dropInnerContour);
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

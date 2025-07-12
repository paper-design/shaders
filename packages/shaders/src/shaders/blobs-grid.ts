import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declareRandom, declarePI, declareRotate, declareSimplexNoise } from '../shader-utils.js';

export const blobsGridMeta = {
  maxColorCount: 4,
} as const;

/**
 * A dot grid with distortion + 3d-simulating overlays (shades, outlines, highlights)
 *
 * Uniforms:
 * - u_colorBack, u_colorShade, u_colorSpecular, u_colorOutline (RGBA)
 * - u_colors (vec4[]), u_colorsCount (float used as integer)
 * - u_stepsPerColor: discrete color steps between u_colors
 * - u_size, u_distortion: blob size & shape
 * - u_specular, u_specularNormal: highlight size & shape (on each cell)
 * - u_outline, u_shade: 2 additional color overlays (on each cell)
 *
 */

// language=GLSL
export const blobsGridFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colors[${blobsGridMeta.maxColorCount}];
uniform float u_colorsCount;
uniform float u_stepsPerColor;

uniform vec4 u_colorBack;
uniform vec4 u_colorShade;
uniform vec4 u_colorSpecular;
uniform vec4 u_colorOutline;
uniform float u_distortion;
uniform float u_specular;
uniform float u_specularNormal;
uniform float u_size;
uniform float u_outline;
uniform float u_shade;

uniform float u_scale;

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

  vec2 uv = v_patternUV * .004;

  float t = .1 * u_time;

  vec3 lightDir = normalize(vec3(-.5, .5, -.65));

  vec2 dropDistortion = noise(uv * u_distortion + t);
  vec2 grid = TWO_PI * uv + dropDistortion;
  
  vec2 cellUV = fract(grid);
  vec2 cellIdx = floor(grid);

  // float cellInnerShadowBlur = .1;
  // float cellInnerShadow = 1.;
  // cellInnerShadow *= clamp(cellUV.x / cellInnerShadowBlur, 0., 1.);
  // cellInnerShadow *= clamp(cellUV.y / cellInnerShadowBlur, 0., 1.);
  // cellInnerShadow *= clamp((1. - cellUV.x) / cellInnerShadowBlur, 0., 1.);
  // cellInnerShadow *= clamp((1. - cellUV.y) / cellInnerShadowBlur, 0., 1.);

  vec2 pos = cellUV - .5;
  float l = length(pos);
  vec2 posNorm = normalize(pos);
  float dist = 1. - l;

  dist *= (.5 + .7 * u_size);

  const float shapeOuter = .43;
  float shapeOuterBlur = .025 / u_scale;
  float contour = smoothstep(shapeOuter, shapeOuter + shapeOuterBlur, dist);

  float colorCode = random(noise(cellIdx));
  float mixer = colorCode * (u_colorsCount - 1.);
  mixer = (colorCode - .5 / u_colorsCount) * u_colorsCount;
  float steps = max(1., u_stepsPerColor);

  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${blobsGridMeta.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;
    float localT = clamp(mixer - float(i - 1), 0.0, 1.0);
    localT = round(localT * steps) / steps;
    vec4 c = u_colors[i];
    c.rgb *= c.a;
    gradient = mix(gradient, c, localT);
  }
  
  if ((mixer < 0.) || (mixer > (u_colorsCount - 1.))) {
    float localT = mixer + 1.;
    if (mixer > (u_colorsCount - 1.)) {
      localT = mixer - (u_colorsCount - 1.);
    }
    localT = round(localT * steps) / steps;
    vec4 cFst = u_colors[0];
    cFst.rgb *= cFst.a;
    vec4 cLast = u_colors[int(u_colorsCount - 1.)];
    cLast.rgb *= cLast.a;
    gradient = mix(cLast, cFst, localT);
  }
  
  
  vec3 color = gradient.rgb;
  float opacity = gradient.a;
  
  vec3 shadeNormal = normalize(vec3(posNorm * sin(l * 10. * u_shade), -2.));
  float shade = 1. - dot(shadeNormal, lightDir);
  shade *= smoothstep(.0, .4, u_shade);
  shade *= u_colorShade.a;
  color = mix(color, u_colorShade.rgb * u_colorShade.a, shade);
  
  float outline = (1. - smoothstep(shapeOuter, shapeOuter + .5 * u_outline, dist));
  outline *= u_colorOutline.a;
  color = mix(color, u_colorOutline.rgb * u_colorOutline.a, outline);
  
  vec3 specularNormal = normalize(vec3(posNorm * sin(l * (3. + 20. * u_specularNormal)), -2.));
  float specular = smoothstep(1. - .25 * u_specular, 1.001 - .25 * u_specular, dot(specularNormal, lightDir));
  specular *= u_colorSpecular.a;
  specular -= outline;
  specular -= smoothstep(.3, .5, shade);
  specular = clamp(specular, 0., 1.);
  color = mix(color, u_colorSpecular.rgb, specular);

  // color = mix(u_colorBack.rgb, color, cellInnerShadow);
  // opacity = mix(u_colorBack.a, opacity, cellInnerShadow);
  
  color *= contour;
  opacity *= contour;
  
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  fragColor = vec4(color, opacity);
}

`;

export interface BlobsGridUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_stepsPerColor: number;
  u_colorBack: [number, number, number, number];
  u_colorShade: [number, number, number, number];
  u_colorSpecular: [number, number, number, number];
  u_colorOutline: [number, number, number, number];
  u_distortion: number;
  u_specular: number;
  u_specularNormal: number;
  u_shade: number;
  u_size: number;
  u_outline: number;
}

export interface BlobsGridParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  stepsPerColor?: number;
  colorBack?: string;
  colorShade?: string;
  colorSpecular?: string;
  colorOutline?: string;
  shade?: number;
  distortion?: number;
  specular?: number;
  specularNormal?: number;
  size?: number;
  outline?: number;
}

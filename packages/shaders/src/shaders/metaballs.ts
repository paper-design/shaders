import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declarePI, colorBandingFix } from '../shader-utils';

export const metaballsMeta = {
  maxColorCount: 8,
  maxBallsCount: 20,
} as const;

/**
 * Metaballs (circular shapes with gooey effect applied)
 * The artwork by Ksenia Kondrashova
 *
 * Uniforms include:
 * - uColors (vec4[]): Input RGBA colors
 * - uColorsCount (float): Number of active colors (`uColors` length)
 * - u_ballsNumber (float)
 * - u_ballSize (float)
 */
export const metaballsFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;

uniform vec4 u_colors[${metaballsMeta.maxColorCount}];
uniform float u_colorsCount;
uniform float u_ballSize;
uniform float u_ballSizeRange;
uniform float u_ballsNumber;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}

float hash(float x) {
  return fract(sin(x) * 43758.5453123);
}
float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), u);
}

float getBallShape(vec2 uv, vec2 c, float p) {
  float s = .5 * length(uv - c);
  s = 1. - clamp(s, 0., 1.);
  s = pow(s, p);
  return s;
}

void main() {
  vec2 shape_uv = v_objectUV;

  shape_uv += .5;

  float t = u_time + 1.;

  vec3 totalColor = vec3(0.);
  float totalShape = 0.;
  float totalOpacity = 0.;
  
  for (int i = 0; i < ${metaballsMeta.maxBallsCount}; i++) {
    if (i >= int(ceil(u_ballsNumber))) break;
  
    float idxFract = float(i) / float(${metaballsMeta.maxBallsCount});
    float angle = TWO_PI * idxFract;
  
    float speed = 1. - .2 * idxFract;
    float noiseX = noise(angle * 10. + float(i) + t * speed);
    float noiseY = noise(angle * 20. + float(i) - t * speed);
  
    vec2 pos = vec2(.5) + 1e-4 + .9 * (vec2(noiseX, noiseY) - .5);
  
    int safeIndex = i % int(u_colorsCount + 0.5);
    vec4 ballColor = u_colors[safeIndex];
    ballColor.rgb *= ballColor.a;

    float sizeFrac = 1.;
    if (float(i) > floor(u_ballsNumber - 1.)) {
      sizeFrac *= fract(u_ballsNumber);
    }

    float shape = getBallShape(shape_uv, pos, 50. - 30. * u_ballSize * sizeFrac);
    shape = smoothstep(0., 1., shape);

    totalColor += ballColor.rgb * shape;
    totalShape += shape;
    totalOpacity += ballColor.a * shape;
  }

  totalColor /= max(totalShape, 1e-4);
  totalOpacity /= max(totalShape, 1e-4);

  float edge_width = fwidth(totalShape);
  float finalShape = smoothstep(.4, .4 + edge_width, totalShape);

  vec3 color = totalColor * finalShape;
  float opacity = totalOpacity * finalShape;

  if (opacity < .005) {
    discard;
  }

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface MetaballsUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_ballsNumber: number;
  u_ballSize: number;
}

export interface MetaballsParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  ballsNumber?: number;
  ballSize?: number;
}

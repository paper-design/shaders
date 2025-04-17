import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingUniformsDeclaration,
  sizingPatternUV,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
import { declarePI } from '../shader-utils';
import { declareOklchTransforms } from '../shader-color-spaces';

export const voronoiMeta = {
  maxColorCount: 5,
} as const;

/**
 * Voronoi pattern
 * The artwork by Ksenia Kondrashova
 * Renders a number of circular shapes with gooey effect applied
 *
 * Uniforms include:
 * u_colorBack - color of borders between the cells
 * u_colorGlow - color used to fill the radial shape on the cell edges
 * u_distortion (0 ... 0.5) - how far the cell center can move from regular square grid
 * u_gap (0 .. 1) - the size of borders
 *   (can be set to zero but the edge may get glitchy due to nature of Voronoi diagram)
 * u_innerGlow (0 .. 1) - the size of shape in the center of each cell
 * u_softness (0 .. 1)
 */
export const voronoiFragmentShader: string = `#version 300 es
precision lowp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

${sizingUniformsDeclaration}

uniform sampler2D u_noiseTexture;

uniform vec4 u_colors[${voronoiMeta.maxColorCount}];
uniform float u_colorsCount;

uniform float u_stepsPerColor;
uniform float u_colorSpace;

uniform vec4 u_colorGlow;
uniform vec4 u_colorBack;
uniform float u_distortion;
uniform float u_gap;
uniform float u_innerGlow;

out vec4 fragColor;

${declarePI}

${declareOklchTransforms}

// vec2 hash(vec2 p) {
//   p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
//   return fract(sin(p) * 18.5453);
// }

vec2 hash(vec2 p) {
  vec2 uv = floor(p) / 100. + .5;
  return texture(u_noiseTexture, uv).gb;
}

vec4 voronoi(vec2 x, float t) {
  vec2 ip = floor(x);
  vec2 fp = fract(x);

  vec2 mg, mr;
  float md = 8.;
  float rand = 0.;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 raw_hash = hash(ip + g);
      vec2 o = hash(ip + g);
      o = .5 + u_distortion * sin(t + TWO_PI * o);
      vec2 r = g + o - fp;
      float d = dot(r, r);

      if (d < md) {
        md = d;
        mr = r;
        mg = g;
        rand = raw_hash.x;
      }
    }
  }

  md = 8.;
  for (int j = -2; j <= 2; j++) {
    for (int i = -2; i <= 2; i++) {
      vec2 g = mg + vec2(float(i), float(j));
      vec2 o = hash(ip + g);
      o = .5 + u_distortion * sin(t + TWO_PI * o);
      vec2 r = g + o - fp;
      if (dot(mr - r, mr - r) > .00001) {
        md = min(md, dot(.5 * (mr + r), normalize(r - mr)));
      }
    }
  }

  return vec4(md, mr, rand);
}

void main() {
  ${sizingPatternUV}

  uv *= .0125;

  float t = u_time;

  vec4 voronoiRes = voronoi(uv, t);

  float shape = clamp(voronoiRes.w, 0., 1.);
  float mixer = shape * (u_colorsCount - 1.);
  mixer = (shape - .5 / u_colorsCount) * u_colorsCount;
  float steps = max(1., u_stepsPerColor + 1.);

  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${voronoiMeta.maxColorCount}; i++) {
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

  vec3 cellColor = gradient.rgb;
  float cellOpacity = gradient.a;

  float innerGlows = length(voronoiRes.yz * u_innerGlow + .1);
  innerGlows = pow(innerGlows, 1.5);

  vec3 color = mix(cellColor, u_colorGlow.rgb * u_colorGlow.a, u_colorGlow.a * innerGlows);
  float opacity = cellOpacity + innerGlows;

  float edge = voronoiRes.x;
  float smoothEdge = .02 / (2. * u_scale) * (1. + .5 * u_gap);
  edge = smoothstep(u_gap - smoothEdge, u_gap + smoothEdge, edge);

  color = mix(u_colorBack.rgb * u_colorBack.a, color, edge);
  opacity = mix(u_colorBack.a, opacity, edge);

  fragColor = vec4(color, opacity);  
}
`;

export interface VoronoiUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_stepsPerColor: number;
  u_colorBack: [number, number, number, number];
  u_colorGlow: [number, number, number, number];
  u_distortion: number;
  u_gap: number;
  u_innerGlow: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface VoronoiParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  stepsPerColor?: number;
  colorBack?: string;
  colorGlow?: string;
  distortion?: number;
  gap?: number;
  innerGlow?: number;
}

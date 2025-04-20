import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingVariablesDeclaration,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
import { declarePI } from '../shader-utils';

export const voronoiMeta = {
  maxColorCount: 5,
} as const;

/**
 * Voronoi pattern by Ksenia Kondrashova
 * The variation of Voronoi pattern with cell edges. Big thanks to Inigo Quilez
 * https://www.shadertoy.com/view/ldl3W8
 *
 * Uniforms include:
 *
 * - `u_colors` (`vec4[]`): Array of RGBA colors used for cell filling
 * - `u_colorsCount` (`float`): Number of active colors in `u_colors`
 * - `u_colorBack` (`vec4`): RGBA color for the gaps between cells
 * - `u_colorGlow` (`vec4`): RGBA color for the radial shape on the cell edges
 * - `u_distortion` (`float`, 0 – 0.5): Controls how far cell centers can be displaced from the regular grid
 * - `u_gap` (`float`): Width of the gaps between cells (gaps can't be removed completely due to artifacts of Voronoi cells)
 * - `u_innerGlow` (`float`): Controls the size of the radial glow inside each cell
 * - `u_stepsPerColor` (`float`): Discretization of the color transition
 * - `u_noiseTexture` (`sampler2D`): Replacement of standard hash function, added for better performance
 */
export const voronoiFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;

uniform float u_scale;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colors[${voronoiMeta.maxColorCount}];
uniform float u_colorsCount;

uniform float u_stepsPerColor;
uniform vec4 u_colorGlow;
uniform vec4 u_colorBack;
uniform float u_distortion;
uniform float u_gap;
uniform float u_innerGlow;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}

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
  vec2 shape_uv = v_patternUV;
  shape_uv *= .0125;

  float t = u_time;

  vec4 voronoiRes = voronoi(shape_uv, t);

  float shape = clamp(voronoiRes.w, 0., 1.);
  float mixer = shape * (u_colorsCount - 1.);
  mixer = (shape - .5 / u_colorsCount) * u_colorsCount;
  float steps = max(1., u_stepsPerColor);

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
  float opacity = cellOpacity + u_colorGlow.a * innerGlows;

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

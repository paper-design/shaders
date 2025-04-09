import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingUniformsDeclaration,
  sizingPatternUV,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
import { declarePI, colorBandingFix } from '../shader-utils';

/**
 * Voronoi pattern
 * The artwork by Ksenia Kondrashova
 * Renders a number of circular shapes with gooey effect applied
 *
 * Uniforms include:
 * u_color1 - color #1 of mix used to fill the cell shape
 * u_color2 - color #2 of mix used to fill the cell shape
 * u_colorEdges - color of borders between the cells
 * u_colorShadow - color used to fill the radial shape on the cell edges
 * u_distance (0 ... 0.5) - how far the cell center can move from regular square grid
 * u_edgeWidth (0 .. 1) - the size of borders
 *   (can be set to zero but the edge may get glitchy due to nature of Voronoi diagram)
 * u_edgesSoftness (0 .. 1) - the blur/sharp for cell border
 * u_edgesRoundness (0 .. 1) - the additional rounding on cells
 * u_shade (0 .. 1) - the size of shape in the center of each cell
 */
export const voronoiFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

${sizingUniformsDeclaration}

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_colorShadow;
uniform vec4 u_colorEdges;
uniform float u_distance;
uniform float u_edgeWidth;
uniform float u_edgesSoftness;
uniform float u_edgesRoundness;
uniform float u_shade;

#define TWO_PI 6.28318530718

out vec4 fragColor;

${declarePI}

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 18.5453);
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
      o = .5 + u_distance * sin(t + TWO_PI * o);
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
      o = .5 + u_distance * sin(t + TWO_PI * o);
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
  
  vec3 cellColor = step(.5, voronoiRes.w) * u_color1.rgb + step(voronoiRes.w, .5) * u_color2.rgb;

  float shades = length(voronoiRes.yz * u_shade + .1);
  shades = pow(shades, 1.5);
  vec3 color = mix(cellColor, u_colorShadow.rgb, shades);

  float edge = voronoiRes.x;
  float smoothEdge = fwidth(edge);
  edge = mix(edge, edge - pow(length(voronoiRes.yz), 12.), 4000. * pow(u_edgesRoundness, 10.));
  color = mix(u_colorEdges.rgb, color, smoothstep(u_edgeWidth - smoothEdge - .25 * u_edgesSoftness, u_edgeWidth + .25 * u_edgesSoftness, edge));
    
  float opacity = 1.;
  
  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface VoronoiUniforms extends ShaderSizingUniforms {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_colorEdges: [number, number, number, number];
  u_colorShadow: [number, number, number, number];
  u_distance: number;
  u_edgeWidth: number;
  u_edgesSoftness: number;
  u_edgesRoundness: number;
  u_shade: number;
}

export interface VoronoiParams extends ShaderSizingParams, ShaderMotionParams {
  color1?: string;
  color2?: string;
  colorEdges?: string;
  colorShadow?: string;
  distance?: number;
  edgeWidth?: number;
  edgesSoftness?: number;
  edgesRoundness?: number;
  shade?: number;
}

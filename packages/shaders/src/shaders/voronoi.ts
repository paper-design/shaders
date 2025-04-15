import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingUniformsDeclaration,
  sizingPatternUV,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
import { declarePI } from '../shader-utils';

/**
 * Voronoi pattern
 * The artwork by Ksenia Kondrashova
 * Renders a number of circular shapes with gooey effect applied
 *
 * Uniforms include:
 * u_color1 - color #1 of mix used to fill the cell shape
 * u_color2 - color #2 of mix used to fill the cell shape
 * u_color3 - color #3 of mix used to fill the cell shape
 * u_colorEdges - color of borders between the cells
 * u_colorGlow - color used to fill the radial shape on the cell edges
 * u_distortion (0 ... 0.5) - how far the cell center can move from regular square grid
 * u_edgeWidth (0 .. 1) - the size of borders
 *   (can be set to zero but the edge may get glitchy due to nature of Voronoi diagram)
 * u_edgesSoftness (0 .. 1) - the blur/sharp for cell border
 * u_innerGlow (0 .. 1) - the size of shape in the center of each cell
 * u_softness (0 .. 1)
 */
export const voronoiFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

${sizingUniformsDeclaration}

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform vec4 u_colorGlow;
uniform vec4 u_colorEdges;
uniform float u_distortion;
uniform float u_edgeWidth;
uniform float u_edgesSoftness;
uniform float u_innerGlow;
uniform float u_mixing;

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

vec3 colorBlend(float shape) {

  int maxColorCount = 10;
  float colorsCount = 3.;
  float softness = u_mixing;
  bool extraSides = true;
  float test = 3.;

  float mixer = shape * (colorsCount - 1.);
  if (extraSides == true) {
    mixer = (shape - .5 / colorsCount) * colorsCount;
  }
  
  vec3 colors[3] = vec3[](
    u_color1.rgb,
    u_color2.rgb,
    u_color3.rgb
  );
  
  vec3 gradient = colors[0].rgb;
  
  for (int i = 1; i < maxColorCount; i++) {
      if (i >= int(colorsCount)) break;
      float localT = clamp(mixer - float(i - 1), 0.0, 1.0);
      
      if (test == 1.) {
        localT = smoothstep(.5 - .5 * softness, .5 + .5 * softness, localT);
      } else if (test == 2.) {
        localT = 1. / (1. + exp(-1. / (pow(softness, 2.) + 1e-3) * (localT - .5)));
      } else if (test == 3.) {
        localT = smoothstep(0., 1., localT);
        localT = 1. / (1. + exp(-1. / (pow(softness, 2.) + 1e-3) * (localT - .5)));
      }
      gradient = mix(gradient, colors[i].rgb, localT);
  }  
  return gradient;
}
  
void main() {
  ${sizingPatternUV}
  
  uv *= .0125;

  float t = u_time;

  vec4 voronoiRes = voronoi(uv, t);
    
  vec3 cellColor = colorBlend(voronoiRes.w * .998);

  float innerGlows = length(voronoiRes.yz * u_innerGlow + .1);
  innerGlows = pow(innerGlows, 1.5);
  vec3 color = mix(cellColor, u_colorGlow.rgb, innerGlows);

  float edge = voronoiRes.x;
  float smoothEdge = fwidth(edge);
  color = mix(u_colorEdges.rgb, color, smoothstep(u_edgeWidth - smoothEdge - .25 * u_edgesSoftness, u_edgeWidth + .25 * u_edgesSoftness, edge));
    
  float opacity = 1.;
  
  fragColor = vec4(color, opacity);
}
`;

export interface VoronoiUniforms extends ShaderSizingUniforms {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_colorEdges: [number, number, number, number];
  u_colorGlow: [number, number, number, number];
  u_distortion: number;
  u_edgeWidth: number;
  u_edgesSoftness: number;
  u_innerGlow: number;
  u_mixing: number;
}

export interface VoronoiParams extends ShaderSizingParams, ShaderMotionParams {
  color1?: string;
  color2?: string;
  color3?: string;
  colorEdges?: string;
  colorGlow?: string;
  distortion?: number;
  edgeWidth?: number;
  edgesSoftness?: number;
  innerGlow?: number;
  mixing?: number;
}

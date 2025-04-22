import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declarePI, declareRandom, declareRotate } from '../shader-utils';

export const dotOrbitMeta = {
  maxColorCount: 10,
} as const;

/**
 * Dot Pattern with dot moving around their grid position
 * The artwork by Ksenia Kondrashova
 * Renders a dot pattern with dot placed in the center of each cell of animated Voronoi diagram
 *
 * Uniforms include:
 * - u_colors (vec4[]): Input RGBA colors
 * - u_colorsCount (float): Number of active colors (`u_colors` length)
 * - u_stepsPerColor (float): Discretization of the color transition
 * - u_dotSize (float, 0 .. 1): Base dot radius (relative to cell size)
 * - u_dotSizeRange (float, 0 .. 1): Dot radius to vary between the cells
 * - u_spreading (float, 0 .. 1): the distance each dot can move around the regular grid
 */
export const dotOrbitFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;

uniform vec4 u_colors[${dotOrbitMeta.maxColorCount}];
uniform float u_colorsCount;
uniform float u_stepsPerColor;
uniform float u_dotSize;
uniform float u_dotSizeRange;
uniform float u_spreading;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareRandom}
${declareRotate}

vec2 random2(vec2 p) {
  return vec2(random(p), random(200. * p));
}

vec3 voronoiShape(vec2 uv, float time) {
  vec2 i_uv = floor(uv);
  vec2 f_uv = fract(uv);
  
  float spreading = .25 * clamp(u_spreading, 0., 1.);

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

  return vec3(minDist, randomizer);
}

void main() {
  
  vec2 shape_uv = v_patternUV;
  shape_uv += .5;
  shape_uv *= .015;
  
  float t = u_time;

  vec3 voronoi = voronoiShape(shape_uv, t) + 1e-4;

  float radius = .25 * clamp(u_dotSize, 0., 1.) - .5 * clamp(u_dotSizeRange, 0., 1.) * voronoi[2];
  float dist = voronoi[0];
  float edgeWidth = fwidth(dist);
  float dots = smoothstep(radius + edgeWidth, radius - edgeWidth, dist);

  float shape = voronoi[1];
  
  float mixer = shape * (u_colorsCount - 1.);
  mixer = (shape - .5 / u_colorsCount) * u_colorsCount;
  float steps = max(1., u_stepsPerColor);
  
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${dotOrbitMeta.maxColorCount}; i++) {
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

  gradient *= dots;
  vec3 color = gradient.rgb;
  float opacity = gradient.a;

  fragColor = vec4(color, opacity);
}
`;

export interface DotOrbitUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_dotSize: number;
  u_dotSizeRange: number;
  u_spreading: number;
  u_stepsPerColor: number;
}

export interface DotOrbitParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  dotSize?: number;
  dotSizeRange?: number;
  spreading?: number;
  stepsPerColor?: number;
}

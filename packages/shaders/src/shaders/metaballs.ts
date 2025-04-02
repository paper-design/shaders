import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingUniformsDeclaration,
  declarePI,
  sizingSquareUV,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
/**
 * Metaballs (circular shapes with gooey effect applied)
 * The artwork by Ksenia Kondrashova
 *
 * Uniforms include:
 * u_color1 - the mataballs gradient color #1
 * u_color2 - the mataballs gradient color #2
 * u_color3 - the mataballs gradient color #3
 * u_ballSize (0 .. 1) - the size coefficient applied to each ball
 * u_visibilityRange (0 .. 1) - to show 2 to 15 balls
 */
export const metaballsFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

${sizingUniformsDeclaration}

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_ballSize;
uniform float u_visibilityRange;

out vec4 fragColor;

${declarePI}

float hash(float x) {
  return fract(sin(x) * 43758.5453123);
}
float lerp(float a, float b, float t) {
  return a + t * (b - a);
}
float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f); // Smoothstep function for interpolation
  return lerp(hash(i), hash(i + 1.0), u);
}

float get_ball_shape(vec2 uv, vec2 c, float p) {
  float s = .5 * length(uv - c);
  s = 1. - clamp(s, 0., 1.);
  s = pow(s, p);
  return s;
}

void main() {
  ${sizingSquareUV}

  float t = u_time + 1.;

  vec3 total_color = vec3(0.);
  float total_shape = 0.;

  const int max_balls_number = 15;
  for (int i = 0; i < max_balls_number; i++) {
    vec2 pos = vec2(.5) + 1e-4;
    float idx_fract = float(i) / float(max_balls_number);
    float angle = TWO_PI * idx_fract;

    float speed = 1. - .2 * idx_fract;
    float noiseX = noise(angle * 10. + float(i) + t * speed);
    float noiseY = noise(angle * 20. + float(i) - t * speed);

    pos += .9 * (vec2(noiseX, noiseY) - .5);

    vec4 ball_color;
    if (i % 3 == 0) {
      ball_color = u_color1;
    } else if (i % 3 == 1) {
      ball_color = u_color2;
    } else {
      ball_color = u_color3;
    }

    float shape = get_ball_shape(uv, pos, 100. - 70. * u_ballSize) * ball_color.a;

    shape *= smoothstep((float(i) - 1.) / float(max_balls_number), idx_fract, u_visibilityRange);

    total_color += ball_color.rgb * shape;
    total_shape += shape;
  }

  total_color /= max(total_shape, 1e-4);

  float edge_width = fwidth(total_shape);
  float final_shape = smoothstep(.4, .4 + edge_width, total_shape);

  vec3 color = total_color * final_shape;
  float opacity = final_shape;

  if (opacity < .01) {
    discard;
  }

  fragColor = vec4(color, opacity);
}
`;

export interface MetaballsUniforms extends ShaderSizingUniforms {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_ballSize: number;
  u_visibilityRange: number;
}

export interface MetaballsParams extends ShaderSizingParams, ShaderMotionParams {
  color1?: string;
  color2?: string;
  color3?: string;
  ballSize?: number;
  visibilityRange?: number;
}

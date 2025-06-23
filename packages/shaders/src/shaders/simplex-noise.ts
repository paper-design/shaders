import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declareSimplexNoise, colorBandingFix } from '../shader-utils.js';

export const simplexNoiseMeta = {
  maxColorCount: 10,
} as const;

/**
 * Color Gradient mapped over a combination of 2 Simplex noises
 *
 * Uniforms:
 * - u_colors (vec4[]), u_colorsCount (float used as integer)
 * - u_stepsPerColor (float, used as int): discrete color steps between u_colors
 * - u_softness: color transition sharpness (0 = hard edge, 1 = smooth fade)
 *
 * */

// language=GLSL
export const simplexNoiseFragmentShader: string = `#version 300 es
precision mediump float;

uniform highp float u_time;
uniform highp float u_scale;

uniform vec4 u_colors[${simplexNoiseMeta.maxColorCount}];
uniform float u_colorsCount;
uniform float u_stepsPerColor;
uniform float u_softness;

${sizingVariablesDeclaration}

out highp vec4 fragColor;

highp vec3 permute(highp vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
highp float snoise(highp vec2 v) {
  const highp vec4 C = vec4(0.211324865405187, 0.366025403784439,
  -0.577350269189626, 0.024390243902439);
  highp vec2 i = floor(v + dot(v, C.yy));
  highp vec2 x0 = v - i + dot(i, C.xx);
  highp vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  highp vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  highp vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
  + i.x + vec3(0.0, i1.x, 1.0));
  highp vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
  dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  highp vec3 x = 2.0 * fract(p * C.www) - 1.0;
  highp vec3 h = abs(x) - 0.5;
  highp vec3 ox = floor(x + 0.5);
  highp vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  highp vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

highp float getNoise(highp vec2 uv, highp float t) {
  highp float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

float steppedSmooth(highp float t, highp float steps, highp float softness) {
  highp float stepT = floor(t * steps) / steps;
  highp float f = t * steps - floor(t * steps);

  highp float fw = 0.005 / u_scale;
  highp float smoothed = smoothstep(.5 - softness * .5 - fw, .5 + softness * .5 + fw, f);

  return stepT + smoothed / steps;
}

void main() {
  highp vec2 shape_uv = v_patternUV;
  shape_uv *= .001;

  highp float t = .2 * u_time;

  highp float shape = .5 + .5 * getNoise(shape_uv, t);

  highp float mixer = shape * (u_colorsCount - 1.);
  mixer = (shape - .5 / u_colorsCount) * u_colorsCount;

  float steps = max(1., u_stepsPerColor);

  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${simplexNoiseMeta.maxColorCount}; i++) {
      if (i >= int(u_colorsCount)) break;

      highp float localT = clamp(mixer - float(i - 1), 0., 1.);
      localT = steppedSmooth(localT, steps, u_softness);

      vec4 c = u_colors[i];
      c.rgb *= c.a;
      gradient = mix(gradient, c, localT);
  }

   if ((mixer < 0.) || (mixer > (u_colorsCount - 1.))) {
     highp float localT = mixer + 1.;
     if (mixer > (u_colorsCount - 1.)) {
       localT = mixer - (u_colorsCount - 1.);
     }
     localT = steppedSmooth(localT, steps, u_softness);
     vec4 cFst = u_colors[0];
     cFst.rgb *= cFst.a;
     vec4 cLast = u_colors[int(u_colorsCount - 1.)];
     cLast.rgb *= cLast.a;
     gradient = mix(cLast, cFst, localT);
   }

  vec3 color = gradient.rgb;
  float opacity = gradient.a;

  //$ {colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface SimplexNoiseUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_stepsPerColor: number;
  u_softness: number;
}

export interface SimplexNoiseParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  stepsPerColor?: number;
  softness?: number;
}

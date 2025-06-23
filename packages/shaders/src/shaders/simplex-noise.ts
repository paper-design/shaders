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

uniform highp vec4 u_colors[${simplexNoiseMeta.maxColorCount}];
uniform highp float u_colorsCount;
uniform highp float u_stepsPerColor;
uniform highp float u_softness;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declareSimplexNoise}

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

  highp float steps = max(1., u_stepsPerColor);

  highp vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${simplexNoiseMeta.maxColorCount}; i++) {
      if (i >= int(u_colorsCount)) break;

      highp float localT = clamp(mixer - float(i - 1), 0., 1.);
      localT = steppedSmooth(localT, steps, u_softness);

      highp vec4 c = u_colors[i];
      c.rgb *= c.a;
      gradient = mix(gradient, c, localT);
  }

   if ((mixer < 0.) || (mixer > (u_colorsCount - 1.))) {
     highp float localT = mixer + 1.;
     if (mixer > (u_colorsCount - 1.)) {
       localT = mixer - (u_colorsCount - 1.);
     }
     localT = steppedSmooth(localT, steps, u_softness);
     highp vec4 cFst = u_colors[0];
     cFst.rgb *= cFst.a;
     highp vec4 cLast = u_colors[int(u_colorsCount - 1.)];
     cLast.rgb *= cLast.a;
     gradient = mix(cLast, cFst, localT);
   }

  highp vec3 color = gradient.rgb;
  highp float opacity = gradient.a;

  ${colorBandingFix}

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

import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingUniformsDeclaration,
  sizingPatternUV,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
import { declareSimplexNoise, colorBandingFix } from '../shader-utils';

export const simplexNoiseMeta = {
  maxColorCount: 10,
} as const;

/**
 * Simplex Noise by Ksenia Kondrashova
 * Calculates a combination of 2 simplex noises with result rendered as
 * an X-5-colored gradient
 *
 * Uniforms include:
 */
export const simplexNoiseFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

${sizingUniformsDeclaration}

uniform vec4 u_colors[${simplexNoiseMeta.maxColorCount}];
uniform float u_colorsCount;
uniform float u_extraSteps;
uniform float u_softness;

out vec4 fragColor;

${declareSimplexNoise}

float getNoise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

float steppedSmooth(float t, float steps, float softness) {
    float stepT = floor(t * steps) / steps;
    float f = t * steps - floor(t * steps);
    
    float fw = 0.005 / u_scale;
    float smoothed = smoothstep(.5 - softness * .5 - fw, .5 + softness * .5 + fw, f);
        
    return stepT + smoothed / steps;
}

void main() {

  ${sizingPatternUV}
  uv *= .001;

  float t = .2 * u_time;

  float shape = .5 + .5 * getNoise(uv, t);
  
  bool u_extraSides = true;
  
  float mixer = shape * (u_colorsCount - 1.);
  if (u_extraSides == true) {
    mixer = (shape - .5 / u_colorsCount) * u_colorsCount;
  }



  float steps = max(1., u_extraSteps + 1.);

  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${simplexNoiseMeta.maxColorCount}; i++) {
      if (i >= int(u_colorsCount)) break;
      
      float localT = clamp(mixer - float(i - 1), 0., 1.);
      localT = steppedSmooth(localT, steps, u_softness);   
      
      vec4 c = u_colors[i];
      c.rgb *= c.a;
      gradient = mix(gradient, c, localT);
  }
  
  if (u_extraSides == true) {
   if ((mixer < 0.) || (mixer > (u_colorsCount - 1.))) {
     float localT = mixer + 1.;
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
  }

  vec3 color = gradient.rgb;
  float opacity = gradient.a;
  
  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface SimplexNoiseUniforms extends ShaderSizingUniforms {
  u_colors: vec4[];
  u_colorsCount: number;
  u_extraSteps: number;
  u_softness: number;
}

export interface SimplexNoiseParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  extraSteps?: number;
  softness?: number;
}

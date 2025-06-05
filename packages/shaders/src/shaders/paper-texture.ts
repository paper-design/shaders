import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declareRotate, declarePI, declareValueNoise, declareSimplexNoise } from '../shader-utils.js';

/**

 https://www.shadertoy.com/view/fsjyR3 - grain
 https://www.shadertoy.com/view/fdt3RN - curls
 https://www.shadertoy.com/view/ltsSDf - crumple
 https://www.shadertoy.com/view/4tj3DG - worley

 */
export const paperTextureFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;

uniform float u_crumplesSeed;
uniform float u_foldsSeed;
uniform float u_contrast;
uniform float u_grain;
uniform float u_curles;
uniform float u_curlesScale;
uniform float u_crumples;
uniform float u_foldsNumber;
uniform float u_folds;
uniform float u_crumplesScale;

uniform float u_blur;
uniform float u_blurSeed;

uniform sampler2D u_noiseTexture;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declareRotate}
${declarePI}
${declareSimplexNoise}


float random(vec2 p) {
  vec2 uv = floor(p) / 100. + .5;
  return texture(u_noiseTexture, uv).r;
}

${declareValueNoise}

float fbm(in vec2 n) {
  float total = 0.0, amplitude = .4;
  for (int i = 0; i < 3; i++) {
    total += valueNoise(n) * amplitude;
    n *= 1.99;
    amplitude *= 0.65;
  }
  return total;
}



float grain_hash(vec2 p) {
  vec2 uv = floor(p) / 50. + .5;
  return texture(u_noiseTexture, uv).g;
}

float grain_fbm(vec2 p) {
  p *= .1;
  float o = 0.;
  for (float i = 0.; ++i < 4.; p *= 2.1) {
    vec4 w = vec4(floor(p), ceil(p));
    vec2 f = fract(p);
    o += mix(
      mix(grain_hash(w.xy), grain_hash(w.xw), f.y),
      mix(grain_hash(w.zy), grain_hash(w.zw), f.y),
      f.x);
    o += .2 / exp(2. * abs(sin(.2 * p.x + .5 * p.y)));
  }
  return o / 3.;
}


float curley_random(vec2 p) {
  vec2 uv = floor(p) / 50. + .5;
  return texture(u_noiseTexture, uv).r;
}

float curley_valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = curley_random(i);
  float b = curley_random(i + vec2(1.0, 0.0));
  float c = curley_random(i + vec2(0.0, 1.0));
  float d = curley_random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float curleyFbm(vec2 uv) {
  float amp = 1.;
  float val = 0.;
  for (int i = 0; i < 4; i++) {
    val += amp * (curley_valueNoise(uv + float(i)) - 1.);
    uv *= 1.8;
    amp *= .5;
  }
  return val;
}

vec2 crumpled_noise(vec2 p) {
  vec2 uv = floor(p) / 50. + .5;
  return texture(u_noiseTexture, uv).gb;
}
float crumpled_voronoi2(vec2 t, float pw) {
  vec2 p = floor(t);
  float wsum = 0.;
  float cl = 0.;
  for (int y = -1; y < 2; y += 1) {
    for (int x = -1; x < 2; x += 1) {
      vec2 b = vec2(float(x), float(y));
      vec2 q = b + p;
      vec2 q2 = q - floor(q / 8.) * 8.;
      vec2 c = q + crumpled_noise(q2);
      vec2 r = c - t;

      float w = pow(smoothstep(0., 1., 1. - abs(r.x)), pw) * pow(smoothstep(0., 1., 1. - abs(r.y)), pw);

      cl += (.5 + .5 * sin((q2.x + q2.y * 5.) * 8.)) * w;
      wsum += w;
    }
  }
  return pow(cl / wsum, .5) * 2.;
}

float crumpled(vec2 uv) {
  return crumpled_voronoi2(uv * .25, 16.) * crumpled_voronoi2(uv * .5, 2.);
}





float foldsHash(in float n) {
  return fract(sin(n)*43758.5453123);
}
vec2 folds(vec2 uv) {
    vec3 pp = vec3(0.);
    float l = 9.;
    for (float i = 0.; i < 15.; i++) {
      if (i >= u_foldsNumber) break;
      
      float an = foldsHash(i + u_foldsSeed) * TWO_PI;
      float ra = sqrt(foldsHash(an));
      vec2 p = vec2(cos(an), sin(an)) * ra;
      float dist = distance(uv, p);
      l = min(l, dist);
      
      if (l == dist) {
        pp.xy = (uv - p.xy);
        pp.z = dist;
      }
    }
    return mix(pp.xy, vec2(0.), pow(pp.z, .25));
}

void main() {

  vec2 grainUv = 1.5 * (gl_FragCoord.xy - .5 * u_resolution) / u_pixelRatio;
  float grain = grain_fbm(grainUv + vec2(1., 0.)) - grain_fbm(grainUv - vec2(1., 0.));

  float crumplesSeed = .01 * u_crumplesSeed;
  vec2 crumplesUV = fract(v_patternUV * .001 * u_crumplesScale + crumplesSeed) * 32.;
  float crumples = crumpled(crumplesUV + vec2(.05, 0.)) - crumpled(crumplesUV);

  vec2 curlesUV = v_patternUV * mix(.02, .25, u_curlesScale);
  float noise = curleyFbm(curlesUV);
  float curles = length(vec2(dFdx(noise), dFdy(noise)));
  curles = pow(curles, .4) - .2;

  vec2 normal = vec2(0.);

  vec2 foldsUV = v_patternUV * .002;
  foldsUV = rotate(foldsUV, 4. * u_foldsSeed);
  vec2 w = folds(foldsUV);
  foldsUV = rotate(foldsUV + .004, .007);
  vec2 w2 = folds(foldsUV);

  normal.xy += u_folds * min(5. * u_contrast, 1.) * 4. * (w + w2);

  normal.xy += u_crumples * crumples;
  
  float blur = u_blur * 2. * smoothstep(0., 1., fbm(.0017 * v_patternUV + 10. * u_blurSeed));
  normal *= (1. - blur);

  normal.xy += u_grain * 1.5 * grain;
  normal.xy += u_curles * curles * 3. * (1. - .5 * blur);

  vec3 lightPos = vec3(1., 2., 1.);
  float res = clamp(dot(normalize(vec3(normal, 9.5 - 9. * pow(u_contrast, .1))), normalize(lightPos)), 0., 1.);

  vec3 color = mix(u_colorBack.rgb, u_colorFront.rgb, res);
  float opacity = 1.;
  
  fragColor = vec4(color, opacity);
}
`;

export interface PaperTextureUniforms extends ShaderSizingUniforms {
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_crumplesSeed: number;
  u_foldsSeed: number;
  u_contrast: number;
  u_grain: number;
  u_curles: number;
  u_curlesScale: number;
  u_crumples: number;
  u_foldsNumber: number;
  u_folds: number;
  u_blur: number;
  u_blurSeed: number;
  u_crumplesScale: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface PaperTextureParams extends ShaderSizingParams, ShaderMotionParams {
  colorFront?: string;
  colorBack?: string;
  crumplesSeed?: number;
  foldsSeed?: number;
  contrast?: number;
  grain?: number;
  curles?: number;
  curlesScale?: number;
  crumples?: number;
  foldsNumber?: number;
  folds?: number;
  blur?: number;
  blurSeed?: number;
  crumplesScale?: number;
}

import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declareRandom, declareRotate, declareSimplexNoise } from '../shader-utils';

/**

 https://www.shadertoy.com/view/fsjyR3 - grain
 https://www.shadertoy.com/view/fdt3RN - curls
 https://www.shadertoy.com/view/ltsSDf - crumple
 https://www.shadertoy.com/view/4tj3DG - worley

 */
export const paperTextureFragmentShader: string = `#version 300 es
precision highp float;


uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_brightness;
uniform float u_height;

uniform float u_grain;
uniform float u_curles;
uniform float u_crumples;
uniform float u_foldsScale;
uniform float u_folds;
uniform float u_blurScale;
uniform float u_crumplesScale;

uniform sampler2D u_noiseTexture;

uniform float u_scale;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declareRotate}
${declareSimplexNoise}





float grain_hash(vec2 p) {
  vec2 uv = floor(p) / 50. + .5;
  return texture(u_noiseTexture, uv).g;
}

float grain_fbm(vec2 p) {
    p *= .1;
    float o = 0.;
    for (float i = 0.; ++i < 4.; p *= 2.1 ) {
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

float curley_fbm(vec2 uv) {    
    float amp = 1.;
    float val = 0.;
    for(int i = 0; i < 6; i++) {
        val += amp * (curley_valueNoise(uv + float(i)) - 1.);
        uv *= 2.;
        amp *= .5;
    }
    return val;
}








float crumpled_noise(vec2 p) {
  vec2 uv = floor(p) / 50. + .5;
  return texture(u_noiseTexture, uv).b;
}
vec2 crumpled_cellPoint(vec2 cell) {
    return vec2(crumpled_noise(cell)+cos(cell.y)*0.3, crumpled_noise(cell*0.3)+sin(cell.x)*0.3);
}
float crumpled_voronoi2(vec2 t, float pw) {
    vec2 p = floor(t);
    vec3 nn = vec3(1e10);

    float wsum = 0.;
    float cl = 0.;
    for (int y = -1; y < 2; y += 1) {
        for (int x = -1; x < 2; x += 1) {
            vec2 b = vec2(float(x), float(y));
            vec2 q = b + p;
            vec2 q2 = q - floor(q / 8.) * 8.;
            vec2 c = q + crumpled_cellPoint(q2);
            vec2 r = c - t;
            vec2 r2=r;

            float d = dot(r, r);
            float w=pow(smoothstep(0., 1., 1. - abs(r2.x)), pw) * pow(smoothstep(0., 1., 1. - abs(r2.y)), pw);

            cl += (.5 + .5 * cos((q2.x + q2.y * 119.) * 8.)) * w;
            wsum += w;

            nn = mix(vec3(q2, d), nn, step(nn.z, d));
        }
    }
    return pow(cl/wsum, .5) * 2.;
}

float crumpled_voronoi(vec2 uv) {
    return crumpled_voronoi2(uv * .25, 16.) * 
    (crumpled_voronoi2(uv * .5 + vec2(crumpled_voronoi2(uv * .25, 16.)), 2.)) + 
    crumpled_voronoi2(uv * .5, 4.);// * .5;
}



vec2 rand(vec2 p) {
  vec2 uv = floor(p) / 50. + .5;
  return texture(u_noiseTexture, uv).rb;
}
vec3 worley(vec2 n, float s) {
    vec3 ret = vec3(1.);
    for(int x = -1; x < 2; x++) {
        for(int y = -1; y < 2; y++) {
            vec2 xy = vec2(x, y);
            vec2 cellIndex = floor(n / s) + xy;
            vec2 worleyPoint = rand(cellIndex);
            worleyPoint += xy - fract(n / s);
            float d = length(worleyPoint) * s;
            if (d < ret.z) {
              ret = vec3(worleyPoint, d);            
            }
        }
    }
    return ret;
}



void main() {


  // // CHEAP GRAINY NOISE
  //
   vec2 grainUv = v_patternUV * 1.3;
   float grain = grain_fbm(grainUv + vec2(1., 0.));
   grain -= grain_fbm(grainUv - vec2(1., 0.));
  
  
   // EXPENSIVE CRUMPLED

    vec2 tt = fract(v_patternUV * .001 * u_crumplesScale) * 32.;
    float x = crumpled_voronoi(tt);
    float x1 = crumpled_voronoi(tt + vec2(.1, 0.));
    float crumples = x1 - x;
  
  
  
  // // CURLY 
  //
    vec2 curlesUV = v_patternUV * .03;
    float noise = curley_fbm(curlesUV);
    float curles = length(vec2(dFdx(noise), dFdy(noise)));
    curles = (pow(curles, .4) - .5);
  
  
  
  
  
  
    vec2 uv = v_patternUV * .002;
    
    float wsize = u_foldsScale;
    float simplexx = .5 + .5 * snoise(v_patternUV * .0005 / u_foldsScale + u_blurScale);

    const int iterationCount = 2;
    vec2 normal = vec2(0.);
    float influenceFactor = u_folds * .3 * simplexx;
    for(int i = 0; i < iterationCount; ++ i) {
        vec3 w = worley(uv + float(i), wsize);
        wsize *= .6;
        normal.xy += influenceFactor * w.xy;
    }
    
    normal.xy += u_grain * grain;
    normal.xy += u_curles * curles;
    normal.xy += u_crumples * .2 * crumples;// * simplexx;

    vec3 lightPos = vec3(1., 2., u_height);
    float res = max(dot(normalize(vec3(normal, 2.)), normalize(lightPos)), 0.);
    
    res = pow(res, u_brightness);
        
    vec3 color = mix(u_colorBack.rgb, u_colorFront.rgb, res);
    float opacity = 1.;
  
  
  fragColor = vec4(color, opacity);
}
`;

export interface PaperTextureUniforms extends ShaderSizingUniforms {
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_brightness: number;
  u_height: number;
  u_grain: number;
  u_curles: number;
  u_crumples: number;
  u_foldsScale: number;
  u_folds: number;
  u_blurScale: number;
  u_crumplesScale: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface PaperTextureParams extends ShaderSizingParams, ShaderMotionParams {
  colorFront?: string;
  colorBack?: string;
  brightness?: number;
  height?: number;
  grain?: number;
  curles?: number;
  crumples?: number;
  foldsScale?: number;
  folds?: number;
  blurScale?: number;
  crumplesScale?: number;
}

import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declareRotate, declareSimplexNoise } from '../shader-utils';

/**

 https://www.shadertoy.com/view/fsjyR3 - grain
 https://www.shadertoy.com/view/fdt3RN - curls
 https://www.shadertoy.com/view/ltsSDf - crumple
 https://www.shadertoy.com/view/4tj3DG - worley

 */
export const paperTextureFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_brightness;
uniform float u_height;

uniform float u_scale;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declareRotate}
${declareSimplexNoise}




float grain_hash(vec2 p) {
    vec3 t  = fract(vec3(p.xyx) * .1031);
    t += dot(t, t.yzx + 33.33);
    return fract((t.x + t.y) * t.z);
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
        o += .2 / exp(2. * abs(sin(.2 * p.x + .1 * p.y)));
    }
    return o / 3.;
}





float crumpled_hash(float n) {
    n = mod(n, 64.);
    return fract(sin(n)*43758.5453);
}
float crumpled_noise(vec2 p) {
    return crumpled_hash(p.x + p.y*57.0);
}
float smoothNoise2(vec2 p) {
    vec2 p0 = floor(p + vec2(0.0, 0.0));
    vec2 p1 = floor(p + vec2(1.0, 0.0));
    vec2 p2 = floor(p + vec2(0.0, 1.0));
    vec2 p3 = floor(p + vec2(1.0, 1.0));
    vec2 pf = fract(p);
    return mix( mix(crumpled_noise(p0), crumpled_noise(p1), pf.x), 
               mix(crumpled_noise(p2), crumpled_noise(p3), pf.x), pf.y);
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




float curley_fbm(vec2 uv) {    
    float amp = 1.;
    float val = 0.;
    for(int i = 0; i < 6; i++) {
        val += amp * snoise(uv + float(i));
        uv *= 2.;
        amp *= .5;
    }
    return val;
}





float rand(float n) {
 return fract(cos(n*89.42)*343.42);
}
vec2 rand(vec2 n) {
 return vec2(rand(n.x*23.62-300.0+n.y*34.35),rand(n.x*45.13+256.0+n.y*38.89)); 
}

vec3 worley(vec2 n, float s) {
    vec3 ret = vec3(1.);
    for(int x = -1; x < 2; x++) {
        for(int y = -1; y < 2; y++) {
            vec2 xy = vec2(x, y);
            vec2 cellIndex = floor(n / s) + xy + 100. * s;
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
   float grainScale = 1.3;// * u_scale;
   float grain = grain_fbm(v_patternUV * grainScale + vec2(1., 0.));
   grain -= grain_fbm(v_patternUV * grainScale - vec2(1., 0.));
  
  
   // EXPENSIVE CRUMPLED

    vec2 tt = fract(v_patternUV * .001) * 32.;
    float x = crumpled_voronoi(tt);
    float x1 = crumpled_voronoi(tt + vec2(.1, 0.));
    float mixer = x1 - x;
  
  
  
  // // CURLY 
  //
    vec2 curlesUV = v_patternUV * .003;
    float noise = curley_fbm(curlesUV);
    float curles = length(vec2(dFdx(noise), dFdy(noise)));
    curles = pow(curles, .3);
  
  
  
  float simplexx = snoise(v_patternUV * .002);
  
  
  
    vec2 uv = v_patternUV * .002;
    
    float wsize = 1.;
    const int iterationCount = 5;
    vec2 normal = vec2(0.);
    float influenceFactor = 1.;
    for(int i = 0; i < iterationCount; ++ i) {
        vec3 w = worley(uv, wsize);
        wsize *= .8;

        normal.xy += influenceFactor * w.xy;

        influenceFactor *= simplexx;
    }
    
    normal.xy += grain;
    normal.xy += (-.5 + curles);
    normal.xy += .2 * mixer;

    vec3 lightPos = vec3(1., 2., 3.);
    float folds = max(dot(normalize(vec3(normal, 5.)), normalize(lightPos)), 0.);
        
    vec3 color = mix(u_colorBack.rgb, u_colorFront.rgb, folds);
    float opacity = 1.;
  
  
  fragColor = vec4(color, opacity);
}
`;

export interface PaperTextureUniforms extends ShaderSizingUniforms {
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_brightness: number;
  u_height: number;
}

export interface PaperTextureParams extends ShaderSizingParams, ShaderMotionParams {
  colorFront?: string;
  colorBack?: string;
  brightness?: number;
  height?: number;
}

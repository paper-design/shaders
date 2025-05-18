import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declareRotate } from '../shader-utils';

/**

 https://www.shadertoy.com/view/fsjyR3


 */
export const paperTextureFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_brightness;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declareRotate}




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
    n=mod(n,64.0);
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
vec3 crumpled_voronoi2(vec2 t, float pw) {
    vec2 p = floor(t);
    vec3 nn = vec3(1e10);

    float wsum = 0.;
    vec3 cl = vec3(0.);
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

            cl += vec3(.5 + .5 * cos((q2.x + q2.y * 119.) * 8.)) * w;
            wsum += w;

            nn = mix(vec3(q2, d), nn, step(nn.z, d));
        }
    }
    return pow(cl/wsum,vec3(0.5))*2.0;
}
vec3 crumpled_voronoi(vec2 t) {
    return crumpled_voronoi2(t * .25, 16.) * (crumpled_voronoi2(t * .5 + vec2(crumpled_voronoi2(t * .25, 16.)), 2.)) + crumpled_voronoi2(t * .5, 4.) * .5;
}




vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; 
}
float permute(float x) {
  return mod289(((x*34.0)+1.0)*x);
}
vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}
vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}
float snoise(vec3 v) { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  
  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;
  
  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  
  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
  
  // Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
  + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
  + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  
  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;
  
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
  
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
  
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0,0,0,0));
  
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  
  vec4 norm =  1.79284291400159 - 0.85373472095314 * vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  
  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  
  return 42. * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
float curley_fbm(vec2 uv, int oct, float seed) {    
    float amp = 1.;
    float val = 0.;
    for(int i = 0; i < oct; i++) {
        val += amp * snoise(vec3(uv, seed));
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

// returns (dx, dy, distance)
vec3 worley(vec2 n,float s) {
    vec3 ret = vec3(s * 10.);
    // look in 9 cells (n, plus 8 surrounding)
    for(int x = -1;x<2;x++) {
        for(int y = -1;y<2;y++) {
            vec2 xy = vec2(x,y);// xy can be thought of as both # of cells distance to n, and 
            vec2 cellIndex = floor(n/s) + xy;
            vec2 worleyPoint = rand(cellIndex);// random point in this cell (0-1)
            worleyPoint += xy - fract(n/s);// turn it into distance to n. ;
            float d = length(worleyPoint) * s;
            if(d < ret.z)
                ret = vec3(worleyPoint, d);
        }
    }
    return ret;
}


float applyLighting(vec2 uv, vec3 normal, vec3 LightPos) {
    vec3 LightDir = vec3(LightPos.xy - uv, LightPos.z);
    vec3 N = normalize(normal);
    vec3 L = normalize(LightDir);
    float Diffuse = max(dot(N, L), 0.0);
    return Diffuse;
}


void main() {


  // // CHEAP GRAINY NOISE
  //
   float grainScale = 1.3;
   float grain = grain_fbm((v_patternUV + vec2(1., 0.)) * grainScale) - grain_fbm((v_patternUV - vec2(1., 0.)) * grainScale);
   grain = .5 + .5 * grain;
//   vec3 color = vec3(grain);
  // float opacity = 1.;
  
  
  // // EXPENSIVE CRUMPLED
  //
  //  vec2 tt = fract((v_patternUV.xy * .003 + 1.) * .5) * 32.;
  //  float x = crumpled_voronoi(tt).r;
  //  float x1 = crumpled_voronoi(tt + vec2(1e-2, 0.)).r;
  //  float x2 = crumpled_voronoi(tt + vec2(0., 1e-2)).r;
  //
  //  float mixer = .5 + .5 * dot(normalize(vec3(.1, 1., .5)), normalize(vec3((x1 - x) / 1e-2,(x2 - x) / 1e-2, 8.)) * .5 + vec3(.5));
  //  vec3 color = mix(vec3(.0), vec3(1.), mixer);
  //  float opacity = 1.;
  
  
  
  // // CURLY 
  //
  //  vec2 uv = v_patternUV * .005;
  //  float seed = u_brightness * 100.;
  //  float noise = curley_fbm(uv, 20, seed);
  //  float l = length(vec2(dFdx(noise), dFdy(noise)));
  //  l = mix(pow(l, .1), 1., .1);
  //  vec3 color = vec3(l);
  //  float opacity = 1.;
  
  
  
  
    vec2 uv = v_patternUV * .001;
    float wsize = 0.8;
    const int iterationCount = 12;
    vec2 normal = vec2(0.);
    float influenceFactor = 1.0;
    for(int i = 0; i < iterationCount; ++ i) {
        vec3 w = worley(uv - 10., wsize);
        normal.xy += influenceFactor * w.xy;
        wsize *= 0.5;
        influenceFactor *= 0.9;
    }
    
    vec3 lightPos = vec3(2., 2., 8.);
    float folds = applyLighting(uv, vec3(normal, 3.), lightPos);
    
    folds -= .25 * grain;
    
    vec3 color = vec3(folds);
    float opacity = 1.;
  
  
  fragColor = vec4(color, opacity);
}
`;

export interface PaperTextureUniforms extends ShaderSizingUniforms {
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_brightness: number;
}

export interface PaperTextureParams extends ShaderSizingParams, ShaderMotionParams {
  colorFront?: string;
  colorBack?: string;
  brightness?: number;
}

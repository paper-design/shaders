import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingUniformsDeclaration,
  sizingPatternUV,
  sizingSquareUV,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
import { declareSimplexNoise, declarePI, declareRandom, colorBandingFix } from '../shader-utils';

/**
 */
export const grainGradientFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

${sizingUniformsDeclaration}

uniform vec4 u_colorBack;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_softness;
uniform float u_grainDistortion;
uniform float u_sandGrain;
uniform float u_shape;

out vec4 fragColor;

${declarePI}
${declareSimplexNoise}
${declareRandom}


float noisenoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  // Smoothstep for interpolation
  vec2 u = f * f * (3.0 - 2.0 * f);

  // Do the interpolation as two nested mix operations
  // If you try to do this in one big operation, there's enough precision loss to be off by 1px at cell boundaries
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float rand(vec2 n) {
  return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
float noise(vec2 n) {
  const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
  return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}
float fbm_4(vec2 n) {
  float total = 0.0, amplitude = .2;
  for (int i = 0; i < 4; i++) {
    total += noise(n) * amplitude;
    n += n;
    amplitude *= 0.6;
  }
  return total;
}


vec2 truchet(vec2 uv, float idx){
    idx = fract(((idx - .5) * 2.));
    if (idx > 0.75) {
        uv = vec2(1.0) - uv;
    } else if (idx > 0.5) {
        uv = vec2(1.0 - uv.x, uv.y);
    } else if (idx > 0.25) {
        uv = 1.0 - vec2(1.0 - uv.x, uv.y);
    }
    return uv;
}

void main() {
  
  float t = .1 * u_time;

  vec2 shapeUv = vec2(0.);
  vec2 grainUV = vec2(0.);

  if (u_shape < 3.5) {
    ${sizingPatternUV}
    shapeUv = uv;
    shapeUv *= .005;
    grainUV = pxSizeUv;
  } else {
    ${sizingSquareUV}
    shapeUv = uv;
    grainUV = pxSizeUv;
  }
  
  float shape = 0.;
  
  if (u_shape < 1.5) {
    // Sine wave
    
    float wave = cos(.5 * shapeUv.x - 2. * t) * sin(1.5 * shapeUv.x + t) * (.75 + .25 * cos(3. * t));
    shape = 1. - smoothstep(-1., 1., shapeUv.y + wave);
      
  } else if (u_shape < 2.5) {
    // Grid (dots)

    float stripeIdx = floor(2. * shapeUv.x / TWO_PI);
    float rand = fract(sin(stripeIdx * 12.9898) * 43758.5453);

    float speed = sign(rand - .5) * ceil(2. + rand);
    shape = sin(shapeUv.x) * cos(shapeUv.y + speed * t);  
    shape = pow(shape, 6.);
  
  } else if (u_shape < 3.5) {
    // Truchet pattern
    
    float n2 = noisenoise(shapeUv * .4 - 2.5 * t);
    shapeUv.x += 10.;
    shapeUv *= .6;

    vec2 tile = truchet(fract(shapeUv), random(floor(shapeUv)));

    float distance1 = length(tile);
    float distance2 = length(tile - vec2(1.));

    n2 -= .5;
    n2 *= .1;
    shape = smoothstep(.2, .55, distance1 + n2) * smoothstep(.8, .45, distance1 - n2);
    shape += smoothstep(.2, .55, distance2 + n2) * smoothstep(.8, .45, distance2 - n2);
      
  } else if (u_shape < 4.5) {  
    // Corners

    shapeUv *= .6;
    vec2 outer = vec2(.5);
    
    vec2 bl = smoothstep(vec2(0.), outer, shapeUv + vec2(.1 + .1 * sin(2. * t), .2 - .1 * sin(3. * t)));
    vec2 tr = smoothstep(vec2(0.), outer, 1. - shapeUv);
    shape = 1. - bl.x * bl.y * tr.x * tr.y;
    
    shapeUv = -shapeUv;
    bl = smoothstep(vec2(0.), outer, shapeUv + vec2(.1 + .1 * sin(2. * t), .2 - .1 * cos(3. * t)));
    tr = smoothstep(vec2(0.), outer, 1. - shapeUv);
    shape -= bl.x * bl.y * tr.x * tr.y; 
    
    shape = 1. - smoothstep(0., 1.2, shape);
    
  } else if (u_shape < 5.5) {  
    // Ripple
  
    shapeUv *= 2.;
    float dist = length(.4 * shapeUv);
    float waves = sin(pow(dist, 1.2) * 5. - 3. * t) * .5 + .5;
    shape = waves;

  } else if (u_shape < 6.5) {
    // Blob

    t *= 2.;
       
    vec2 f1_traj = .25 * vec2(1.3 * sin(t), .2 + 1.3 * cos(.6 * t + 4.));
    vec2 f2_traj = .2 * vec2(1.2 * sin(-t), 1.3 * sin(1.6 * t));
    vec2 f3_traj = .25 * vec2(1.7 * cos(-.6 * t), cos(-1.6 * t));
    vec2 f4_traj = .3 * vec2(1.4 * cos(.8 * t), 1.2 * sin(-.6 * t - 3.));
    
    shape = .5 * pow(1. - clamp(0., 1., length(shapeUv + f1_traj)), 5.);
    shape += .5 * pow(1. - clamp(0., 1., length(shapeUv + f2_traj)), 5.);
    shape += .5 * pow(1. - clamp(0., 1., length(shapeUv + f3_traj)), 5.);
    shape += .5 * pow(1. - clamp(0., 1., length(shapeUv + f4_traj)), 5.);
    
    shape = smoothstep(.0, .5, shape);
    float edge = smoothstep(.45, .46, shape);
    shape = mix(.1, shape, edge);
    
  } else {
    // Sphere

    shapeUv *= 2.;
    float d = length(shapeUv);
    vec3 pos = vec3(shapeUv, sqrt(1. - clamp(d, 0., 1.)));
    vec3 lightPos = normalize(vec3(cos(3. * t), 0.8, sin(2.5 * t)));
    float lighting = dot(lightPos, pos);
    float edge = smoothstep(1., .98, d);
    shape = mix(.1, .5 + .5 * lighting, edge);
  }
  
  float snoise05 = snoise(grainUV * .5);
  float grainDist = snoise(grainUV * .2) * snoise05 - fbm_4(.002 * grainUV + 10.) - fbm_4(.003 * grainUV);
  float sandGrain = clamp(.6 * snoise05 - fbm_4(.4 * grainUV) - fbm_4(.001 * grainUV), 0., 1.);

  shape += u_grainDistortion * .3 * (grainDist + .3);
  shape += u_sandGrain * 2. * sandGrain;

  float edge_w = fwidth(shape);

  vec3 colorBack = u_colorBack.rgb * u_colorBack.a;
  vec3 color1 = u_color1.rgb * u_color1.a;
  vec3 color2 = u_color2.rgb * u_color2.a;
  vec3 color3 = u_color3.rgb * u_color3.a;
  
  vec3 borders = vec3(.25, .5, .75);
  vec2 borders1 = vec2(borders[0] - .5 * u_softness, borders[0] + .5 * u_softness + edge_w);
  vec2 borders2 = vec2(borders[1] - .5 * u_softness - edge_w, borders[1] + .5 * u_softness + edge_w);
  vec2 borders3 = vec2(borders[2] - .5 * u_softness - edge_w, borders[2] + .5 * u_softness + edge_w);
  float shape1 = smoothstep(borders1[0], borders1[1], shape);
  float shape2 = smoothstep(borders2[0], borders2[1], shape);
  float shape3 = smoothstep(borders3[0], borders3[1], shape);

  vec3 color = mix(colorBack, color1, shape1);
  color = mix(color, color2, shape2);
  color = mix(color, color3, shape3);

  float opacity = mix(u_colorBack.a, u_color1.a, shape1);
  opacity = mix(opacity, u_color2.a, shape2);
  opacity = mix(opacity, u_color3.a, shape3);
    
  fragColor = vec4(color, opacity);
}
`;

export interface GrainGradientUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_softness: number;
  u_grainDistortion: number;
  u_sandGrain: number;
  u_shape: number;
}

export interface GrainGradientParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  softness?: number;
  grainDistortion?: number;
  sandGrain?: number;
  shape?: number;
}

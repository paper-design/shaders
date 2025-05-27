import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declareSimplexNoise, declarePI, declareRandom, declareValueNoise, colorBandingFix } from '../shader-utils.js';

export const grainGradientMeta = {
  maxColorCount: 7,
} as const;

/**
 * Multi-color gradient with noise & grain over animated abstract shapes
 *
 * Uniforms:
 * - u_colorBack (RGBA)
 * - u_colors (vec4[]), u_colorsCount (float used as integer)
 * - u_softness (0..1): blur between color bands
 * - u_intensity (0..1): distortion between color bands
 * - u_noise (0..1): grainy noise independent of softness
 * - u_shape (float used as integer):
 * ---- 1: single sine wave
 * ---- 2: dots pattern
 * ---- 3: truchet pattern
 * ---- 4: corners (2 rounded rectangles)
 * ---- 5: ripple
 * ---- 6: blob (metaballs)
 * ---- 7: circle imitating 3d look
 *
 * Note: grains are calculated using gl_FragCoord & u_resolution, meaning grains don't react to scaling and fit
 *
 */
export const grainGradientFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${grainGradientMeta.maxColorCount}];
uniform float u_colorsCount;
uniform float u_softness;
uniform float u_intensity;
uniform float u_noise;
uniform float u_shape;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareSimplexNoise}
${declareRandom}
${declareValueNoise}


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

  vec2 grain_uv = (gl_FragCoord.xy - .5 * u_resolution) / u_pixelRatio;
  vec2 shape_uv = v_objectUV;
  if (u_shape < 3.5) {
    shape_uv = v_patternUV * .005;
  }


  float shape = 0.;

  if (u_shape < 1.5) {
    // Sine wave

    float wave = cos(.5 * shape_uv.x - 2. * t) * sin(1.5 * shape_uv.x + t) * (.75 + .25 * cos(3. * t));
    shape = 1. - smoothstep(-1., 1., shape_uv.y + wave);

  } else if (u_shape < 2.5) {
    // Grid (dots)

    float stripeIdx = floor(2. * shape_uv.x / TWO_PI);
    float rand = fract(sin(stripeIdx * 12.9898) * 43758.5453);

    float speed = sign(rand - .5) * ceil(2. + rand);
    shape = sin(shape_uv.x) * cos(shape_uv.y + speed * t);
    shape = pow(shape, 4.);

  } else if (u_shape < 3.5) {
    // Truchet pattern
    
    float n2 = valueNoise(shape_uv * .4 - 2.5 * t);
    shape_uv.x += 10.;
    shape_uv *= .6;

    vec2 tile = truchet(fract(shape_uv), random(floor(shape_uv)));

    float distance1 = length(tile);
    float distance2 = length(tile - vec2(1.));

    n2 -= .5;
    n2 *= .1;
    shape = smoothstep(.2, .55, distance1 + n2) * smoothstep(.8, .45, distance1 - n2);
    shape += smoothstep(.2, .55, distance2 + n2) * smoothstep(.8, .45, distance2 - n2);

    shape = pow(shape, 1.5);

  } else if (u_shape < 4.5) {
    // Corners

    shape_uv *= .6;
    vec2 outer = vec2(.5);

    vec2 bl = smoothstep(vec2(0.), outer, shape_uv + vec2(.1 + .1 * sin(2. * t), .2 - .1 * sin(3. * t)));
    vec2 tr = smoothstep(vec2(0.), outer, 1. - shape_uv);
    shape = 1. - bl.x * bl.y * tr.x * tr.y;

    shape_uv = -shape_uv;
    bl = smoothstep(vec2(0.), outer, shape_uv + vec2(.1 + .1 * sin(2. * t), .2 - .1 * cos(3. * t)));
    tr = smoothstep(vec2(0.), outer, 1. - shape_uv);
    shape -= bl.x * bl.y * tr.x * tr.y;

    shape = 1. - smoothstep(0., 1., shape);

  } else if (u_shape < 5.5) {
    // Ripple

    shape_uv *= 2.;
    float dist = length(.4 * shape_uv);
    float waves = sin(pow(dist, 1.2) * 5. - 3. * t) * .5 + .5;
    shape = waves;

  } else if (u_shape < 6.5) {
    // Blob

    t *= 2.;

    vec2 f1_traj = .25 * vec2(1.3 * sin(t), .2 + 1.3 * cos(.6 * t + 4.));
    vec2 f2_traj = .2 * vec2(1.2 * sin(-t), 1.3 * sin(1.6 * t));
    vec2 f3_traj = .25 * vec2(1.7 * cos(-.6 * t), cos(-1.6 * t));
    vec2 f4_traj = .3 * vec2(1.4 * cos(.8 * t), 1.2 * sin(-.6 * t - 3.));

    shape = .5 * pow(1. - clamp(0., 1., length(shape_uv + f1_traj)), 5.);
    shape += .5 * pow(1. - clamp(0., 1., length(shape_uv + f2_traj)), 5.);
    shape += .5 * pow(1. - clamp(0., 1., length(shape_uv + f3_traj)), 5.);
    shape += .5 * pow(1. - clamp(0., 1., length(shape_uv + f4_traj)), 5.);

    shape = smoothstep(.0, .9, shape);
    float edge = smoothstep(.25, .3, shape);
    shape = mix(.0, shape, edge);

  } else {
    // Sphere

    shape_uv *= 2.;
    float d = length(shape_uv);
    float z = sqrt(1.0 - clamp(pow(d, 2.0), 0.0, 1.0));
    vec3 pos = vec3(shape_uv, z);
    vec3 lightPos = normalize(vec3(cos(3. * t), 0.8, sin(2.5 * t)));
    float lighting = dot(lightPos, pos);
    float edge = smoothstep(1., .97, d);
    shape = mix(.1, .5 + .5 * lighting, edge);
  }

  float snoise05 = snoise(grain_uv * .5);
  float grainDist = snoise(grain_uv * .2) * snoise05 - fbm_4(.002 * grain_uv + 10.) - fbm_4(.003 * grain_uv);
  float noise = clamp(.6 * snoise05 - fbm_4(.4 * grain_uv) - fbm_4(.001 * grain_uv), 0., 1.);

  shape += u_intensity * 2. / u_colorsCount * (grainDist + .5);
  shape += u_noise * 10. / u_colorsCount * noise;

  float edge_w = fwidth(shape);

  float mixer = shape * (u_colorsCount + 1.) / u_colorsCount;
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;

  for (int i = 1; i < ${grainGradientMeta.maxColorCount}; i++) {
      if (i > int(u_colorsCount) - 1) break;

      vec2 borders = vec2(float(i + 1) - u_softness - edge_w, float(i + 1) + u_softness + edge_w) / u_colorsCount;
      float localT = smoothstep(borders[0], borders[1], mixer);
      vec4 c = u_colors[i];
      c.rgb *= c.a;
      gradient = mix(gradient, c, localT);
  }

  vec2 borders = vec2(2. / (u_colorsCount - 1.));
  borders = vec2(borders[0] - u_softness - edge_w, borders[1] + u_softness + edge_w) / u_colorsCount;
  borders[0] = max(0., borders[0]);
  float gradientShape = smoothstep(borders[0], borders[1], mixer);

  vec3 color = gradient.rgb * gradientShape;
  float opacity = gradient.a * gradientShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u_colorBack.a * (1.0 - opacity);

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface GrainGradientUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_softness: number;
  u_intensity: number;
  u_noise: number;
  u_shape: (typeof GrainGradientShapes)[GrainGradientShape];
}

export interface GrainGradientParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  softness?: number;
  intensity?: number;
  noise?: number;
  shape?: GrainGradientShape;
}

export const GrainGradientShapes = {
  wave: 1,
  dots: 2,
  truchet: 3,
  corners: 4,
  ripple: 5,
  blob: 6,
  sphere: 7,
};

export type GrainGradientShape = keyof typeof GrainGradientShapes;

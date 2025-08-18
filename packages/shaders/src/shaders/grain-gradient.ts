import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import {
  sizingVariablesDeclaration,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing.js';
import {
  simplexNoise,
  declarePI,
  rotation2,
  textureRandomizerR,
  proceduralHash21,
  proceduralHash11,
} from '../shader-utils.js';

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
 * - u_noiseTexture (sampler2D): pre-computed randomizer source
 *
 * Note: grains are calculated using gl_FragCoord & u_resolution, meaning grains don't react to scaling and fit
 *
 */

// language=GLSL
export const grainGradientFragmentShader: string = `#version 300 es
precision lowp float;

uniform mediump float u_time;
uniform mediump vec2 u_resolution;
uniform mediump float u_pixelRatio;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${grainGradientMeta.maxColorCount}];
uniform float u_colorsCount;
uniform float u_softness;
uniform float u_intensity;
uniform float u_noise;
uniform float u_shape;

uniform mediump float u_originX;
uniform mediump float u_originY;
uniform mediump float u_worldWidth;
uniform mediump float u_worldHeight;
uniform mediump float u_fit;

uniform mediump float u_scale;
uniform mediump float u_rotation;
uniform mediump float u_offsetX;
uniform mediump float u_offsetY;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${simplexNoise}
${rotation2}
${proceduralHash21}
${textureRandomizerR}
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}
float fbm(vec2 n) {
  float total = 0.;
  float amplitude = .2;
  for (int i = 0; i < 3; i++) {
    n = rotate(n, .3);
    total += valueNoise(n) * amplitude;
    n += n;
    amplitude *= 0.6;
  }
  return total;
}

float valueNoiseR(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}
float fbmR(vec2 n) {
  float total = 0.;
  float amplitude = .2;
  for (int i = 0; i < 3; i++) {
    n = rotate(n, .3);
    total += valueNoiseR(n) * amplitude;
    n += n;
    amplitude *= 0.6;
  }
  return total;
}

${proceduralHash11}

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

  vec2 shape_uv = vec2(0.);
  vec2 grain_uv1 = gl_FragCoord.xy / u_resolution.xy;
  grain_uv1 -= .5;
  vec2 grain_uv2 = vec2(0.);
  vec2 grain_uv3 = vec2(0.);
  vec2 grain_uv4 = vec2(0.);
  vec2 grain_uv5 = vec2(0.);
  vec2 grain_uv6 = vec2(0.);
  vec2 addon = vec2(0.);

  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  vec2 maxBoxSize = vec2(max(u_resolution.x, givenBoxSize.x), max(u_resolution.y, givenBoxSize.y));
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  if (u_shape > 3.5) {
    shape_uv = v_objectUV;

    vec2 fixedRatioBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
    );
    vec2 objectBoxSize = vec2(0.);
    // fit = none
    objectBoxSize.x = min(fixedRatioBoxGivenSize.x, fixedRatioBoxGivenSize.y);
    if (u_fit == 1.) { // fit = contain
      objectBoxSize.x = min(maxBoxSize.x, maxBoxSize.y);
    } else if (u_fit == 2.) { // fit = cover
      objectBoxSize.x = max(maxBoxSize.x, maxBoxSize.y);
    }
    objectBoxSize.y = objectBoxSize.x;
    vec2 objectWorldScale = u_resolution.xy / objectBoxSize;

    grain_uv1 *= objectWorldScale;
    addon = (boxOrigin * (objectWorldScale - 1.));
    grain_uv1 *= 350.;

  } else {
    shape_uv = .5 * v_patternUV;

    float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
    vec2 patternBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
    );
    vec2 patternBoxSize = vec2(0.);
    // fit = none
    patternBoxSize.x = patternBoxRatio * min(patternBoxGivenSize.x / patternBoxRatio, patternBoxGivenSize.y);
    float patternWorldNoFitBoxWidth = patternBoxSize.x;
    if (u_fit == 1.) { // fit = contain
      patternBoxSize.x = patternBoxRatio * min(maxBoxSize.x / patternBoxRatio, maxBoxSize.y);
    } else if (u_fit == 2.) { // fit = cover
      patternBoxSize.x = patternBoxRatio * max(maxBoxSize.x / patternBoxRatio, maxBoxSize.y);
    }
    patternBoxSize.y = patternBoxSize.x / patternBoxRatio;
    vec2 patternWorldScale = u_resolution.xy / patternBoxSize;

    grain_uv1 += boxOrigin;
    grain_uv1 -= boxOrigin / patternWorldScale;
    grain_uv1 *= u_resolution.xy;
    grain_uv1 /= u_pixelRatio;
    if (u_fit > 0.) {
      grain_uv1 *= (patternWorldNoFitBoxWidth / patternBoxSize.x);
    }
    grain_uv1 *= .5;
    addon = (boxOrigin / patternWorldScale - boxOrigin + .5);
  }

  grain_uv2 = grain_uv1 * .4;
  grain_uv3 = grain_uv1 * .004;
  grain_uv4 = grain_uv1 * .006;
  grain_uv5 = grain_uv1 * .8;
  grain_uv6 = grain_uv1 * .002;
  grain_uv1 += addon;
  grain_uv2 += addon;
  grain_uv3 += addon;
  grain_uv4 += addon;
  grain_uv5 += addon;
  grain_uv6 += addon;


  float shape = 0.;

  if (u_shape < 1.5) {
    // Sine wave

    float wave = cos(.5 * shape_uv.x - 4. * t) * sin(1.5 * shape_uv.x + 2. * t) * (.75 + .25 * cos(6. * t));
    shape = 1. - smoothstep(-1., 1., shape_uv.y + wave);

  } else if (u_shape < 2.5) {
    // Grid (dots)

    float stripeIdx = floor(2. * shape_uv.x / TWO_PI);
    float rand = hash11(stripeIdx + 2.);
    rand = sign(rand - .5) * pow(.2 + abs(rand), .3);
    shape = sin(shape_uv.x) * cos(shape_uv.y - 5. * rand * t);
    shape = pow(shape, 4.);

  } else if (u_shape < 3.5) {
    // Truchet pattern

    float n2 = valueNoiseR(shape_uv * .4 - 3.75 * t);
    shape_uv.x += 10.;
    shape_uv *= .6;

    vec2 tile = truchet(fract(shape_uv), randomR(floor(shape_uv)));

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

    vec2 bl = smoothstep(vec2(0.), outer, shape_uv + vec2(.1 + .1 * sin(3. * t), .2 - .1 * sin(5.25 * t)));
    vec2 tr = smoothstep(vec2(0.), outer, 1. - shape_uv);
    shape = 1. - bl.x * bl.y * tr.x * tr.y;

    shape_uv = -shape_uv;
    bl = smoothstep(vec2(0.), outer, shape_uv + vec2(.1 + .1 * sin(3. * t), .2 - .1 * cos(5.25 * t)));
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
    float d = 1. - pow(length(shape_uv), 2.);
    vec3 pos = vec3(shape_uv, sqrt(d));
    vec3 lightPos = normalize(vec3(cos(1.5 * t), .8, sin(1.25 * t)));
    shape = .5 + .5 * dot(lightPos, pos);
    shape *= step(0., d);
  }

  float simplex = snoise(grain_uv1);
  float grainDist = simplex * snoise(grain_uv2) - fbmR(grain_uv3) - fbmR(grain_uv4);
  float noise = clamp(.65 * simplex - fbm(grain_uv5) - fbm(grain_uv6), 0., 1.);

  shape += u_intensity * 2. / u_colorsCount * (grainDist + .5);
  shape += u_noise * 10. / u_colorsCount * noise;

  float aa = fwidth(shape);

  shape = clamp(shape - .5 / u_colorsCount, 0., 1.);
  float totalShape = smoothstep(0., u_softness + 2. * aa, clamp(shape * u_colorsCount, 0., 1.));
  float mixer = shape * (u_colorsCount - 1.);

  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${grainGradientMeta.maxColorCount}; i++) {
    if (i > int(u_colorsCount) - 1) break;

    float localT = clamp(mixer - float(i - 1), 0., 1.);
    localT = smoothstep(.5 - .5 * u_softness - aa, .5 + .5 * u_softness + aa, localT);

    vec4 c = u_colors[i];
    c.rgb *= c.a;
    gradient = mix(gradient, c, localT);
  }

  vec3 color = gradient.rgb * totalShape;
  float opacity = gradient.a * totalShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u_colorBack.a * (1.0 - opacity);

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
  u_noiseTexture?: HTMLImageElement;
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

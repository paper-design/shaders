import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, colorBandingFix } from '../shader-utils.js';

/**
 * 3d Perlin noise with exposed parameters
 * Based on https://www.shadertoy.com/view/NlSGDz
 *
 * Uniforms include:
 * u_colorFront - the first mixed color
 * u_colorBack - the second mixed color
 * u_proportion (0 .. 1) - the proportion between u_colorFront and u_colorBack;
 * u_softness - the sharpness of the transition between u_colorFront and u_colorBack in the noise output
 * u_octaveCount - the number of octaves for Perlin noise;
 *    higher values increase the complexity of the noise
 * u_persistence (0 .. 1) - the amplitude of each successive octave of the noise;
 *    lower values make higher octaves less pronounced
 * u_lacunarity - the frequency of each successive octave of the noise;
 *    higher values increase the detail
 */
export const perlinNoiseFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_proportion;
uniform float u_softness;
uniform float u_octaveCount;
uniform float u_persistence;
uniform float u_lacunarity;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}

uint hash(uint x, uint seed) {
  const uint m = 0x5bd1e995U;
  uint hash = seed;
    // process input
    uint k = x;
    k *= m;
    k ^= k >> 24;
    k *= m;
    hash *= m;
    hash ^= k;
    // some final mixing
    hash ^= hash >> 13;
    hash *= m;
    hash ^= hash >> 15;
    return hash;
}

uint hash(uvec3 x, uint seed){
    const uint m = 0x5bd1e995U;
    uint hash = seed;
    // process first vector element
    uint k = x.x;
    k *= m;
    k ^= k >> 24;
    k *= m;
    hash *= m;
    hash ^= k;
    // process second vector element
    k = x.y;
    k *= m;
    k ^= k >> 24;
    k *= m;
    hash *= m;
    hash ^= k;
    // process third vector element
    k = x.z;
    k *= m;
    k ^= k >> 24;
    k *= m;
    hash *= m;
    hash ^= k;
    // some final mixing
    hash ^= hash >> 13;
    hash *= m;
    hash ^= hash >> 15;
    return hash;
}


vec3 gradientdy(uint hash) {
    switch (int(hash) & 15) { // look at the last four bits to pick a gradient dy
    case 0:
        return vec3(1, 1, 0);
    case 1:
        return vec3(-1, 1, 0);
    case 2:
        return vec3(1, -1, 0);
    case 3:
        return vec3(-1, -1, 0);
    case 4:
        return vec3(1, 0, 1);
    case 5:
        return vec3(-1, 0, 1);
    case 6:
        return vec3(1, 0, -1);
    case 7:
        return vec3(-1, 0, -1);
    case 8:
        return vec3(0, 1, 1);
    case 9:
        return vec3(0, -1, 1);
    case 10:
        return vec3(0, 1, -1);
    case 11:
        return vec3(0, -1, -1);
    case 12:
        return vec3(1, 1, 0);
    case 13:
        return vec3(-1, 1, 0);
    case 14:
        return vec3(0, -1, 1);
    case 15:
        return vec3(0, -1, -1);
    }
}

float interpolate(float value1, float value2, float value3, float value4, float value5, float value6, float value7, float value8, vec3 t) {
    return mix(
        mix(mix(value1, value2, t.x), mix(value3, value4, t.x), t.y),
        mix(mix(value5, value6, t.x), mix(value7, value8, t.x), t.y),
        t.z
    );
}

vec3 fade(vec3 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float perlinNoise(vec3 position, uint seed) {
    position += 1e+4;
    vec3 floorPosition = floor(position);
    vec3 fractPosition = fract(position);
    uvec3 cellCoordinates = uvec3(floorPosition);
    float value1 = dot(gradientdy(hash(cellCoordinates, seed)), fractPosition);
    float value2 = dot(gradientdy(hash((cellCoordinates + uvec3(1, 0, 0)), seed)), fractPosition - vec3(1, 0, 0));
    float value3 = dot(gradientdy(hash((cellCoordinates + uvec3(0, 1, 0)), seed)), fractPosition - vec3(0, 1, 0));
    float value4 = dot(gradientdy(hash((cellCoordinates + uvec3(1, 1, 0)), seed)), fractPosition - vec3(1, 1, 0));
    float value5 = dot(gradientdy(hash((cellCoordinates + uvec3(0, 0, 1)), seed)), fractPosition - vec3(0, 0, 1));
    float value6 = dot(gradientdy(hash((cellCoordinates + uvec3(1, 0, 1)), seed)), fractPosition - vec3(1, 0, 1));
    float value7 = dot(gradientdy(hash((cellCoordinates + uvec3(0, 1, 1)), seed)), fractPosition - vec3(0, 1, 1));
    float value8 = dot(gradientdy(hash((cellCoordinates + uvec3(1, 1, 1)), seed)), fractPosition - vec3(1, 1, 1));
    return interpolate(value1, value2, value3, value4, value5, value6, value7, value8, fade(fractPosition));
}

float p_noise(vec3 position, int octaveCount, float persistence, float lacunarity) {
    float value = 0.0;
    float amplitude = 1.0;
    float currentFrequency = 10.;
    uint currentSeed = uint(0);
    for (int i = 0; i < octaveCount; i++) {
        currentSeed = hash(currentSeed, 0x0U);
        value += perlinNoise(position * currentFrequency, currentSeed) * amplitude;
        amplitude *= persistence;
        currentFrequency *= lacunarity;
    }
    return value;
}

float get_max_amp(float persistence, float octaveCount) {
    persistence *= .999;
    return (1. - pow(persistence, octaveCount)) / (1. - persistence);
}

void main() {
  vec2 uv = v_patternUV;

  uv *= .005;
  float t = .2 * u_time;

  vec3 p = vec3(uv, t);

  float oct_count = max(0., floor(u_octaveCount));
  float persistence = clamp(u_persistence, 0., 1.);
  float noise = p_noise(p, int(oct_count), persistence, u_lacunarity);

  float max_amp = get_max_amp(persistence, oct_count);
  float noise_normalized = (noise + max_amp) / (2. * max_amp) + (u_proportion - .5);
  float sharpness = clamp(u_softness, 0., 1.);
  float smooth_w = 0.5 * fwidth(noise_normalized);
  float res = smoothstep(
    .5 - .5 * sharpness - smooth_w,
    .5 + .5 * sharpness + smooth_w,
    noise_normalized
  );

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export interface PerlinNoiseUniforms extends ShaderSizingUniforms {
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_proportion: number;
  u_softness: number;
  u_octaveCount: number;
  u_persistence: number;
  u_lacunarity: number;
}

export interface PerlinNoiseParams extends ShaderSizingParams, ShaderMotionParams {
  colorFront?: string;
  colorBack?: string;
  proportion?: number;
  softness?: number;
  octaveCount?: number;
  persistence?: number;
  lacunarity?: number;
}

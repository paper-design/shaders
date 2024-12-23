export type PerlinNoiseUniforms = {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_scale: number;
  u_frequency: number;
  u_octaveCount: number;
  u_persistence: number;
  u_lacunarity: number;
  u_perlinSeed: number;
};

/**
 * Calculates a combination of 2 simplex noises with result rendered as a stepped gradient
 * Based on https://www.shadertoy.com/view/NlSGDz
 *
 * Uniforms include:
 * u_color1: The first color
 * u_color2: The second color
 * u_scale: The scale applied to coordinates
 * u_steps_number: The number of colors to show as a stepped gradient
 */

export const perlinNoiseFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform float u_scale;

uniform float u_frequency;
uniform float u_octaveCount;
uniform float u_persistence;
uniform float u_lacunarity;
uniform float u_perlinSeed;

uniform float u_time;
uniform vec2 u_resolution;

out vec4 fragColor;



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

// implementation of MurmurHash (https://sites.google.com/site/murmurhash/) for a  
// 3-dimensional unsigned integer input vector.

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
\t// some final mixing
    hash ^= hash >> 13;
    hash *= m;
    hash ^= hash >> 15;
    return hash;
}


vec3 gradientDirection(uint hash) {
    switch (int(hash) & 15) { // look at the last four bits to pick a gradient direction
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
    // 6t^5 - 15t^4 + 10t^3
\treturn t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float perlinNoise(vec3 position, uint seed) {
    vec3 floorPosition = floor(position);
    vec3 fractPosition = position - floorPosition;
    uvec3 cellCoordinates = uvec3(floorPosition);
    float value1 = dot(gradientDirection(hash(cellCoordinates, seed)), fractPosition);
    float value2 = dot(gradientDirection(hash((cellCoordinates + uvec3(1, 0, 0)), seed)), fractPosition - vec3(1, 0, 0));
    float value3 = dot(gradientDirection(hash((cellCoordinates + uvec3(0, 1, 0)), seed)), fractPosition - vec3(0, 1, 0));
    float value4 = dot(gradientDirection(hash((cellCoordinates + uvec3(1, 1, 0)), seed)), fractPosition - vec3(1, 1, 0));
    float value5 = dot(gradientDirection(hash((cellCoordinates + uvec3(0, 0, 1)), seed)), fractPosition - vec3(0, 0, 1));
    float value6 = dot(gradientDirection(hash((cellCoordinates + uvec3(1, 0, 1)), seed)), fractPosition - vec3(1, 0, 1));
    float value7 = dot(gradientDirection(hash((cellCoordinates + uvec3(0, 1, 1)), seed)), fractPosition - vec3(0, 1, 1));
    float value8 = dot(gradientDirection(hash((cellCoordinates + uvec3(1, 1, 1)), seed)), fractPosition - vec3(1, 1, 1));
    return interpolate(value1, value2, value3, value4, value5, value6, value7, value8, fade(fractPosition));
}

float perlinNoise(vec3 position, float frequency, int octaveCount, float persistence, float lacunarity, uint seed) {
    float value = 0.0;
    float amplitude = 1.0;
    float currentFrequency = frequency;
    uint currentSeed = seed;
    for (int i = 0; i < octaveCount; i++) {
        currentSeed = hash(currentSeed, 0x0U); // create a new seed for each octave
        value += perlinNoise(position * currentFrequency, currentSeed) * amplitude;
        amplitude *= persistence;
        currentFrequency *= lacunarity;
    }
    return value;
}



void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
  
    uv -= .5;
    uv *= (.001 * u_scale * u_resolution);
    uv += .5;
    
    uv += 1000.;
  
    float t =  u_time;
    
    // uv += t;

    float seed = .2;
    float value = perlinNoise(vec3(uv + t, 0.), u_frequency, int(floor(u_octaveCount)), u_persistence, u_lacunarity, uint(u_perlinSeed));
    // value = .5 * value + .5;
    
    vec3 color = mix(u_color1.rgb * u_color1.a, u_color2.rgb * u_color2.a, value);
    float opacity = mix(u_color1.a, u_color2.a, value);
        
    fragColor = vec4(color, opacity);
}
`;

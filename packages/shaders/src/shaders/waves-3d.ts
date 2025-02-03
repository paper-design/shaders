export type Waves3DUniforms = {
  u_colorBack: [number, number, number, number];
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_amplitude1: number;
  u_amplitude2: number;
  u_frequency1: number;
  u_frequency2: number;
  u_grain: number;
};

/**
 * Stepped Simplex Noise by Ksenia Kondrashova
 * Calculates a combination of 2 simplex noises with result rendered as a stepped gradient
 *
 * Uniforms include:
 * u_colorBack: The first color
 * u_scale: The scale applied to coordinates
 * u_steps_number: The number of colors to show as a stepped gradient
 */

export const waves3DFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_colorBack;
uniform vec4 u_color1;
uniform vec4 u_color2;

uniform float u_amplitude1;
uniform float u_amplitude2;
uniform float u_frequency1;
uniform float u_frequency2;
uniform float u_grain;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

#define PI 3.14159265358979323846

out vec4 fragColor;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float calculateWaveHeightRaw(vec3 p, float time) {
    float h = u_amplitude1 * (
        sin(.5 * u_frequency1 * p.x - time + .35 * PI) +
        sin(u_frequency1 * p.x - .8 * time)
    );
    h += u_amplitude2 * (
        sin(.5 * u_frequency2 * (p.z + p.x) - time - .5 * PI) +
        sin(u_frequency2 * p.z - .8 * time)
    );
       
    return h;
}

float calculateWaveHeight(vec3 p, float time) {
    float h = calculateWaveHeightRaw(p, time);
    return h;
}

vec3 calculateNormal(vec3 p, float time) {
    float epsilon = 0.05;
    vec3 dx = vec3(epsilon, 0.0, 0.0);
    vec3 dz = vec3(0.0, 0.0, epsilon);
    
    float hL = calculateWaveHeight(p - dx, time);
    float hR = calculateWaveHeight(p + dx, time);
    float hD = calculateWaveHeight(p - dz, time);
    float hU = calculateWaveHeight(p + dz, time);
    
    vec3 normal = normalize(vec3(hL - hR, 2.0 * epsilon, hD - hU));
    return normal;
}

float traceWavyPlane(vec3 ro, vec3 rd, float time) {
    const int maxSteps = 100;
    const float epsilon = .001;
    const float maxDistance = 4.;
    const float maxStepSize = .01;

    float dist = 1.;
    for (int i = 0; i < maxSteps; i++) {
        vec3 pos = ro + rd * dist;
        float waveHeight = calculateWaveHeight(pos, time);
        float d = pos.y - waveHeight;
        
        d = min(d, maxStepSize);
        if (d < epsilon) return dist;
        if (dist > maxDistance) break;
        dist += d;
    }
    return -1.;
}

void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    float t = u_time;
    
    vec3 u_cameraPos = vec3(0.0, .75, 5.0);
    vec3 u_cameraDir = normalize(vec3(0.0, -.55, -1.));
    vec3 u_cameraUp = vec3(0.0, 1.0, 0.0);
    float u_fov = radians(45.0);

    vec3 cameraRight = normalize(cross(u_cameraDir, u_cameraUp));
    vec3 cameraUp = normalize(cross(cameraRight, u_cameraDir));
    vec3 rayDir = normalize(
        u_cameraDir +
        uv.x * tan(u_fov * 0.5) * cameraRight +
        uv.y * tan(u_fov * 0.5) * cameraUp
    );

    rayDir += .002 * u_grain * noise(.5 * gl_FragCoord.xy);

    float trace = traceWavyPlane(u_cameraPos, rayDir, t);

    vec3 color = u_colorBack.rgb;
    if (trace > 0.0) {   
        vec3 hitPos = u_cameraPos + trace * rayDir;
        vec3 normal = calculateNormal(hitPos, t);
        vec3 lightDir = normalize(vec3(-.1, .5, -1.));
        float diff = max(dot(normal, lightDir), 0.0);

        vec3 h_color = mix(u_color1.rgb, u_color2.rgb, .5 - .8 * uv.y);
        color = mix(h_color, u_colorBack.rgb, diff);
    }
    
    fragColor = vec4(color, 1.0);
}
`;

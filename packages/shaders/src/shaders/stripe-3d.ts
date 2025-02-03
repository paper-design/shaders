export type Stripe3DUniforms = {
  u_colorBack: [number, number, number, number];
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_width: number;
  u_length: number;
  u_incline: number;
  u_amplitude1: number;
  u_amplitude2: number;
  u_frequency1: number;
  u_frequency2: number;
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

export const stripe3DFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_colorBack;
uniform vec4 u_color1;
uniform vec4 u_color2;

uniform float u_width;
uniform float u_length;
uniform float u_amplitude1;
uniform float u_amplitude2;
uniform float u_frequency1;
uniform float u_frequency2;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

#define PI 3.14159265358979323846

out vec4 fragColor;


float calculateWaveHeightRaw(vec3 p, float time) {
  
  float edgeFactor = smoothstep(-3. * u_length, 0., p.x);
  edgeFactor *= smoothstep(-3. * u_length, 0., -p.x);

  float h = u_amplitude1 * (
        sin(.5 * u_frequency1 * p.x - time + .35 * PI) +
        sin(.8 * u_frequency1 * p.x - .8 * time)
       );
  
  h -= (u_amplitude2 * sin(u_frequency2 * p.z - .5 * time));
  
  return h * edgeFactor;
}

float calculateWaveHeight(vec3 p, float time) {
    float h = calculateWaveHeightRaw(p, time);
    h -= .3 * p.x;
    return h;
}

float sdRectangleXZWithWaves(vec3 p, vec2 size, float time) {

    float waveHeight = calculateWaveHeight(p, time);
    float distY = p.y - waveHeight;
    vec2 d = abs(p.xz) - size * 0.5;
    float distXZ = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);

    return max(distXZ, distY) - .01;
}

float traceWavyPlane(vec3 ro, vec3 rd, vec2 size, float time) {
    const int maxSteps = 150;
    const float epsilon = .001;
    const float maxDistance = 8.;
    const float maxStepSize = .3;

    float dist = 4.;
    for (int i = 0; i < maxSteps; i++) {
        vec3 pos = ro + rd * dist;
        float d = sdRectangleXZWithWaves(pos, size, time);

        d = min(d, maxStepSize);

        if (d < epsilon) {
            float waveHeight = calculateWaveHeight(pos, time);
            if (pos.y >= waveHeight) {
                return dist;
            }
        }

        if (dist > maxDistance) {
            break;
        }
        dist += d;
    }
    return -1.;
}


void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y; // Adjust for aspect ratio

    float t = u_time;
    vec2 u_planeSize = 3. * vec2(u_length, u_width);
    
    vec3 u_cameraPos = vec3(sin(.02 * PI) * 5.0, 2.0, cos(.02 * PI) * 5.0);
    vec3 u_cameraDir = normalize(vec3(0.0, 0.0, 0.0) - u_cameraPos);

    vec3 u_cameraUp = vec3(0.0, 1.0, 0.0);
    float u_fov = radians(45.0);

    vec3 cameraRight = normalize(cross(u_cameraDir, u_cameraUp));
    vec3 cameraUp = normalize(cross(cameraRight, u_cameraDir));
    vec3 rayDir = normalize(
        u_cameraDir +
        uv.x * tan(u_fov * 0.5) * cameraRight +
        uv.y * tan(u_fov * 0.5) * cameraUp
    );

    float trace = traceWavyPlane(u_cameraPos, rayDir, u_planeSize, t);

    vec3 color = u_colorBack.rgb;
    if (trace > 0.0) {
        vec3 hitPos = u_cameraPos + trace * rayDir;

        float waveHeightRaw = calculateWaveHeightRaw(hitPos, t);
        float normalizedHeight = (waveHeightRaw + max(u_amplitude1, u_amplitude2)) / (2. * (max(u_amplitude1, u_amplitude2) + 1e-2));
        normalizedHeight = clamp(normalizedHeight, 0.0, 1.0);

        color = mix(u_color1.rgb, u_color2.rgb, normalizedHeight);
    }
    
    fragColor = vec4(color, 1.0);
}

`;

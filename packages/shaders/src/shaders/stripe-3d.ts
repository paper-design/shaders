export type Stripe3DUniforms = {
  u_colorBack: [number, number, number, number];
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_scale: number;
  u_amplitude: number;
  u_frequency: number;
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
uniform vec4 u_color3;

uniform float u_scale;
uniform float u_amplitude;
uniform float u_frequency;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

#define PI 3.14159265358979323846

out vec4 fragColor;

float calculateWaveHeight(vec3 p, float time, float amplitude, float frequency) {
    return amplitude * (
        sin(.4 * frequency * p.x - time + PI) + 
        .5 * sin(frequency * (p.x + p.z) + 2. * time + PI) +
        // .2 * cos(.5 * frequency * (-p.x + p.z) + 1.3 * time + PI) + 
        .8 * sin(.75 * frequency * p.z - time)
        );
}

float sdRectangleXZWithWaves(vec3 p, vec2 size, float time, float amplitude, float frequency) {
    float waveHeight = calculateWaveHeight(p, time, amplitude, frequency);
    float distY = p.y - waveHeight;
    // vec2 d = abs(p.xz) - size * .5;
    // float distXZ = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);

    float smoothing = .004;
    // return max(distXZ, distY) - smoothing;
    return distY - smoothing;
}

float traceWavyPlane(vec3 ro, vec3 rd, vec2 size, float time, float amplitude, float frequency) {
    const int maxSteps = 200;
    const float epsilon = .01;
    const float maxDistance = 15.;
    const float maxStepSize = .1;

    float dist = 5.0;
    for (int i = 0; i < maxSteps; i++) {
        vec3 pos = ro + rd * dist;
        float d = sdRectangleXZWithWaves(pos, size, time, amplitude, frequency);

        d = min(d, maxStepSize);

        if (d < epsilon) {
            float waveHeight = calculateWaveHeight(pos, time, amplitude, frequency);
            if (pos.y >= waveHeight) {
                return dist; // Hit the top surface
            }
        }

        if (dist > maxDistance) {
            break;
        }
        dist += d;
    }
    return -1.;
}

vec3 calculateNormal(vec3 p, vec2 size, float time, float amplitude, float frequency) {
    const float eps = .01;
    vec3 dx = vec3(eps, 0.0, 0.0);
    vec3 dy = vec3(0.0, eps, 0.0);
    vec3 dz = vec3(0.0, 0.0, eps);

    float sdfX = sdRectangleXZWithWaves(p + dx, size, time, amplitude, frequency) 
               - sdRectangleXZWithWaves(p - dx, size, time, amplitude, frequency);
    float sdfY = sdRectangleXZWithWaves(p + dy, size, time, amplitude, frequency) 
               - sdRectangleXZWithWaves(p - dy, size, time, amplitude, frequency);
    float sdfZ = sdRectangleXZWithWaves(p + dz, size, time, amplitude, frequency) 
               - sdRectangleXZWithWaves(p - dz, size, time, amplitude, frequency);
    //
    return normalize(vec3(sdfX, sdfY, sdfZ));
    // return normalize(vec2(4. * sdfX, sdfY));
}

vec3 normalToColor(vec3 normal, vec3 color1, vec3 color2, vec3 color3) {
    vec3 normalizedNormal = normalize(normal); 
    float r = (normalizedNormal.x + 1.0) * 0.5; // Map -1 to 1 -> 0 to 1
    float g = (normalizedNormal.y + 1.0) * 0.5;
    float b = (normalizedNormal.z + 1.0) * 0.5;
    
    return r * color1 + g * color2 + b * color3;
}

void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y; // Adjust for aspect ratio
    
    float t = 4. * u_time;

    vec2 u_planeSize = vec2(4.0, 4.0);
    vec3 u_cameraPos = vec3(0.0, 2.0, 5.0) * u_scale;
    vec3 u_cameraDir = vec3(0.0, -0.4, -1.0); // Camera looking straight down (-Y direction)
    vec3 u_cameraUp = vec3(0.0, 1.0, 0.0); // Up vector (aligned with the +Z axis)
    float u_fov = radians(25.0); // 45 degrees field of view

    vec3 cameraRight = normalize(cross(u_cameraDir, u_cameraUp));
    vec3 cameraUp = normalize(cross(cameraRight, u_cameraDir));
    vec3 rayDir = normalize(
        u_cameraDir +
        uv.x * tan(u_fov * 0.5) * cameraRight +
        uv.y * tan(u_fov * 0.5) * cameraUp
    );

    float trace = traceWavyPlane(u_cameraPos, rayDir, u_planeSize, t, u_amplitude, u_frequency);

    vec3 color = u_colorBack.rgb;
    if (trace > 0.0) {
        vec3 hitPos = u_cameraPos + trace * rayDir;
        vec3 normal = calculateNormal(hitPos, u_planeSize, t, u_amplitude, u_frequency);
        vec3 lightDir = normalize(vec3(0.5, 1.0, -0.3));
        // float diff = max(dot(normal, lightDir), 0.0);
        // color = mix(u_color2.rgb * 0.1, u_color2.rgb, diff);
        // color = .5 * normal + .5;
        color = mix(u_color1.rgb, u_color2.rgb, clamp(normal.x, 0., 1.));
        color = mix(color, u_color3.rgb, clamp(normal.z, 0., 1.));
    }
    
    fragColor = vec4(color, 1.0);
}

`;

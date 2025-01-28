export type Stripe3DUniforms = {
  u_colorBack: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_color4: [number, number, number, number];
  u_color5: [number, number, number, number];
  u_scale: number;
  u_steps_number: number;
};

/**
 * Stepped Simplex Noise by Ksenia Kondrashova
 * Calculates a combination of 2 simplex noises with result rendered as a stepped gradient
 *
 * Uniforms include:
 * u_colorBack: The first color
 * u_color2: The second color
 * u_color3: The third color
 * u_color4: The fourth color
 * u_color5: The fifth color
 * u_scale: The scale applied to coordinates
 * u_steps_number: The number of colors to show as a stepped gradient
 */

export const stripe3DFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_colorBack;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform vec4 u_color4;
uniform vec4 u_color5;
uniform float u_scale;
uniform float u_steps_number;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

#define PI 3.14159265358979323846

out vec4 fragColor;

float calculateWaveHeight(vec3 p, float time, float amplitude, float frequency) {
    return amplitude 
        * cos(.5 * frequency * p.x - time + 3.14159) 
        * sin(frequency * p.x + 2. * time);
        // * cos(1.5 * frequency * p.z - time + 3.14159) 
        // * sin(0.2 * frequency * p.z + time);
}

float sdRectangleXZWithWaves(vec3 p, vec2 size, float time, float amplitude, float frequency) {
    // Calculate wave displacement at the current position (x, z)
    float waveHeight = calculateWaveHeight(p, time, amplitude, frequency);

    // Distance from the plane's wavy surface
    float distY = p.y - waveHeight;

    // Compute the rectangle's SDF in the XZ plane
    vec2 d = abs(p.xz) - size * 0.5;
    float distXZ = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);

    // Add slight smoothing for artifacts around sharp edges
    float smoothing = 0.01;
    return max(distXZ, distY) - smoothing;
}

float traceWavyPlane(vec3 ro, vec3 rd, vec2 size, float time, float amplitude, float frequency) {
    const int maxSteps = 180;  // Increase ray marching steps for better precision
    const float epsilon = 0.001; // Precision threshold
    const float maxDistance = 10.0; // Maximum ray distance
    const float maxStepSize = 0.1; // Limit step size to reduce skipping

    float dist = 0.0;
    for (int i = 0; i < maxSteps; i++) {
        vec3 pos = ro + rd * dist;
        float d = sdRectangleXZWithWaves(pos, size, time, amplitude, frequency);

        // Clamp step size to reduce artifacts
        d = min(d, maxStepSize);

        // Check for intersection
        if (d < epsilon) {
            float waveHeight = calculateWaveHeight(pos, time, amplitude, frequency);

            if (pos.y >= waveHeight) {
                return dist; // Hit the top surface
            }
        }

        if (dist > maxDistance) {
            break; // Exceeded maximum distance
        }
        dist += d; // Step forward
    }
    return -1.0; // No intersection
}

vec3 calculateNormal(vec3 p, vec2 size, float time, float amplitude, float frequency) {
    const float eps = 0.001; // Small offset for finite differences
    vec3 dx = vec3(eps, 0.0, 0.0);
    vec3 dy = vec3(0.0, eps, 0.0);
    vec3 dz = vec3(0.0, 0.0, eps);

    float sdfX = sdRectangleXZWithWaves(p + dx, size, time, amplitude, frequency) 
               - sdRectangleXZWithWaves(p - dx, size, time, amplitude, frequency);
    float sdfY = sdRectangleXZWithWaves(p + dy, size, time, amplitude, frequency) 
               - sdRectangleXZWithWaves(p - dy, size, time, amplitude, frequency);
    float sdfZ = sdRectangleXZWithWaves(p + dz, size, time, amplitude, frequency) 
               - sdRectangleXZWithWaves(p - dz, size, time, amplitude, frequency);

    return normalize(vec3(sdfX, sdfY, sdfZ));
}

void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y; // Adjust for aspect ratio

    vec2 u_planeSize = vec2(4.0, 4.0); // Plane width and depth (4x4 units)
    vec3 u_cameraPos = vec3(0.0, 2.0, 5.0) * u_scale; // Camera positioned 5 units above the plane
    vec3 u_cameraDir = vec3(0.0, -0.4, -1.0); // Camera looking straight down (-Y direction)
    vec3 u_cameraUp = vec3(0.0, 1.0, 0.0); // Up vector (aligned with the +Z axis)
    float u_fov = radians(25.0); // 45 degrees field of view

    // Generate the ray direction in world space
    vec3 cameraRight = normalize(cross(u_cameraDir, u_cameraUp)); // Right vector
    vec3 cameraUp = normalize(cross(cameraRight, u_cameraDir));   // Adjusted up vector
    vec3 rayDir = normalize(
        u_cameraDir +
        uv.x * tan(u_fov * 0.5) * cameraRight +
        uv.y * tan(u_fov * 0.5) * cameraUp
    );

    // Trace the ray
    float t = traceWavyPlane(u_cameraPos, rayDir, u_planeSize, 10.0 * u_time, 0.4, 2.0);

    // Determine the color
    vec3 color = u_colorBack.rgb; // Default to background color
    if (t > 0.0) {
        vec3 hitPos = u_cameraPos + t * rayDir; // Compute the hit position
        vec3 normal = calculateNormal(hitPos, u_planeSize, 10.0 * u_time, 0.4, 2.0);

        // Basic Lambertian shading
        vec3 lightDir = normalize(vec3(0.5, 1.0, -0.3)); // Directional light
        float diff = max(dot(normal, lightDir), 0.0);

        // Mix base plane color with light intensity
        color = mix(u_color2.rgb * 0.5, u_color2.rgb, diff);
    }
    
    // Output the final color
    fragColor = vec4(color, 1.0);
}

`;

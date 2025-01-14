export type SteppedSimplexNoiseUniforms = {
  u_color1: [number, number, number, number];
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
 * u_color1: The first color
 * u_color2: The second color
 * u_color3: The third color
 * u_color4: The fourth color
 * u_color5: The fifth color
 * u_scale: The scale applied to coordinates
 * u_steps_number: The number of colors to show as a stepped gradient
 */

export const steppedSimplexNoiseFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform vec4 u_color4;
uniform vec4 u_color5;
uniform float u_scale;
uniform float u_steps_number;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

out vec4 fragColor;


// Function to compute the SDF for a wavy surface
float waveSDF(vec3 p) {
    // Define wave properties
    float frequency = 3.0;    // Controls wave frequency
    float amplitude = 0.2;    // Controls wave height
    float speed = 1.0;        // Controls wave speed

    // Calculate wave height based on x and z coordinates
    float waveHeight = amplitude * sin(frequency * p.x + iTime * speed)
                                    * cos(frequency * p.z - iTime * speed);

    // SDF for the surface
    return p.y - waveHeight;
}

// Calculate normal from the SDF using central differences
vec3 calculateNormal(vec3 p) {
    float epsilon = 0.001; // Small offset
    vec2 e = vec2(1.0, -1.0) * epsilon;
    return normalize(vec3(
        waveSDF(p + vec3(e.x, 0.0, 0.0)) - waveSDF(p + vec3(e.y, 0.0, 0.0)),
        2.0 * epsilon,
        waveSDF(p + vec3(0.0, 0.0, e.x)) - waveSDF(p + vec3(0.0, 0.0, e.y))
    ));
}

// Main function
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Ray marching setup
    vec3 rayOrigin = vec3(0.0, .5, 1.0);
    vec3 rayDir = normalize(vec3(uv.x, uv.y - .5, .6));

    // Ray marching loop
    float t = 0.0;        // Distance along the ray
    float tMax = 10.0;    // Maximum render depth
    float minDist = 0.001; // When to stop marching
    vec3 p;               // Current point on the ray
    for (int i = 0; i < 256; i++) {
        p = rayOrigin + t * rayDir;
        float dist = waveSDF(p);
        if (abs(dist) < minDist) break; // Stop if close to the surface
        t += dist; // Advance the ray
        if (t > tMax) break; // Stop if beyond max depth
    }

    // Shading
    vec3 color;
    if (t < tMax) {
        // Surface normal and light direction
        vec3 normal = calculateNormal(p);
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));

        // Lambertian shading
        float diff = max(dot(normal, lightDir), 0.0);
        color = vec3(0.2, 0.5, 0.8) * diff; // Base color
    } else {
        color = vec3(1., 0., 0.); // Background
    }

    // Output final color
    fragColor = vec4(color, 1.0);
}
`;

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

out vec4 fragColor;


// Function to compute the SDF for a wavy surface
float waveSDF(vec3 p, float t) {
    // Define wave properties
    float frequency = 3.0;    // Controls wave frequency
    float amplitude = 0.2;    // Controls wave height
    float speed = 1.0;        // Controls wave speed

    float stripeWidth = 5.;  // Width of the stripe
    float stripeHeight = 20.; // Height of the stripe


    // Calculate wave height based on x and z coordinates
    float waveHeight = amplitude 
      * sin(frequency * p.x + t)
      * cos(2. * frequency * p.z - t);
      
   float bounds = max(abs(p.x) - stripeWidth * .5, abs(p.z) - stripeHeight * .5);
    if (bounds > 0.) {
        return bounds;
    }


    // SDF for the surface
    return p.y - waveHeight;
}

// Calculate normal from the SDF using central differences
vec3 calculateNormal(vec3 p, float t) {
    float epsilon = 0.001; // Small offset
    vec2 e = vec2(1.0, -1.0) * epsilon;
    return normalize(vec3(
        waveSDF(p + vec3(e.x, 0.0, 0.0), t) - waveSDF(p + vec3(e.y, 0.0, 0.0), t),
        2.0 * epsilon,
        waveSDF(p + vec3(0.0, 0.0, e.x), t) - waveSDF(p + vec3(0.0, 0.0, e.y), t)
    ));
}

// Main function
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    float t = 3. * u_time;


    // Ray marching setup
    vec3 rayOrigin = vec3(0., 2., u_steps_number);
    vec3 rayDir = normalize(vec3(uv.x, uv.y - 1., 1.));

    // Ray marching loop
    float rrr = 0.0;
    float tMax = 10.0;
    float minDist = 0.0001; // When to stop marching
    vec3 p;               // Current point on the ray
    for (int i = 0; i < 256; i++) {
        p = rayOrigin + rrr * rayDir;
        float dist = waveSDF(p, t);
        if (abs(dist) < minDist) break; // Stop if close to the surface
        rrr += dist; // Advance the ray
        if (rrr > tMax) break; // Stop if beyond max depth
    }

    // Shading
    vec3 color = u_colorBack.rgb;
    if (rrr < tMax) {
        // Surface normal and light direction
        vec3 normal = calculateNormal(p, t);
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));

        // Lambertian shading
        float diff = max(dot(normal, lightDir), 0.0);
        color = vec3(0.2, 0.5, 0.8) * diff; // Base color
    } 

    // Output final color
    fragColor = vec4(color, 1.0);
}
`;

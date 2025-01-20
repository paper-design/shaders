export type RadialSwirlUniforms = {
  u_colorBack: [number, number, number, number];
  u_colorFront: [number, number, number, number];
  u_colorStripe1: [number, number, number, number];
  u_colorStripe2: [number, number, number, number];
  u_density: number;
  u_proportion: number;
  u_stripe1: number;
  u_stripe2: number;
  u_noiseFreq: number;
  u_noisePower: number;
  u_focus: number;
};

/**
 * RadialSwirl pattern
 * The artwork by Ksenia Kondrashova
 * Renders a number of circular shapes with gooey effect applied
 *
 * Uniforms include:
 * u_colorBack: The mataball base color #1
 * u_colorStripe1: The mataball base color #2
 * u_colorStripe2: The mataball base color #3
 * u_density: The scale of uv coordinates: with scale = 1 radialSwirl fit the screen height
 */

export const radialSwirlFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_colorBack;
uniform vec4 u_colorFront;
uniform vec4 u_colorStripe1;
uniform vec4 u_colorStripe2;
uniform float u_density;
uniform float u_proportion;
uniform float u_stripe1;
uniform float u_stripe2;
uniform float u_focus;
uniform float u_noiseFreq;
uniform float u_noisePower;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

#define TWO_PI 6.28318530718

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
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;

  uv -= .5;
  uv /= u_pixelRatio;
  uv.x *= ratio;
  
  float t = 2. * u_time;

  float scaling = 10. * pow(u_density, 4.);
  
    uv *= scaling;

    float radius_original = length(uv);
    float radius = pow(radius_original, 1. - clamp(u_focus, 0., .99));

    float angle = atan(uv.y, uv.x) - 5. * t;

    angle += TWO_PI * radius;
    vec2 deformed_uv = vec2(radius_original * cos(angle), radius_original * sin(angle));       
    
    float n1 = noise(uv * u_noiseFreq + t);
    float n2 = noise(uv * 2. * u_noiseFreq - t);
    float a = n1 * TWO_PI;
    deformed_uv.x += u_noisePower * n1 * cos(a) * radius_original;
    deformed_uv.y += u_noisePower * n2 * sin(a) * radius_original;
        
    float edge_w = fwidth(deformed_uv.y);
    float fst_color_shape = smoothstep(scaling * pow(u_proportion, 7.), scaling * pow(u_proportion, 7.) + edge_w, deformed_uv.y);
    float scd_color_shape = smoothstep(deformed_uv.x, deformed_uv.x + edge_w, scaling * (u_stripe1 - 1.));
    float trd_color_shape = smoothstep(-deformed_uv.x, -deformed_uv.x + edge_w, scaling * (u_stripe2 - 1.));
    
    // float stripe_map = fract(angle / TWO_PI + radius);
    // fst_color_shape = step(.25 - .25 * u_proportion, stripe_map) * (1. - step(.75 + .25 * u_proportion, stripe_map));

    vec3 color = mix(u_colorFront.rgb, u_colorBack.rgb, fst_color_shape);
    color = mix(color, u_colorStripe1.rgb, scd_color_shape);
    color = mix(color, u_colorStripe2.rgb, trd_color_shape);
    
    fragColor = vec4(color, 1.);
        
  }
`;

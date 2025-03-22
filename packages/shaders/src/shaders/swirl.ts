export type SwirlUniforms = {
  u_offsetX: number;
  u_offsetY: number;
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_bandCount: number;
  u_twist: number;
  u_noiseFreq: number;
  u_noise: number;
  u_softness: number;
};

/**
 * Swirl pattern
 * Renders a swirling pattern with smooth color transitions, adjustable twisting, and noise distortion
 *
 * Uniforms include:
 *
 * Colors:
 * - u_color1: The first color used in the swirl pattern (RGBA)
 * - u_color2: The second color used in the swirl pattern (RGBA)
 * - u_color3: The third color used in the swirl pattern (RGBA)
 *
 * Positioning:
 * - u_offsetX: Horizontal offset of the swirl center
 * - u_offsetY: Vertical offset of the swirl center
 *
 * Swirl Properties:
 * - u_bandCount: The number of color bands in the swirl
 * - u_twist: The amount of twist applied to the swirl pattern
 *
 * Noise:
 * - u_noiseFreq: Frequency of the applied noise
 * - u_noise: Intensity of the noise effect
 *
 * softness:
 * - u_softness: Softness of the band transitions, affecting blending between colors
 */

export const swirlFragmentShader = `#version 300 es
precision highp float;

uniform float u_offsetX;
uniform float u_offsetY;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_bandCount;
uniform float u_twist;
uniform float u_noiseFreq;
uniform float u_noise;
uniform float u_softness;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

out vec4 fragColor;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float smoothBlend(float value, float softness) {
    float threshold = 0.5 * softness;
    return smoothstep(threshold, 1.0 - threshold, value);
}

vec4 blend_colors(vec4 color1, vec4 color2, vec4 color3, float mixFactor, float softness) {
    vec4 colors[3] = vec4[](color1, color2, color3);
    
    float segmentSize = 1.0 / 8.0; // Now we have 8 segments
    float segmentIndex = floor(mixFactor / segmentSize);
    float blendAmount = fract(mixFactor / segmentSize);
    blendAmount = smoothBlend(blendAmount, softness);

    // Define the new color sequence
    int sequence[8] = int[](0, 1, 1, 2, 2, 1, 1, 0);
    
    int indexA = sequence[int(mod(segmentIndex, 8.0))];
    int indexB = sequence[int(mod(segmentIndex + 1.0, 8.0))];

    vec4 startColor = colors[indexA];
    vec4 endColor = colors[indexB];

    return mix(startColor, endColor, blendAmount);
}


void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;

  uv -= .5;
  uv += vec2(-u_offsetX, u_offsetY);

  uv *= 1.5;
  uv.x *= ratio;

  float t = u_time;

  float l = length(uv);
  float angle = ceil(u_bandCount) * atan(uv.y, uv.x) + 2. * t;
  float angle_norm = angle / TWO_PI;  

  angle_norm += .2 * u_noise * snoise(7. * u_noiseFreq * uv);
  
  float twist = 3. * clamp(u_twist, 0., 1.);
  float offset = pow(l, -twist) + angle_norm;
  
  float stripe_map = fract(offset);
  
  float mid = smoothstep(0., 1., pow(l, twist));
  stripe_map = mix(0., stripe_map, mid);
  
//  float shape = stripe_map;
//  
//  float softness = 1. - u_softness;
//  vec4 color = blend_colors(u_color1, u_color2, u_color3, shape, softness);
//
//  fragColor = vec4(color);
//  fragColor = vec4(vec3(stripe_map, stripe_map, pow(l, twist)), 1.);
  fragColor = vec4(vec3(stripe_map), 1.);
}
`;

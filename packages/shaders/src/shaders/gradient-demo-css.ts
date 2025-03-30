import type { vec4 } from '../types';

export const gradientDemoCSSMaxColorCount = 7;

export type GradientDemoCSSUniforms = {
  u_colors: vec4[];
  u_colors_count: number;
  u_test: number;
};

/**
 *
 * Uniforms include:
 * u_colors: An array of colors, each color is an array of 4 numbers [r, g, b, a]
 * u_colors_count: The number of colors in the u_colors array
 */

export const gradientDemoCSSFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_time;

uniform float u_test;
uniform vec4 u_colors[${gradientDemoCSSMaxColorCount}];
uniform float u_colors_count;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec3 srgbToLinear(vec3 srgb) {
    return pow(srgb, vec3(2.2));
}

vec3 linearToSrgb(vec3 linear) {
    return pow(linear, vec3(1.0/2.2));
}

// from https://github.com/Evercoder/culori/blob/main/src/oklab/LrgbToOklab.js
vec3 LrgbToOklab(vec3 rgb) {
    float L = pow(0.4122214708 * rgb.r + 0.5363325363 * rgb.g + 0.0514459929 * rgb.b, 1.0 / 3.0);
    float M = pow(0.2119034982 * rgb.r + 0.6806995451 * rgb.g + 0.1073969566 * rgb.b, 1.0 / 3.0);
    float S = pow(0.0883024619 * rgb.r + 0.2817188376 * rgb.g + 0.6299787005 * rgb.b, 1.0 / 3.0);

    return vec3(
        0.2104542553 * L + 0.793617785 * M - 0.0040720468 * S,  // l
        1.9779984951 * L - 2.428592205 * M + 0.4505937099 * S,  // a
        0.0259040371 * L + 0.7827717662 * M - 0.808675766 * S   // b
    );
}
vec3 OklabToLrgb(vec3 oklab) {
    float L = oklab.x;
    float a = oklab.y;
    float b = oklab.z;

    float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    float s_ = L - 0.0894841775 * a - 1.291485548 * b;

    float l = l_ * l_ * l_;
    float m = m_ * m_ * m_;
    float s = s_ * s_ * s_;

    return vec3(
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,  // r
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, // g
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s   // b
    );
}


vec3 oklabToOklch(vec3 oklab) {
    float C = length(oklab.yz);
    float H = atan(oklab.z, oklab.y);
    return vec3(oklab.x, C, H);
}

vec3 oklchToOklab(vec3 oklch) {
    float a = oklch.y * cos(oklch.z);
    float b = oklch.y * sin(oklch.z);
    return vec3(oklch.x, a, b);
}

vec3 setColor(vec3 c) {
  if (u_test == 0.) {
    return c;
  } else {
    return linearToSrgb(OklabToLrgb(oklchToOklab(c)));  
  }
}

vec3 getColor(vec3 c) {
  if (u_test == 0.) {
    return c;  
  } else {
    vec3 oklch = oklabToOklch(LrgbToOklab(srgbToLinear(c)));
    if (oklch.y < 1e-3) {
        oklch.z = 0.;
    }
    return oklch;
  }
}

float mixHue(float h1, float h2, float mixer) {
    float delta = mod(h2 - h1 + PI, TWO_PI) - PI;
    return h1 + mixer * delta;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  
  float mixer = uv.x * (u_colors_count - 1.);
  
  vec3 color = vec3(0.);
    vec3 gradient = getColor(u_colors[0].rgb);
    for (int i = 1; i < ${gradientDemoCSSMaxColorCount}; i++) {
      if (i >= int(u_colors_count)) break;
      float localMixer = clamp(mixer - float(i - 1), 0., 1.);
      
      vec3 c = getColor(u_colors[i].rgb);
      if (u_test == 0.) {
        gradient = mix(gradient, c, localMixer);
      } else {
        gradient.x = mix(gradient.x, c.x, localMixer);
        gradient.y = mix(gradient.y, c.y, localMixer);
        gradient.z = mixHue(gradient.z, c.z, localMixer);
      }
    }
    color = setColor(gradient);

  
  fragColor = vec4(color, 1.);
}
`;

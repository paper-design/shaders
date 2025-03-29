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


vec3 srgbToLinear(vec3 srgb) {
    return pow(srgb, vec3(2.2));
}

vec3 linearToSrgb(vec3 linear) {
    return pow(linear, vec3(1.0/2.2));
}

vec3 linearToOklab(vec3 linear)
{
    const mat3 im1 = mat3(0.4121656120, 0.2118591070, 0.0883097947,
                          0.5362752080, 0.6807189584, 0.2818474174,
                          0.0514575653, 0.1074065790, 0.6302613616);
                       
    const mat3 im2 = mat3(+0.2104542553, +1.9779984951, +0.0259040371,
                          +0.7936177850, -2.4285922050, +0.7827717662,
                          -0.0040720468, +0.4505937099, -0.8086757660);
                       
    vec3 lms = im1 * linear;
            
    return im2 * (sign(lms) * pow(abs(lms), vec3(1.0/3.0)));
}

vec3 oklabToLinear(vec3 oklab)
{
    const mat3 m1 = mat3(+1.000000000, +1.000000000, +1.000000000,
                         +0.396337777, -0.105561346, -0.089484178,
                         +0.215803757, -0.063854173, -1.291485548);
                       
    const mat3 m2 = mat3(+4.076724529, -1.268143773, -0.004111989,
                         -3.307216883, +2.609332323, -0.703476310,
                         +0.230759054, -0.341134429, +1.706862569);
    vec3 lms = m1 * oklab;
    
    return m2 * (lms * lms * lms);
}

//
//vec3 rgb_to_oklab(vec3 rgb) {
//    // Linear RGB to LMS
//    float L = pow(0.41222147079999993 * rgb.r + 0.5363325363 * rgb.g + 0.0514459929 * rgb.b, 3.0);
//    float M = pow(0.2119034981999999 * rgb.r + 0.6806995450999999 * rgb.g + 0.1073969566 * rgb.b, 3.0);
//    float S = pow(0.08830246189999998 * rgb.r + 0.2817188376 * rgb.g + 0.6299787005000002 * rgb.b, 3.0);
//    
//    // LMS to Oklab
//    return vec3(
//        0.2104542553 * L + 0.793617785 * M - 0.0040720468 * S,
//        1.9779984951 * L - 2.428592205 * M + 0.4505937099 * S,
//        0.0259040371 * L + 0.7827717662 * M - 0.808675766 * S
//    );
//}
//
//// Backward transformation: Oklab to Linear RGB
//vec3 oklab_to_rgb(vec3 oklab) {
//    // Oklab to LMS
//    float L = 0.9999999984505196 * oklab.x + 0.39633779217376785 * oklab.y + 0.2158037580939128 * oklab.z;
//    float M = 1.0000000088817453 * oklab.x - 0.1055613423236586 * oklab.y - 0.0638541747717059 * oklab.z;
//    float S = 1.0000000546819966 * oklab.x - 0.08948418209496574 * oklab.y - 1.2914804721037398 * oklab.z;
//    
//    // LMS to Linear RGB
//    return vec3(
//        +4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
//        -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
//        -0.0041960863 * L - 0.7034186147 * M + 1.7076147010 * S
//    );
//}




vec3 setColor(vec3 c) {
  if (u_test == 0.) {
    return c;  
  } else if (u_test == 1.) {
    return linearToSrgb(c);  
  } else if (u_test == 2.) {
    return srgbToLinear(c);  
  } else if (u_test == 3.) {
    return linearToSrgb(c);  
  } else if (u_test == 4.) {
    return srgbToLinear(c);  
  } else if (u_test == 5.) {
    return c;  
  } else if (u_test == 6.) {
    return c;  
  } else if (u_test == 7.) {
    return oklabToLinear(c);  
  } else if (u_test == 8.) {
    return linearToSrgb(oklabToLinear(c));  
  } else {
    return c;  
  }
}


vec3 getColor(vec3 c) {
  if (u_test == 0.) {
    return c;  
  } else if (u_test == 1.) {
    return srgbToLinear(c);  
  } else if (u_test == 2.) {
    return linearToSrgb(c);  
  } else if (u_test == 3.) {
    return (c);  
  } else if (u_test == 4.) {
    return (c);  
  } else if (u_test == 5.) {
    return srgbToLinear(c);  
  } else if (u_test == 6.) {
    return linearToSrgb(c);  
  } else if (u_test == 7.) {
    return linearToOklab(c);  
  } else if (u_test == 8.) {
    return linearToOklab(srgbToLinear(c));  
  } else {
    return c;  
  }
}


vec3 oklab_mix(vec3 lin1, vec3 lin2, float a)
{
    // https://bottosson.github.io/posts/oklab
    const mat3 kCONEtoLMS = mat3(                
         0.4121656120,  0.2118591070,  0.0883097947,
         0.5362752080,  0.6807189584,  0.2818474174,
         0.0514575653,  0.1074065790,  0.6302613616);
    const mat3 kLMStoCONE = mat3(
         4.0767245293, -1.2681437731, -0.0041119885,
        -3.3072168827,  2.6093323231, -0.7034763098,
         0.2307590544, -0.3411344290,  1.7068625689);
                    
    // rgb to cone (arg of pow can't be negative)
    vec3 lms1 = pow( kCONEtoLMS*lin1, vec3(1.0/3.0) );
    vec3 lms2 = pow( kCONEtoLMS*lin2, vec3(1.0/3.0) );
    // lerp
    vec3 lms = mix( lms1, lms2, a );
    // gain in the middle (no oklab anymore, but looks better?)
    lms *= 1.0+0.2*a*(1.0-a);
    // cone to rgb
    return kLMStoCONE*(lms*lms*lms);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  
  float t = uv.x * (u_colors_count - 1.);
  
  vec3 color = vec3(0.);
  if (u_test < 9.) {
    vec3 gradient = getColor(u_colors[0].rgb);
    for (int i = 1; i < ${gradientDemoCSSMaxColorCount}; i++) {
      if (i >= int(u_colors_count)) break;
      float localT = clamp(t - float(i - 1), 0., 1.);
      gradient = mix(gradient, getColor(u_colors[i].rgb), localT);
    }
    color = setColor(gradient);
  } else {
    vec3 gradient = pow(u_colors[0].rgb, vec3(2.2));
    for (int i = 1; i < ${gradientDemoCSSMaxColorCount}; i++) {
      if (i >= int(u_colors_count)) break;
      float localT = clamp(t - float(i - 1), 0., 1.);
      gradient = oklab_mix(gradient, pow(u_colors[i].rgb, vec3(2.2)), localT);
    }
    color = pow(gradient, vec3(1. / 2.2));
  }
  
  fragColor = vec4(color, 1.);
}
`;

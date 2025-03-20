export type VoronoiUniforms = {
  u_scale: number;
  u_colorCell1: [number, number, number, number];
  u_colorCell2: [number, number, number, number];
  u_colorCell3: [number, number, number, number];
  u_colorEdges: [number, number, number, number];
  u_colorMid: [number, number, number, number];
  u_colorGradient: number;
  u_distance: number;
  u_edgesSize: number;
  u_edgesSoftness: number;
  u_middleSize: number;
  u_middleSoftness: number;
};

/**
 * Voronoi pattern
 * The artwork by Ksenia Kondrashova
 * Renders a number of circular shapes with gooey effect applied
 *
 * Uniforms include:
 * u_scale - the scale applied to user space
 * u_colorCell1 - color #1 of mix used to fill the cell shape
 * u_colorCell2 - color #2 of mix used to fill the cell shape
 * u_colorCell3 - color #3 of mix used to fill the cell shape
 * u_colorEdges - color of borders between the cells
 * u_colorMid - color used to fill the radial shape in the center of each cell
 * u_colorGradient (0 .. 1) - if the cell color is a gradient of palette colors or one color selection
 * u_distance (0 ... 0.5) - how far the cell center can move from regular square grid
 * u_edgesSize (0 .. 1) - the size of borders
 *   (can be set to zero but the edge may get glitchy due to nature of Voronoi diagram)
 * u_edgesSoftness (0 .. 1) - the blur/sharp for cell border
 * u_middleSize (0 .. 1) - the size of shape in the center of each cell
 * u_middleSoftness (0 .. 1) - the smoothness of shape in the center of each cell
 *   (vary from cell color gradient to sharp dot in the middle)
 */

export const voronoiFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;

uniform vec4 u_colorCell1;
uniform vec4 u_colorCell2;
uniform vec4 u_colorCell3;
uniform vec4 u_colorEdges;
uniform vec4 u_colorMid;

uniform float u_colorGradient;
uniform float u_distance;
uniform float u_edgesSize;
uniform float u_edgesSoftness;
uniform float u_middleSize;
uniform float u_middleSoftness;

#define TWO_PI 6.28318530718

out vec4 fragColor;

vec2 hash(vec2 p) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

float smin(float angle, float b, float k) {
  float h = clamp(.5 + .5 * (b - angle) / k, 0., 1.);
  return mix(b, angle, h) - k * h * (1. - h);
}

vec4 getColor(vec4 c1, vec4 c2, vec4 c3, vec2 randomizer) {
    vec3 color1 = c1.rgb * c1.a;
    vec3 color2 = c2.rgb * c2.a;
    vec3 color3 = c3.rgb * c3.a;

    float t = randomizer[0];
    vec3 c = vec3(0.);
    if (t < .33) {
        c = mix(color1, color2, (t * 3.) * (u_colorGradient));
    } else if (t < .66) {
        c = mix(color2, color3, ((t - .33) * 3.) * u_colorGradient);
    } else {
        c = mix(color3, color1, ((t - .66) * 3.) * u_colorGradient);
    }

    return vec4(c, 1.);
}



//
//// Convert RGB to HSL
//vec3 rgbToHsl(vec3 color) {
//    float maxC = max(max(color.r, color.g), color.b);
//    float minC = min(min(color.r, color.g), color.b);
//    float delta = maxC - minC;
//
//    float h = 0.0;
//    float s = 0.0;
//    float l = (maxC + minC) / 2.0;
//
//    if (delta > 0.0) {
//        s = (l < 0.5) ? (delta / (maxC + minC)) : (delta / (2.0 - maxC - minC));
//
//        if (maxC == color.r) {
//            h = (color.g - color.b) / delta + (color.g < color.b ? 6.0 : 0.0);
//        } else if (maxC == color.g) {
//            h = (color.b - color.r) / delta + 2.0;
//        } else {
//            h = (color.r - color.g) / delta + 4.0;
//        }
//        h /= 6.0;
//    }
//    
//    return vec3(h, s, l);
//}
//
//// Convert HSL to RGB
//vec3 hslToRgb(vec3 hsl) {
//    float h = hsl.x;
//    float s = hsl.y;
//    float l = hsl.z;
//
//    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
//    float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
//    float m = l - c / 2.0;
//
//    vec3 rgb;
//    if (h < 1.0 / 6.0) {
//        rgb = vec3(c, x, 0.0);
//    } else if (h < 2.0 / 6.0) {
//        rgb = vec3(x, c, 0.0);
//    } else if (h < 3.0 / 6.0) {
//        rgb = vec3(0.0, c, x);
//    } else if (h < 4.0 / 6.0) {
//        rgb = vec3(0.0, x, c);
//    } else if (h < 5.0 / 6.0) {
//        rgb = vec3(x, 0.0, c);
//    } else {
//        rgb = vec3(c, 0.0, x);
//    }
//
//    return rgb + m;
//}
//
//// Main function: Blend colors in HSL
//vec4 getColor(vec4 color1, vec4 color2, vec4 color3, vec2 randomizer) {
//    // Convert RGB colors to HSL
//    vec3 hsl1 = rgbToHsl(color1.rgb);
//    vec3 hsl2 = rgbToHsl(color2.rgb);
//    vec3 hsl3 = rgbToHsl(color3.rgb);
//
//    // Select color based on randomizer.x
//    vec3 selectedHsl = mix(mix(hsl1, hsl2, step(0.33, randomizer.x)), hsl3, step(0.66, randomizer.x));
//
//    // Blend HSL colors
//    vec3 blendedHsl = (hsl1 + hsl2 + hsl3) / 3.0;
//    vec3 gradientMixHsl = mix(mix(hsl1, hsl2, randomizer.y), hsl3, randomizer.y);
//
//    // Final blended HSL
//    vec3 finalHsl = mix(mix(selectedHsl, gradientMixHsl, u_colorGradient), blendedHsl, u_colorGradient);
//
//    // Convert back to RGB
//    vec3 finalRgb = hslToRgb(finalHsl);
//
//    // Blend alpha channel separately
//    float finalAlpha = mix(mix(color1.a, color2.a, randomizer.y), color3.a, randomizer.y);
//    
//    return vec4(finalRgb, finalAlpha);
//}



//
//vec4 getColor(vec4 color1, vec4 color2, vec4 color3, vec2 randomizer) {
//    vec4 selectedColor = mix(mix(color1, color2, step(0.33, randomizer.x)), color3, step(0.66, randomizer.x));
//    vec4 blendedColor = (color1 + color2 + color3) / 3.0;
//    vec4 gradientMix = mix(mix(color1, color2, randomizer.y), color3, randomizer.y);
//    return mix(mix(selectedColor, gradientMix, u_colorGradient), blendedColor, u_colorGradient);
//}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = u_time;
  uv -= .5;
  uv *= (.01 * u_scale * u_resolution);
  uv /= u_pixelRatio;
  uv += .5;

  vec2 i_uv = floor(uv);
  vec2 f_uv = fract(uv);

  vec2 randomizer = vec2(0.);
  vec3 distance = vec3(1.);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 tile_offset = vec2(float(x), float(y));
      vec2 o = hash(i_uv + tile_offset);
      tile_offset += (.5 + clamp(u_distance, 0., .5) * sin(t + TWO_PI * o)) - f_uv;

      float dist = dot(tile_offset, tile_offset);
      float old_min_dist = distance.x;

      distance.z = max(distance.x, max(distance.y, min(distance.z, dist)));
      distance.y = max(distance.x, min(distance.y, dist));
      distance.x = min(distance.x, dist);

      if (old_min_dist > distance.x) {
        randomizer = o;
      }
    }
  }

  distance = sqrt(distance);

  distance = sqrt(distance);
  float cellShape = min(smin(distance.z, distance.y, .1) - distance.x, 1.);

  float dotShape = pow(distance.x, 2.) / (2. * clamp(u_middleSize, 0., 1.) + 1e-4);
  float dotEdgeWidth = fwidth(dotShape);
  float dotSharp = clamp(1. - u_middleSoftness, 0., 1.);
  dotShape = 1. - smoothstep(.5 * dotSharp - dotEdgeWidth, 1. - .5 * dotSharp, dotShape);

  float cellEdgeWidth = fwidth(distance.x);
  float w = .7 * (clamp(u_edgesSize, 0., 1.) - .1);
  float edgeSharp = clamp(u_edgesSoftness, 0., 1.);
  cellShape = smoothstep(w - cellEdgeWidth, w + edgeSharp, cellShape);

  dotShape *= cellShape;

  vec4 cellMix = getColor(u_colorCell1, u_colorCell2, u_colorCell3, (randomizer));
  
  vec4 edges = vec4(u_colorEdges.rgb * u_colorEdges.a, u_colorEdges.a);

  vec3 color = mix(edges.rgb, cellMix.rgb, cellShape);
  float opacity = mix(edges.a, cellMix.a, cellShape);

  color = mix(color, u_colorMid.rgb, u_colorMid.a * dotShape);

  fragColor = vec4(color, opacity);
}
`;

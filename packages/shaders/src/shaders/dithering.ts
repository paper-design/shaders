export type DitheringUniforms = {
  u_scale: number;
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_color4: [number, number, number, number];
  u_color5: [number, number, number, number];
  u_ditheringRes: number;
};

/**
 * Stepped Simplex Noise by Ksenia Kondrashova
 * Calculates a combination of 2 simplex noises with result rendered as
 * an X-stepped 5-colored gradient
 *
 * Uniforms include:
 * u_scale - the scale applied to user space
 * u_color1 - the first gradient color
 * u_color2 - the second gradient color
 * u_color3 - the third gradient color
 * u_color4 - the fourth gradient color
 * u_color5 - the fifth gradient color
 * u_ditheringRes - the number of solid colors to show as a stepped gradient
 */

export const ditheringFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform vec4 u_color4;
uniform vec4 u_color5;
uniform float u_ditheringRes;
uniform float u_numColors;
uniform float u_pxSize;

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

float get_noise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

vec4 getColor(int index) {
  if (index == 0) return u_color1;
  if (index == 1) return u_color2;
  if (index == 2) return u_color3;
  if (index == 3) return u_color4;
  if (index == 4) return u_color5;
  return u_color1;
}

const mat2x2 bayerMatrix2x2 = mat2x2(
    0.0, 2.0,
    3.0, 1.0
) / 4.0;

const mat4x4 bayerMatrix4x4 = mat4x4(
    0.0,  8.0,  2.0, 10.0,
    12.0, 4.0,  14.0, 6.0,
    3.0,  11.0, 1.0, 9.0,
    15.0, 7.0,  13.0, 5.0
) / 16.0;

const float bayerMatrix8x8[64] = float[64](
    0.0/ 64.0, 48.0/ 64.0, 12.0/ 64.0, 60.0/ 64.0,  3.0/ 64.0, 51.0/ 64.0, 15.0/ 64.0, 63.0/ 64.0,
  32.0/ 64.0, 16.0/ 64.0, 44.0/ 64.0, 28.0/ 64.0, 35.0/ 64.0, 19.0/ 64.0, 47.0/ 64.0, 31.0/ 64.0,
    8.0/ 64.0, 56.0/ 64.0,  4.0/ 64.0, 52.0/ 64.0, 11.0/ 64.0, 59.0/ 64.0,  7.0/ 64.0, 55.0/ 64.0,
  40.0/ 64.0, 24.0/ 64.0, 36.0/ 64.0, 20.0/ 64.0, 43.0/ 64.0, 27.0/ 64.0, 39.0/ 64.0, 23.0/ 64.0,
    2.0/ 64.0, 50.0/ 64.0, 14.0/ 64.0, 62.0/ 64.0,  1.0/ 64.0, 49.0/ 64.0, 13.0/ 64.0, 61.0/ 64.0,
  34.0/ 64.0, 18.0/ 64.0, 46.0/ 64.0, 30.0/ 64.0, 33.0/ 64.0, 17.0/ 64.0, 45.0/ 64.0, 29.0/ 64.0,
  10.0/ 64.0, 58.0/ 64.0,  6.0/ 64.0, 54.0/ 64.0,  9.0/ 64.0, 57.0/ 64.0,  5.0/ 64.0, 53.0/ 64.0,
  42.0/ 64.0, 26.0/ 64.0, 38.0/ 64.0, 22.0/ 64.0, 41.0/ 64.0, 25.0/ 64.0, 37.0/ 64.0, 21.0 / 64.0
);





float Bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2. + a.y * a.y * .75);
}

#define Bayer4(a)   (Bayer2 (.5 *(a)) * .25 + Bayer2(a))
#define Bayer8(a)   (Bayer4 (.5 *(a)) * .25 + Bayer2(a))
#define Bayer16(a)  (Bayer8 (.5 *(a)) * .25 + Bayer2(a))
#define Bayer32(a)  (Bayer16(.5 *(a)) * .25 + Bayer2(a))
#define Bayer64(a)  (Bayer32(.5 *(a)) * .25 + Bayer2(a))




vec3 dither(vec2 uv, vec3 color) {
  int x = int(uv.x * u_resolution.x) % 8;
  int y = int(uv.y * u_resolution.y) % 8;
  float threshold = bayerMatrix8x8[y * 8 + x];

  color.rgb += threshold * 0.6;
  color.r = floor(color.r * (u_numColors - 1.0) + 0.5) / (u_numColors - 1.0);
  color.g = floor(color.g * (u_numColors - 1.0) + 0.5) / (u_numColors - 1.0);
  color.b = floor(color.b * (u_numColors - 1.0) + 0.5) / (u_numColors - 1.0);

  return color;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  uv -= .5;
  float scale = .5 * u_scale + 1e-4;
  uv *= (.0008 * (1. - step(1. - scale, 1.) / scale));
  uv *= u_resolution;
  uv /= u_pixelRatio;
  uv += .5;

  float t = u_time;

  float noise = .5 + .5 * get_noise(uv, t);

  vec3 noise_color = u_color1.rgb * u_color1.a;
  float noise_opacity = u_color1.a;
  for (int i = 0; i < 5; i++) {
    vec4 next_c = getColor(i + 1);
    float proportion = smoothstep((float(i) + .5) / 5., (float(i) + 2.) / 5., noise);
    noise_color = mix(noise_color, next_c.rgb * next_c.a, proportion);
    noise_opacity = mix(noise_opacity, next_c.a, proportion);
  }
  
  vec4 imp_color = vec4(noise_color, noise_opacity);
  
  vec3 color = imp_color.rgb;
  


//  color.rgb = dither(u_ditheringRes * uv, color.rgb);
//  fragColor = vec4(color, 1.);
  
  
  
  
  
    vec2 dithering_uv = floor(gl_FragCoord.xy / u_pxSize);
    float dithering = Bayer64(dithering_uv) - 0.5;
    noise += dithering;
    noise = mix(0., 1., step(.5, noise));
    vec3 darkColor = vec3(1., .2, .6);
    vec3 lightColor = vec3(.1, .9, .6);
    vec3 colorMapped = noise * lightColor + (1. - noise) * darkColor;    
    fragColor = vec4(colorMapped, 1.);
    
  
  
  
//  vec2 pixel = (gl_FragCoord.xy / u_resolution.xy) * u_resolution;
//  vec2 coord = pixel / u_pxSize;
//  vec2 subcoord = coord * vec2(3, 1);
//  vec2 cellOffset = vec2(0, mod(floor(coord.x), 3.0) * 0.5);
//  vec2 cellUv = fract(subcoord + cellOffset) * 2.0 - 1.0;
//  vec2 rgbCellUV = floor(coord+cellOffset) * u_pxSize / u_resolution;
//  color.rgb = dither(rgbCellUV, color.rgb);
//  fragColor = vec4(color, 1.);
  
  
  

  
//    float resScaleExp = u_ditheringRes;
//    float ditherResScale = pow(.5, resScaleExp);
//    vec2 lowResCoord = floor((gl_FragCoord.xy - u_resolution.xy/2.0) * ditherResScale) / ditherResScale + u_resolution.xy/2.0;
//    
//    vec4 texColor = imp_color;
//
//    float grey = (texColor.r + texColor.g + texColor.b)/3.0;
//    float minigrid = 2.0;
//    
//    float ditherLevels = minigrid * minigrid;
//
//    float pixelNo = mod(lowResCoord.y * ditherResScale, minigrid) * minigrid + mod(lowResCoord.x * ditherResScale, minigrid);
//    pixelNo = mod(pixelNo+mod(resScaleExp + 1., 2.), ditherLevels);
//    
//    float pixelValueOffset = pixelNo/ditherLevels;
//    
//    float ditheredGrey = clamp(floor(grey + pixelValueOffset), 0.0, 1.0);
////    fragColor = vec4(vec3(ditheredGrey), 1.);
//    
//
//
//    
//    vec3 darkColor = vec3(0.);
//    vec3 lightColor = vec3(1.);
//    vec3 colorMapped = ditheredGrey * lightColor + (1.0 - ditheredGrey) * darkColor;    
//    fragColor = vec4(colorMapped, 1.);
}
`;

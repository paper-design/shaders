export type DitheringUniforms = {
    u_scale: number;
    u_color1: [number, number, number, number];
    u_color2: [number, number, number, number];
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

float random(vec2 c) {
  return fract(sin(dot(c.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float get_noise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

float Bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2. + a.y * a.y * .75);
}

#define Bayer4(a)   (Bayer2 (.5 *(a)) * .25 + Bayer2(a))
#define Bayer8(a)   (Bayer4 (.5 *(a)) * .25 + Bayer2(a))
#define Bayer16(a)  (Bayer8 (.5 *(a)) * .25 + Bayer2(a))
#define Bayer32(a)  (Bayer16(.5 *(a)) * .25 + Bayer2(a))


void main() {
  float scale = .5 * u_scale + 1e-4;
  float t = u_time;

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv -= .5;
  uv *= (.0008 * (1. - step(1. - scale, 1.) / scale));
  uv *= u_resolution;
  uv /= u_pixelRatio;
  uv += .5;
  
  vec2 uv_px = floor(gl_FragCoord.xy / u_pxSize) * u_pxSize;
  uv_px -= .5;
  uv_px *= (.0008 * (1. - step(1. - scale, 1.) / scale));
  uv_px /= u_pixelRatio;
  uv_px += .5;
  
  
  vec2 uv_classic = gl_FragCoord.xy / u_resolution.xy;
  
  
//  float noise = .5 + .5 * get_noise(uv, t);
  float noise = .5 + .5 * get_noise(uv_px, t);

   noise = uv_px.x;
   
   
   
    vec2 dithering_uv = gl_FragCoord.xy / u_pxSize;
    int ditheringRes = int(floor(u_ditheringRes));
    
    float dithering = 0.;
    switch (ditheringRes) {
        case 1: dithering = Bayer2(dithering_uv); break;
        case 2: dithering = Bayer4(dithering_uv); break;
        case 3: dithering = Bayer8(dithering_uv); break;
        case 4: dithering = Bayer16(dithering_uv); break;
        case 5: {             
          dithering = step(random(uv_px), smoothstep(.2, .9, noise));
        } break;
        default: dithering = 0.; break;
    }

    dithering -= .5;
    float res = step(.5, noise + dithering);

   vec3 darkColor = u_color1.rgb;
   vec3 lightColor = u_color2.rgb;
   vec3 color = res * lightColor + (1. - res) * darkColor;    

   fragColor = vec4(color, 1.);
//
//   fragColor = vec4(vec3(noise), 1.);
}
`;

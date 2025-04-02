export type DitheringUniforms = {
  u_scale: number;
  u_shape: number;
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_type: number;
  u_pxSize: number;
  // u_pxRounded: boolean;
};

/**
 *
 * Uniforms include:
 */

export const ditheringFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform float u_shape;
uniform float u_type;
uniform float u_pxSize;
uniform bool u_pxRounded;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

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

float random(in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float get_noise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

const int bayer2x2[4] = int[4](0, 2, 3, 1);
const int bayer4x4[16] = int[16](
  0,  8,  2, 10, 
 12,  4, 14,  6, 
  3, 11,  1,  9, 
 15,  7, 13,  5
);

const int bayer8x8[64] = int[64](
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv, int size) {
  ivec2 pos = ivec2(uv) % size;
  int index = (pos.y % size) * size + (pos.x % size);

  if (size == 2) {
    return float(bayer2x2[index]) / 4.0;
  } else if (size == 4) {
    return float(bayer4x4[index]) / 16.0;
  } else if (size == 8) {
    return float(bayer8x8[index]) / 64.0;
  }
  return 0.0;
}

void main() {
  float t = u_time;  
  float ratio = u_resolution.x / u_resolution.y;  
  
  vec2 uv = vec2(0.);  
  if (u_pxRounded) {  
    uv = floor(gl_FragCoord.xy / (u_pxSize * u_pixelRatio)) * (u_pxSize * u_pixelRatio) / u_resolution.xy;  
  } else {  
    uv = gl_FragCoord.xy / u_resolution.xy;  
  }  
  
  float shape = 0.;  
  float noise_scale = 0.0008 * u_scale + 1e-4;  
  
  if (u_shape < 1.5) {  
    // Simplex noise  
    uv -= 0.5;  
    uv *= 1.5 * noise_scale;  
    uv *= u_resolution;  
    uv /= u_pixelRatio;  
    uv += 0.5;  
      
    shape = 0.5 + 0.5 * get_noise(uv, t);
    shape = smoothstep(0.3, 0.9, shape);
      
  } else if (u_shape < 2.5) {  
    // Warp  
    uv -= 0.5;  
    uv *= 2. * noise_scale;
    uv *= u_resolution;  
    uv /= u_pixelRatio;  
    uv += 0.5;
    
    for (float i = 1.0; i < 6.0; i++) {  
      uv.x += 0.6 / i * cos(i * 2.5 * uv.y + t);  
      uv.y += 0.6 / i * cos(i * 1.5 * uv.x + t);  
    }  
    
    shape = .15 / abs(sin(t - uv.y - uv.x));  
    shape = smoothstep(0.02, 1., shape);
  
  } else if (u_shape < 3.5) {  
    // Sine wave

    uv -= .5;
    uv *= 3. * u_scale;
    uv.x *= ratio;  
    
    float wave = cos(.5 * uv.x - 2. * t) * sin(1.5 * uv.x + t) * (.75 + .25 * cos(3. * t));
    shape = 1. - smoothstep(-1., 1., uv.y + wave);
          
  } else if (u_shape < 4.5) {  
    // Grid  
    uv -= 0.5;  
    uv *= 50. * noise_scale;
    uv *= u_resolution;  
    uv /= u_pixelRatio;  
    uv += 0.5;
    
    float stripeIdx = floor(2. * uv.x / TWO_PI);
    float rand = fract(sin(stripeIdx * 12.9898) * 43758.5453);

    float speed = sign(rand - .5) * ceil(2. + rand);
    shape = sin(uv.x) * cos(uv.y + speed * t);  
    shape = pow(shape, 6.);
      
  } else if (u_shape < 5.5) {  
    // Ripple  
    uv -= 0.5;  
    uv.x *= ratio;  
    uv *= 1.25 * u_scale;
    uv += 0.5;  
    
    float dist = length(uv - vec2(.5));
    float waves = sin(pow(dist, 1.7) * 7. - 3. * t) * .5 + .5;
    shape = waves;
    
  } else if (u_shape < 6.5) {  
    // Swirl  
    uv -= 0.5;  
    uv.x *= ratio;  
    uv *= 1.7 * u_scale;

    float l = length(uv);
    float angle = 6. * atan(uv.y, uv.x) + 4. * t;
    float angle_norm = angle / TWO_PI;  
    float twist = 1.2;
    float offset = pow(l, -twist) + angle_norm;
    float stripe_map = fract(offset);
    float mid = smoothstep(0., 1., pow(l, twist));
    shape = mix(0., stripe_map, mid);
    
  } else {
    // Sphere  
    uv -= 0.5;  
    uv.x *= ratio;  
    uv *= 2.25 * u_scale;
    
    vec3 pos = vec3(uv, sqrt(1. - pow(length(uv), 2.)));
    vec3 lightPos = normalize(vec3(cos(1.5 * t), .8, sin(1.25 * t)));
    shape = .5 + .5 * dot(lightPos, pos);
  }  
  
  vec2 dithering_uv = gl_FragCoord.xy / (u_pxSize * u_pixelRatio);  
  int type = int(floor(u_type));  
  float dithering = 0.0;  
  
  switch (type) {  
    case 1: {  
      uv = floor(gl_FragCoord.xy / (u_pxSize * u_pixelRatio)) * (u_pxSize * u_pixelRatio);  
      uv *= noise_scale;  
      uv *= 2.0;
      uv /= u_pixelRatio;  
      dithering = step(random(uv), shape);  
    } break;  
    case 2:  
      dithering = getBayerValue(dithering_uv, 2);  
      break;  
    case 3:  
      dithering = getBayerValue(dithering_uv, 4);  
      break;  
    default:  
      dithering = getBayerValue(dithering_uv, 8);  
      break;  
  }  
  
  dithering -= 0.5;  
  float res = step(0.5, shape + dithering);  
  
  vec4 color = mix(u_color1, u_color2, res);
  
  fragColor = color;
}`;

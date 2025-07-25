// language=GLSL
export const declarePI = `
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`;

// language=GLSL
export const declareRotate = `
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`;

// language=GLSL
export const declareRandom = `
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
`;

// language=GLSL
export const declareValueNoise = `
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}
`;

// It does use the standard random function but we don't call it to keep
// colorBandingFix insertion independent from declareRandom
export const colorBandingFix = `
  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);
`;

// language=GLSL
export const declareSimplexNoise = `
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
`;

// language=GLSL
export const declareGrainShape = `
vec2 grainRandom(vec2 p) {
  float angle = fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  angle *= 6.2831853;
  return vec2(cos(angle), sin(angle));
}

float grainNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float n00 = dot(grainRandom(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
  float n10 = dot(grainRandom(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float n01 = dot(grainRandom(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float n11 = dot(grainRandom(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));

  float nx0 = mix(n00, n10, u.x);
  float nx1 = mix(n01, n11, u.x);
  return mix(nx0, nx1, u.y);
}

float grainShape(vec2 uv, vec2 seedOffset) {
  float total = 0.0;
  float amp = 0.5;
  float freq = .6;

  for (int i = 0; i < 4; i++) {
    total += amp * grainNoise(uv * freq + seedOffset);
    freq *= 2.;
    amp *= .5;
  }

  total = .5 + .5 * total;
  return 10. * u_scale * length(vec2(dFdx(total), dFdy(total)));
}
`;

// Shared WGSL definitions used by all shaders

export const systemUniformFields = `
  u_resolution: vec2f,
  u_pixelRatio: f32,
  u_time: f32,
  u_imageAspectRatio: f32,
  u_originX: f32,
  u_originY: f32,
  u_worldWidth: f32,
  u_worldHeight: f32,
  u_fit: f32,
  u_scale: f32,
  u_rotation: f32,
  u_offsetX: f32,
  u_offsetY: f32,
`;

export const vertexOutputStruct = `
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) v_objectUV: vec2f,
  @location(1) v_objectBoxSize: vec2f,
  @location(2) v_responsiveUV: vec2f,
  @location(3) v_responsiveBoxGivenSize: vec2f,
  @location(4) v_patternUV: vec2f,
  @location(5) v_patternBoxSize: vec2f,
  @location(6) v_imageUV: vec2f,
}
`;

// WGSL utility functions

export const declarePI = `
const TWO_PI: f32 = 6.28318530718;
const PI: f32 = 3.14159265358979323846;
`;

export const rotation2 = `
fn rotate(uv: vec2f, th: f32) -> vec2f {
  return mat2x2f(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`;

export const proceduralHash11 = `
fn hash11(p_in: f32) -> f32 {
  var p = fract(p_in * 0.3183099) + 0.1;
  p *= p + 19.19;
  return fract(p * p);
}
`;

export const proceduralHash21 = `
fn hash21(p_in: vec2f) -> f32 {
  var p = fract(p_in * vec2f(0.3183099, 0.3678794)) + vec2f(0.1);
  p += vec2f(dot(p, p + vec2f(19.19)));
  return fract(p.x * p.y);
}
`;

export const proceduralHash22 = `
fn hash22(p_in: vec2f) -> vec2f {
  var p = fract(p_in * vec2f(0.3183099, 0.3678794)) + vec2f(0.1);
  p += vec2f(dot(p, p.yx + vec2f(19.19)));
  return fract(vec2f(p.x * p.y, p.x + p.y));
}
`;

export const textureRandomizerR = `
fn randomR(p: vec2f) -> f32 {
  let uv = floor(p) / 100.0 + vec2f(0.5);
  return textureSampleLevel(u_noiseTexture_tex, u_noiseTexture_samp, fract(uv), 0.0).r;
}
`;

export const textureRandomizerGB = `
fn randomGB(p: vec2f) -> vec2f {
  let uv = floor(p) / 100.0 + vec2f(0.5);
  return textureSampleLevel(u_noiseTexture_tex, u_noiseTexture_samp, fract(uv), 0.0).gb;
}
`;

export const colorBandingFix = `
  color += vec3f(1.0 / 256.0 * (fract(sin(dot(0.014 * input.position.xy, vec2f(12.9898, 78.233))) * 43758.5453123) - 0.5));
`;

export const glslMod = `
fn glsl_mod_f32(x: f32, y: f32) -> f32 {
  return x - y * floor(x / y);
}
fn glsl_mod_vec2(x: vec2f, y: f32) -> vec2f {
  return x - vec2f(y) * floor(x / vec2f(y));
}
fn glsl_mod_vec3(x: vec3f, y: f32) -> vec3f {
  return x - vec3f(y) * floor(x / vec3f(y));
}
`;

export const simplexNoise = `
fn permute3(x: vec3f) -> vec3f { return glsl_mod_vec3(((x * 34.0) + vec3f(1.0)) * x, 289.0); }
fn snoise(v: vec2f) -> f32 {
  let C = vec4f(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  let i = floor(v + vec2f(dot(v, C.yy)));
  let x0 = v - i + vec2f(dot(i, C.xx));
  var i1: vec2f;
  if (x0.x > x0.y) { i1 = vec2f(1.0, 0.0); } else { i1 = vec2f(0.0, 1.0); }
  var x12 = x0.xyxy + C.xxzz;
  x12 = vec4f(x12.xy - i1, x12.zw);
  let i_mod = glsl_mod_vec2(i, 289.0);
  let p = permute3(permute3(vec3f(i_mod.y) + vec3f(0.0, i1.y, 1.0))
    + vec3f(i_mod.x) + vec3f(0.0, i1.x, 1.0));
  var m = max(vec3f(0.5) - vec3f(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), vec3f(0.0));
  m = m * m;
  m = m * m;
  let x_val = 2.0 * fract(p * C.www) - vec3f(1.0);
  let h = abs(x_val) - vec3f(0.5);
  let ox = floor(x_val + vec3f(0.5));
  let a0 = x_val - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  let g = vec3f(
    a0.x * x0.x + h.x * x0.y,
    a0.y * x12.x + h.y * x12.y,
    a0.z * x12.z + h.z * x12.w
  );
  return 130.0 * dot(m, g);
}
`;

export const fiberNoise = `
fn fiberRandom(p: vec2f) -> f32 {
  let uv = floor(p) / 100.0;
  return textureSampleLevel(u_noiseTexture_tex, u_noiseTexture_samp, fract(uv), 0.0).b;
}

fn fiberValueNoise(st: vec2f) -> f32 {
  let i = floor(st);
  let f = fract(st);
  let a = fiberRandom(i);
  let b = fiberRandom(i + vec2f(1.0, 0.0));
  let c = fiberRandom(i + vec2f(0.0, 1.0));
  let d = fiberRandom(i + vec2f(1.0, 1.0));
  let u_val = f * f * (vec2f(3.0) - 2.0 * f);
  let x1 = mix(a, b, u_val.x);
  let x2 = mix(c, d, u_val.x);
  return mix(x1, x2, u_val.y);
}

fn fiberNoiseFbm(n_in: vec2f, seedOffset: vec2f) -> f32 {
  var n = n_in;
  var total: f32 = 0.0;
  var amplitude: f32 = 1.0;
  for (var i: i32 = 0; i < 4; i++) {
    n = rotate(n, 0.7);
    total += fiberValueNoise(n + seedOffset) * amplitude;
    n *= 2.0;
    amplitude *= 0.6;
  }
  return total;
}

fn fiberNoise(uv: vec2f, seedOffset: vec2f) -> f32 {
  let epsilon: f32 = 0.001;
  let n1 = fiberNoiseFbm(uv + vec2f(epsilon, 0.0), seedOffset);
  let n2 = fiberNoiseFbm(uv - vec2f(epsilon, 0.0), seedOffset);
  let n3 = fiberNoiseFbm(uv + vec2f(0.0, epsilon), seedOffset);
  let n4 = fiberNoiseFbm(uv - vec2f(0.0, epsilon), seedOffset);
  return length(vec2f(n1 - n2, n3 - n4)) / (2.0 * epsilon);
}
`;

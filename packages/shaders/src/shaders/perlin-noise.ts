import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, colorBandingFix, proceduralHash11, proceduralHash21 } from '../shader-utils.js';

/**
 * Classic animated 3D Perlin noise with exposed controls.
 * Original algorithm: https://www.shadertoy.com/view/NlSGDz
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_colorFront (vec4): Foreground color in RGBA
 * - u_colorBack (vec4): Background color in RGBA
 * - u_proportion (float): Blend point between 2 colors, 0.5 = equal distribution (0 to 1)
 * - u_softness (float): Color transition sharpness, 0 = hard edge, 1 = smooth gradient (0 to 1)
 * - u_octaveCount (float): Perlin noise octaves number, more octaves for more detailed patterns (1 to 8)
 * - u_persistence (float): Roughness, falloff between octaves (0.3 to 1)
 * - u_lacunarity (float): Frequency step, defines how compressed the pattern is (1.5 to 10)
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_patternUV (vec2): UV coordinates for pattern with global sizing (rotation, scale, offset, etc) applied
 *
 * Vertex shader uniforms:
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_originX (float): Reference point for positioning world width in the canvas (0 to 1)
 * - u_originY (float): Reference point for positioning world height in the canvas (0 to 1)
 * - u_worldWidth (float): Virtual width of the graphic before it's scaled to fit the canvas
 * - u_worldHeight (float): Virtual height of the graphic before it's scaled to fit the canvas
 * - u_fit (float): How to fit the rendered shader into the canvas dimensions (0 = none, 1 = contain, 2 = cover)
 * - u_scale (float): Overall zoom level of the graphics (0.01 to 4)
 * - u_rotation (float): Overall rotation angle of the graphics in degrees (0 to 360)
 * - u_offsetX (float): Horizontal offset of the graphics center (-1 to 1)
 * - u_offsetY (float): Vertical offset of the graphics center (-1 to 1)
 *
 */

// language=WGSL
export const perlinNoiseFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorFront: vec4f,
  u_colorBack: vec4f,
  u_proportion: f32,
  u_softness: f32,
  u_octaveCount: f32,
  u_persistence: f32,
  u_lacunarity: f32,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

${declarePI}
${proceduralHash11}
${proceduralHash21}

fn hash31(p_in: vec3f) -> f32 {
  var p = fract(p_in * 0.3183099) + vec3f(0.1);
  p += vec3f(dot(p, p.yzx + vec3f(19.19)));
  return fract(p.x * (p.y + p.z));
}

fn gradientPredefined(hash: f32) -> vec3f {
  let idx = i32(hash * 12.0) % 12;

  if (idx == 0) { return vec3f(1.0, 1.0, 0.0); }
  if (idx == 1) { return vec3f(-1.0, 1.0, 0.0); }
  if (idx == 2) { return vec3f(1.0, -1.0, 0.0); }
  if (idx == 3) { return vec3f(-1.0, -1.0, 0.0); }
  if (idx == 4) { return vec3f(1.0, 0.0, 1.0); }
  if (idx == 5) { return vec3f(-1.0, 0.0, 1.0); }
  if (idx == 6) { return vec3f(1.0, 0.0, -1.0); }
  if (idx == 7) { return vec3f(-1.0, 0.0, -1.0); }
  if (idx == 8) { return vec3f(0.0, 1.0, 1.0); }
  if (idx == 9) { return vec3f(0.0, -1.0, 1.0); }
  if (idx == 10) { return vec3f(0.0, 1.0, -1.0); }
  return vec3f(0.0, -1.0, -1.0);// idx == 11
}

fn interpolateSafe(v000: f32, v001: f32, v010: f32, v011: f32,
  v100: f32, v101: f32, v110: f32, v111: f32, t_in: vec3f) -> f32 {
  let t = clamp(t_in, vec3f(0.0), vec3f(1.0));

  let v00 = mix(v000, v100, t.x);
  let v01 = mix(v001, v101, t.x);
  let v10 = mix(v010, v110, t.x);
  let v11 = mix(v011, v111, t.x);

  let v0 = mix(v00, v10, t.y);
  let v1 = mix(v01, v11, t.y);

  return mix(v0, v1, t.z);
}

fn fade(t: vec3f) -> vec3f {
  return t * t * t * (t * (t * 6.0 - vec3f(15.0)) + vec3f(10.0));
}

fn perlinNoise(position_in: vec3f, seed: f32) -> f32 {
  let position = position_in + vec3f(seed * 127.1, seed * 311.7, seed * 74.7);

  let i = floor(position);
  let f = fract(position);
  let h000 = hash31(i);
  let h001 = hash31(i + vec3f(0.0, 0.0, 1.0));
  let h010 = hash31(i + vec3f(0.0, 1.0, 0.0));
  let h011 = hash31(i + vec3f(0.0, 1.0, 1.0));
  let h100 = hash31(i + vec3f(1.0, 0.0, 0.0));
  let h101 = hash31(i + vec3f(1.0, 0.0, 1.0));
  let h110 = hash31(i + vec3f(1.0, 1.0, 0.0));
  let h111 = hash31(i + vec3f(1.0, 1.0, 1.0));
  let g000 = gradientPredefined(h000);
  let g001 = gradientPredefined(h001);
  let g010 = gradientPredefined(h010);
  let g011 = gradientPredefined(h011);
  let g100 = gradientPredefined(h100);
  let g101 = gradientPredefined(h101);
  let g110 = gradientPredefined(h110);
  let g111 = gradientPredefined(h111);
  let val000 = dot(g000, f - vec3f(0.0, 0.0, 0.0));
  let val001 = dot(g001, f - vec3f(0.0, 0.0, 1.0));
  let val010 = dot(g010, f - vec3f(0.0, 1.0, 0.0));
  let val011 = dot(g011, f - vec3f(0.0, 1.0, 1.0));
  let val100 = dot(g100, f - vec3f(1.0, 0.0, 0.0));
  let val101 = dot(g101, f - vec3f(1.0, 0.0, 1.0));
  let val110 = dot(g110, f - vec3f(1.0, 1.0, 0.0));
  let val111 = dot(g111, f - vec3f(1.0, 1.0, 1.0));

  let u_fade = fade(f);
  return interpolateSafe(val000, val001, val010, val011, val100, val101, val110, val111, u_fade);
}

fn p_noise(position: vec3f, octaveCount_in: i32, persistence: f32, lacunarity: f32) -> f32 {
  var value: f32 = 0.0;
  var amplitude: f32 = 1.0;
  var frequency: f32 = 10.0;
  var maxValue: f32 = 0.0;
  let octaveCount = clamp(octaveCount_in, 1, 8);

  for (var i: i32 = 0; i < octaveCount; i++) {
    let seed = f32(i) * 0.7319;
    value += perlinNoise(position * frequency, seed) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  return value;
}

fn get_max_amp(persistence_in: f32, octaveCount_in: f32) -> f32 {
  let persistence = clamp(persistence_in * 0.999, 0.0, 0.999);
  let octaveCount = clamp(octaveCount_in, 1.0, 8.0);

  if (abs(persistence - 1.0) < 0.001) {
    return octaveCount;
  }

  return (1.0 - pow(persistence, octaveCount)) / max(1e-4, (1.0 - persistence));
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  var uv = input.v_patternUV;
  uv *= 0.5;

  let t = 0.2 * u.u_time;

  let p = vec3f(uv, t);

  let octCount = floor(u.u_octaveCount);
  let noise = p_noise(p, i32(octCount), u.u_persistence, u.u_lacunarity);

  let max_amp = get_max_amp(u.u_persistence, octCount);
  let noise_normalized = clamp((noise + max_amp) / max(1e-4, (2.0 * max_amp)) + (u.u_proportion - 0.5), 0.0, 1.0);
  let sharpness = clamp(u.u_softness, 0.0, 1.0);
  let smooth_w = 0.5 * max(fwidth(noise_normalized), 0.001);
  let res = smoothstep(
    0.5 - 0.5 * sharpness - smooth_w,
    0.5 + 0.5 * sharpness + smooth_w,
    noise_normalized
  );

  let fgColor = u.u_colorFront.rgb * u.u_colorFront.a;
  let fgOpacity = u.u_colorFront.a;
  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
  let bgOpacity = u.u_colorBack.a;

  var color = fgColor * res;
  var opacity = fgOpacity * res;

  color += bgColor * (1.0 - opacity);
  opacity += bgOpacity * (1.0 - opacity);

  ${colorBandingFix}

  return vec4f(color, opacity);
}
`;

export interface PerlinNoiseUniforms extends ShaderSizingUniforms {
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_proportion: number;
  u_softness: number;
  u_octaveCount: number;
  u_persistence: number;
  u_lacunarity: number;
}

export interface PerlinNoiseParams extends ShaderSizingParams, ShaderMotionParams {
  colorFront?: string;
  colorBack?: string;
  proportion?: number;
  softness?: number;
  octaveCount?: number;
  persistence?: number;
  lacunarity?: number;
}

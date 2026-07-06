import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import {
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing.js';
import {
  systemUniformFields,
  vertexOutputStruct,
  simplexNoise,
  declarePI,
  glslMod,
  rotation2,
  textureRandomizerR,
  proceduralHash11,
} from '../shader-utils.js';

export const grainGradientMeta = {
  maxColorCount: 7,
} as const;

/**
 * Multi-color gradients with grainy, noise-textured distortion available in 7 animated abstract forms.
 *
 * Note: grains are calculated using input.position & u_resolution, meaning grains don't react to scaling and fit
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_originX (float): Reference point for positioning (0 to 1)
 * - u_originY (float): Reference point for positioning (0 to 1)
 * - u_worldWidth (float): Virtual width of the graphic
 * - u_worldHeight (float): Virtual height of the graphic
 * - u_fit (float): Fit mode (0 = none, 1 = contain, 2 = cover)
 * - u_scale (float): Overall zoom level (0.01 to 4)
 * - u_rotation (float): Rotation angle in degrees (0 to 360)
 * - u_offsetX (float): Horizontal offset (-1 to 1)
 * - u_offsetY (float): Vertical offset (-1 to 1)
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colors (vec4[]): Up to 7 gradient colors in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_softness (float): Color transition sharpness, 0 = hard edge, 1 = smooth gradient (0 to 1)
 * - u_intensity (float): Distortion between color bands (0 to 1)
 * - u_noise (float): Grainy noise overlay (0 to 1)
 * - u_shape (float): Shape type (1 = wave, 2 = dots, 3 = truchet, 4 = corners, 5 = ripple, 6 = blob, 7 = sphere)
 * - u_noiseTexture (sampler2D): Pre-computed randomizer source texture
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_objectUV (vec2): Object box UV coordinates with global sizing (scale, rotation, offsets, etc) applied (used for shapes 4-7)
 * - v_objectBoxSize (vec2): Size of the object bounding box in pixels
 * - v_patternUV (vec2): UV coordinates for pattern with global sizing (rotation, scale, offset, etc) applied (used for shapes 1-3)
 * - v_patternBoxSize (vec2): Size of the pattern bounding box in pixels
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
export const grainGradientFragmentShader: string = `
struct Uniforms {
  ${ systemUniformFields }
  u_colorsCount: f32,
  u_softness: f32,
  u_intensity: f32,
  u_noise: f32,
  u_shape: f32,
  u_colorBack: vec4f,
  u_colors: array<vec4f, ${ grainGradientMeta.maxColorCount }>,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

@group(1) @binding(0) var u_noiseTexture_tex: texture_2d<f32>;
@group(1) @binding(1) var u_noiseTexture_samp: sampler;

${ vertexOutputStruct }

${ declarePI }
${ glslMod }
${ simplexNoise }
${ rotation2 }
${ textureRandomizerR }

fn valueNoiseR(st: vec2f) -> f32 {
  let i = floor(st);
  let f = fract(st);
  let a = randomR(i);
  let b = randomR(i + vec2f(1.0, 0.0));
  let c = randomR(i + vec2f(0.0, 1.0));
  let d = randomR(i + vec2f(1.0, 1.0));
  let u_val = f * f * (vec2f(3.0) - 2.0 * f);
  let x1 = mix(a, b, u_val.x);
  let x2 = mix(c, d, u_val.x);
  return mix(x1, x2, u_val.y);
}
fn fbmR(n0_in: vec2f, n1_in: vec2f, n2_in: vec2f, n3_in: vec2f) -> vec4f {
  var amplitude: f32 = 0.2;
  var total = vec4f(0.0);
  var n0 = n0_in;
  var n1 = n1_in;
  var n2 = n2_in;
  var n3 = n3_in;
  for (var i: i32 = 0; i < 3; i++) {
    n0 = rotate(n0, 0.3);
    n1 = rotate(n1, 0.3);
    n2 = rotate(n2, 0.3);
    n3 = rotate(n3, 0.3);
    total = vec4f(total.x + valueNoiseR(n0) * amplitude, total.y + valueNoiseR(n1) * amplitude, total.z + valueNoiseR(n2) * amplitude, total.w);
    total = vec4f(total.x, total.y, total.z + valueNoiseR(n3) * amplitude, total.w);
    n0 *= 1.99;
    n1 *= 1.99;
    n2 *= 1.99;
    n3 *= 1.99;
    amplitude *= 0.6;
  }
  return total;
}

${ proceduralHash11 }

fn truchet(uv_in: vec2f, idx_in: f32) -> vec2f {
  var uv = uv_in;
  var idx = fract(((idx_in - 0.5) * 2.0));
  if (idx > 0.75) {
    uv = vec2f(1.0) - uv;
  } else if (idx > 0.5) {
    uv = vec2f(1.0 - uv.x, uv.y);
  } else if (idx > 0.25) {
    uv = vec2f(1.0) - vec2f(1.0 - uv.x, uv.y);
  }
  return uv;
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {

  let firstFrameOffset: f32 = 7.0;
  var t: f32 = 0.1 * (u.u_time + firstFrameOffset);

  var shape_uv = vec2f(0.0);
  var grain_uv = vec2f(0.0);

  let r = u.u_rotation * PI / 180.0;
  let cr = cos(r);
  let sr = sin(r);
  let graphicRotation = mat2x2f(cr, sr, -sr, cr);
  let graphicOffset = vec2f(-u.u_offsetX, u.u_offsetY);

  if (u.u_shape > 3.5) {
    shape_uv = input.v_objectUV;
    grain_uv = shape_uv;

    // apply inverse transform to grain_uv so it respects the originXY
    grain_uv = transpose(graphicRotation) * grain_uv;
    grain_uv *= u.u_scale;
    grain_uv -= graphicOffset;
    grain_uv *= input.v_objectBoxSize;
    grain_uv *= 0.7;
  } else {
    shape_uv = 0.5 * input.v_patternUV;
    grain_uv = 100.0 * input.v_patternUV;

    // apply inverse transform to grain_uv so it respects the originXY
    grain_uv = transpose(graphicRotation) * grain_uv;
    grain_uv *= u.u_scale;
    if (u.u_fit > 0.0) {
      var givenBoxSize = vec2f(u.u_worldWidth, u.u_worldHeight);
      givenBoxSize = max(givenBoxSize, vec2f(1.0)) * u.u_pixelRatio;
      var patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
      let patternBoxGivenSize = vec2f(
        select(givenBoxSize.x, u.u_resolution.x, u.u_worldWidth == 0.0),
        select(givenBoxSize.y, u.u_resolution.y, u.u_worldHeight == 0.0)
      );
      patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;
      let patternBoxNoFitBoxWidth = patternBoxRatio * min(patternBoxGivenSize.x / patternBoxRatio, patternBoxGivenSize.y);
      grain_uv /= (patternBoxNoFitBoxWidth / input.v_patternBoxSize.x);
    }
    let patternBoxScale = u.u_resolution.xy / input.v_patternBoxSize;
    grain_uv -= graphicOffset / patternBoxScale;
    grain_uv *= 1.6;
  }


  var shape: f32 = 0.0;

  if (u.u_shape < 1.5) {
    // Sine wave

    let wave = cos(0.5 * shape_uv.x - 4.0 * t) * sin(1.5 * shape_uv.x + 2.0 * t) * (0.75 + 0.25 * cos(6.0 * t));
    shape = 1.0 - smoothstep(-1.0, 1.0, shape_uv.y + wave);

  } else if (u.u_shape < 2.5) {
    // Grid (dots)

    let stripeIdx = floor(2.0 * shape_uv.x / TWO_PI);
    var rand = hash11(stripeIdx * 100.0);
    rand = sign(rand - 0.5) * pow(4.0 * abs(rand), 0.3);
    shape = sin(shape_uv.x) * cos(shape_uv.y - 5.0 * rand * t);
    shape = pow(abs(shape), 4.0);

  } else if (u.u_shape < 3.5) {
    // Truchet pattern

    var n2 = valueNoiseR(shape_uv * 0.4 - 3.75 * t);
    shape_uv = vec2f(shape_uv.x + 10.0, shape_uv.y);
    shape_uv *= 0.6;

    let tile = truchet(fract(shape_uv), randomR(floor(shape_uv)));

    let distance1 = length(tile);
    let distance2 = length(tile - vec2f(1.0));

    n2 -= 0.5;
    n2 *= 0.1;
    shape = smoothstep(0.2, 0.55, distance1 + n2) * (1.0 - smoothstep(0.45, 0.8, distance1 - n2));
    shape += smoothstep(0.2, 0.55, distance2 + n2) * (1.0 - smoothstep(0.45, 0.8, distance2 - n2));

    shape = pow(shape, 1.5);

  } else if (u.u_shape < 4.5) {
    // Corners

    shape_uv *= 0.6;
    let outer = vec2f(0.5);

    var bl = smoothstep(vec2f(0.0), outer, shape_uv + vec2f(0.1 + 0.1 * sin(3.0 * t), 0.2 - 0.1 * sin(5.25 * t)));
    var tr = smoothstep(vec2f(0.0), outer, vec2f(1.0) - shape_uv);
    shape = 1.0 - bl.x * bl.y * tr.x * tr.y;

    shape_uv = -shape_uv;
    bl = smoothstep(vec2f(0.0), outer, shape_uv + vec2f(0.1 + 0.1 * sin(3.0 * t), 0.2 - 0.1 * cos(5.25 * t)));
    tr = smoothstep(vec2f(0.0), outer, vec2f(1.0) - shape_uv);
    shape -= bl.x * bl.y * tr.x * tr.y;

    shape = 1.0 - smoothstep(0.0, 1.0, shape);

  } else if (u.u_shape < 5.5) {
    // Ripple

    shape_uv *= 2.0;
    let dist = length(0.4 * shape_uv);
    let waves = sin(pow(dist, 1.2) * 5.0 - 3.0 * t) * 0.5 + 0.5;
    shape = waves;

  } else if (u.u_shape < 6.5) {
    // Blob

    t *= 2.0;

    let f1_traj = 0.25 * vec2f(1.3 * sin(t), 0.2 + 1.3 * cos(0.6 * t + 4.0));
    let f2_traj = 0.2 * vec2f(1.2 * sin(-t), 1.3 * sin(1.6 * t));
    let f3_traj = 0.25 * vec2f(1.7 * cos(-0.6 * t), cos(-1.6 * t));
    let f4_traj = 0.3 * vec2f(1.4 * cos(0.8 * t), 1.2 * sin(-0.6 * t - 3.0));

    shape = 0.5 * pow(1.0 - clamp(length(shape_uv + f1_traj), 0.0, 1.0), 5.0);
    shape += 0.5 * pow(1.0 - clamp(length(shape_uv + f2_traj), 0.0, 1.0), 5.0);
    shape += 0.5 * pow(1.0 - clamp(length(shape_uv + f3_traj), 0.0, 1.0), 5.0);
    shape += 0.5 * pow(1.0 - clamp(length(shape_uv + f4_traj), 0.0, 1.0), 5.0);

    shape = smoothstep(0.0, 0.9, shape);
    let edge = smoothstep(0.25, 0.3, shape);
    shape = mix(0.0, shape, edge);

  } else {
    // Sphere

    shape_uv *= 2.0;
    let d = 1.0 - pow(length(shape_uv), 2.0);
    let pos = vec3f(shape_uv, sqrt(max(d, 0.0)));
    let lightPos = normalize(vec3f(cos(1.5 * t), 0.8, sin(1.25 * t)));
    shape = 0.5 + 0.5 * dot(lightPos, pos);
    shape *= step(0.0, d);
  }

  let baseNoise = snoise(grain_uv * 0.5);
  let fbmVals = fbmR(
    0.002 * grain_uv + vec2f(10.0),
    0.003 * grain_uv,
    0.001 * grain_uv,
    rotate(0.4 * grain_uv, 2.0)
  );
  let grainDist = baseNoise * snoise(grain_uv * 0.2) - fbmVals.x - fbmVals.y;
  let rawNoise = 0.75 * baseNoise - fbmVals.w - fbmVals.z;
  let noise = clamp(rawNoise, 0.0, 1.0);

  shape += u.u_intensity * 2.0 / u.u_colorsCount * (grainDist + 0.5);
  shape += u.u_noise * 10.0 / u.u_colorsCount * noise;

  let aa = fwidth(shape);

  shape = clamp(shape - 0.5 / u.u_colorsCount, 0.0, 1.0);
  let totalShape = smoothstep(0.0, u.u_softness + 2.0 * aa, clamp(shape * u.u_colorsCount, 0.0, 1.0));
  let mixer = shape * (u.u_colorsCount - 1.0);

  let cntStop = i32(u.u_colorsCount) - 1;
  var gradient = u.u_colors[0];
  gradient = vec4f(gradient.rgb * gradient.a, gradient.a);
  for (var i: i32 = 1; i < ${ grainGradientMeta.maxColorCount }; i++) {
    if (i > cntStop) { break; }

    var localT = clamp(mixer - f32(i - 1), 0.0, 1.0);
    localT = smoothstep(0.5 - 0.5 * u.u_softness - aa, 0.5 + 0.5 * u.u_softness + aa, localT);

    var c = u.u_colors[i];
    c = vec4f(c.rgb * c.a, c.a);
    gradient = mix(gradient, c, localT);
  }

  var color = gradient.rgb * totalShape;
  var opacity = gradient.a * totalShape;

  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u.u_colorBack.a * (1.0 - opacity);

  return vec4f(color, opacity);
}
`;

export interface GrainGradientUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_softness: number;
  u_intensity: number;
  u_noise: number;
  u_shape: (typeof GrainGradientShapes)[GrainGradientShape];
  u_noiseTexture?: HTMLImageElement;
}

export interface GrainGradientParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  softness?: number;
  intensity?: number;
  noise?: number;
  shape?: GrainGradientShape;
}

export const GrainGradientShapes = {
  wave: 1,
  dots: 2,
  truchet: 3,
  corners: 4,
  ripple: 5,
  blob: 6,
  sphere: 7,
};

export type GrainGradientShape = keyof typeof GrainGradientShapes;

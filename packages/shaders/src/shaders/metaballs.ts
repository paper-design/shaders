import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, textureRandomizerR, colorBandingFix } from '../shader-utils.js';

export const metaballsMeta = {
  maxColorCount: 8,
  maxBallsCount: 20,
} as const;

/**
 * Up to 20 colored gooey balls moving around the center and merging into smooth organic shapes.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colors (vec4[]): Up to 8 base colors in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_count (float): Number of balls (1 to 20)
 * - u_size (float): Size of the balls (0 to 1)
 * - u_noiseTexture (sampler2D): Pre-computed randomizer source texture
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_objectUV (vec2): Object box UV coordinates with global sizing (scale, rotation, offsets, etc) applied
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
export const metaballsFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorsCount: f32,
  u_size: f32,
  u_sizeRange: f32,
  u_count: f32,
  u_colorBack: vec4f,
  u_colors: array<vec4f, ${ metaballsMeta.maxColorCount }>,
}
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(1) @binding(0) var u_noiseTexture_tex: texture_2d<f32>;
@group(1) @binding(1) var u_noiseTexture_samp: sampler;

${vertexOutputStruct}

${ declarePI }
${ textureRandomizerR }

fn noise(x: f32) -> f32 {
  let i = floor(x);
  let f = fract(x);
  let u_val = f * f * (3.0 - 2.0 * f);
  let p0 = vec2f(i, 0.0);
  let p1 = vec2f(i + 1.0, 0.0);
  return mix(randomR(p0), randomR(p1), u_val);
}

fn getBallShape(uv: vec2f, c: vec2f, p: f32) -> f32 {
  var s = 0.5 * length(uv - c);
  s = 1.0 - clamp(s, 0.0, 1.0);
  s = pow(s, p);
  return s;
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  var shape_uv = input.v_objectUV;

  shape_uv += vec2f(0.5);

  let firstFrameOffset: f32 = 2503.4;
  let t = 0.2 * (u.u_time + firstFrameOffset);

  var totalColor = vec3f(0.0);
  var totalShape: f32 = 0.0;
  var totalOpacity: f32 = 0.0;

  for (var i: i32 = 0; i < ${ metaballsMeta.maxBallsCount }; i++) {
    if (i >= i32(ceil(u.u_count))) { break; }

    let idxFract = f32(i) / f32(${ metaballsMeta.maxBallsCount });
    let angle = TWO_PI * idxFract;

    let speed = 1.0 - 0.2 * idxFract;
    let noiseX = noise(angle * 10.0 + f32(i) + t * speed);
    let noiseY = noise(angle * 20.0 + f32(i) - t * speed);

    let pos = vec2f(0.5) + vec2f(1e-4) + 0.9 * (vec2f(noiseX, noiseY) - vec2f(0.5));

    let safeIndex = i % i32(u.u_colorsCount + 0.5);
    var ballColor = u.u_colors[safeIndex];
    ballColor = vec4f(ballColor.rgb * ballColor.a, ballColor.a);

    var sizeFrac: f32 = 1.0;
    if (f32(i) > floor(u.u_count - 1.0)) {
      sizeFrac *= fract(u.u_count);
    }

    var shape = getBallShape(shape_uv, pos, 45.0 - 30.0 * u.u_size * sizeFrac);
    shape *= pow(u.u_size, 0.2);
    shape = smoothstep(0.0, 1.0, shape);

    totalColor += ballColor.rgb * shape;
    totalShape += shape;
    totalOpacity += ballColor.a * shape;
  }

  totalColor /= max(totalShape, 1e-4);
  totalOpacity /= max(totalShape, 1e-4);

  let edge_width = fwidth(totalShape);
  let finalShape = smoothstep(0.4, 0.4 + edge_width, totalShape);

  var color = totalColor * finalShape;
  var opacity = totalOpacity * finalShape;

  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u.u_colorBack.a * (1.0 - opacity);

  ${ colorBandingFix }

  return vec4f(color, opacity);
}
`;

export interface MetaballsUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_count: number;
  u_size: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface MetaballsParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  count?: number;
  size?: number;
}

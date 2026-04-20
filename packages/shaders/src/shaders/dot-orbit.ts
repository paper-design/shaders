import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, rotation2, textureRandomizerR, textureRandomizerGB } from '../shader-utils.js';

export const dotOrbitMeta = {
  maxColorCount: 10,
} as const;

/**
 * Animated multi-color dots pattern with each dot orbiting around its cell center.
 * Supports up to 10 colors and various shape and motion controls.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colors (vec4[]): Up to 10 base colors in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_stepsPerColor (float): Number of extra colors between base colors, 1 = N colors, 2 = 2×N, etc. (1 to 4)
 * - u_size (float): Dot radius relative to cell size (0 to 1)
 * - u_sizeRange (float): Random variation in shape size, 0 = uniform, higher = random up to base size (0 to 1)
 * - u_spreading (float): Maximum orbit distance around cell center (0 to 1)
 * - u_noiseTexture (sampler2D): Pre-computed randomizer source texture
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_patternUV (vec2): UV coordinates in pixels (scaled by 0.01 for precision), with rotation and offset applied
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

export const dotOrbitFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorsCount: f32,
  u_stepsPerColor: f32,
  u_size: f32,
  u_sizeRange: f32,
  u_spreading: f32,
  u_colorBack: vec4f,
  u_colors: array<vec4f, ${ dotOrbitMeta.maxColorCount }>,
}
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(1) @binding(0) var u_noiseTexture_tex: texture_2d<f32>;
@group(1) @binding(1) var u_noiseTexture_samp: sampler;

${vertexOutputStruct}

${ declarePI }
${ rotation2 }
${ textureRandomizerR }
${ textureRandomizerGB }

fn voronoiShape(uv: vec2f, time: f32) -> vec3f {
  let i_uv = floor(uv);
  let f_uv = fract(uv);

  let spreading = 0.25 * clamp(u.u_spreading, 0.0, 1.0);

  var minDist: f32 = 1.0;
  var randomizer = vec2f(0.0);
  for (var y: i32 = -1; y <= 1; y++) {
    for (var x: i32 = -1; x <= 1; x++) {
      let tileOffset = vec2f(f32(x), f32(y));
      let rand = randomGB(i_uv + tileOffset);
      var cellCenter = vec2f(0.5 + 1e-4);
      cellCenter += spreading * cos(vec2f(time) + TWO_PI * rand);
      cellCenter -= vec2f(0.5);
      cellCenter = rotate(cellCenter, randomR(vec2f(rand.x, rand.y)) + 0.1 * time);
      cellCenter += vec2f(0.5);
      let dist = length(tileOffset + cellCenter - f_uv);
      if (dist < minDist) {
        minDist = dist;
        randomizer = rand;
      }
    }
  }

  return vec3f(minDist, randomizer);
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {

  var shape_uv = input.v_patternUV;
  shape_uv *= 1.5;

  let firstFrameOffset: f32 = -10.0;
  let t = u.u_time + firstFrameOffset;

  let voronoi = voronoiShape(shape_uv, t) + vec3f(1e-4);

  let radius = 0.25 * clamp(u.u_size, 0.0, 1.0) - 0.5 * clamp(u.u_sizeRange, 0.0, 1.0) * voronoi[2];
  let dist = voronoi[0];
  let edgeWidth = fwidth(dist);
  let dots = 1.0 - smoothstep(radius - edgeWidth, radius + edgeWidth, dist);

  let shape = voronoi[1];

  var mixer = shape * (u.u_colorsCount - 1.0);
  mixer = (shape - 0.5 / u.u_colorsCount) * u.u_colorsCount;
  let steps = max(1.0, u.u_stepsPerColor);

  var gradient = u.u_colors[0];
  gradient = vec4f(gradient.rgb * gradient.a, gradient.a);
  for (var i: i32 = 1; i < ${ dotOrbitMeta.maxColorCount }; i++) {
    if (i >= i32(u.u_colorsCount)) { break; }
    var localT = clamp(mixer - f32(i - 1), 0.0, 1.0);
    localT = round(localT * steps) / steps;
    var c = u.u_colors[i];
    c = vec4f(c.rgb * c.a, c.a);
    gradient = mix(gradient, c, localT);
  }

  if ((mixer < 0.0) || (mixer > (u.u_colorsCount - 1.0))) {
    var localT2 = mixer + 1.0;
    if (mixer > (u.u_colorsCount - 1.0)) {
      localT2 = mixer - (u.u_colorsCount - 1.0);
    }
    localT2 = round(localT2 * steps) / steps;
    var cFst = u.u_colors[0];
    cFst = vec4f(cFst.rgb * cFst.a, cFst.a);
    var cLast = u.u_colors[i32(u.u_colorsCount - 1.0)];
    cLast = vec4f(cLast.rgb * cLast.a, cLast.a);
    gradient = mix(cLast, cFst, localT2);
  }

  let color_dot = gradient.rgb * dots;
  var opacity = gradient.a * dots;

  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
  var color = color_dot + bgColor * (1.0 - opacity);
  opacity = opacity + u.u_colorBack.a * (1.0 - opacity);

  return vec4f(color, opacity);
}
`;

export interface DotOrbitUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_size: number;
  u_sizeRange: number;
  u_spreading: number;
  u_stepsPerColor: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface DotOrbitParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colors?: string[];
  size?: number;
  sizeRange?: number;
  spreading?: number;
  stepsPerColor?: number;
}

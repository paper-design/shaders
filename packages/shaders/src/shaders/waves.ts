import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI } from '../shader-utils.js';

/**
 * Static line pattern configurable into textures ranging from sharp zigzags to smooth flowing waves.
 *
 * Fragment shader uniforms:
 * - u_colorFront (vec4): Foreground color in RGBA
 * - u_colorBack (vec4): Background color in RGBA
 * - u_shape (float): Line shape, 0 = zigzag, 1 = sine, 2-3 = irregular waves, fractional values morph between shapes (0 to 3)
 * - u_amplitude (float): Wave amplitude (0 to 1)
 * - u_frequency (float): Wave frequency (0 to 2)
 * - u_spacing (float): Space between every two wavy lines (0 to 2)
 * - u_proportion (float): Blend point between front and back colors, 0.5 = equal distribution (0 to 1)
 * - u_softness (float): Color transition sharpness, 0 = hard edge, 1 = smooth gradient (0 to 1)
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

export const wavesFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorFront: vec4f,
  u_colorBack: vec4f,
  u_shape: f32,
  u_frequency: f32,
  u_amplitude: f32,
  u_spacing: f32,
  u_proportion: f32,
  u_softness: f32,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

${declarePI}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  var shape_uv = input.v_patternUV;
  shape_uv *= 4.0;

  let wave = 0.5 * cos(shape_uv.x * u.u_frequency * TWO_PI);
  let zigzag = 2.0 * abs(fract(shape_uv.x * u.u_frequency) - 0.5);
  let irregular = sin(shape_uv.x * 0.25 * u.u_frequency * TWO_PI) * cos(shape_uv.x * u.u_frequency * TWO_PI);
  let irregular2 = 0.75 * (sin(shape_uv.x * u.u_frequency * TWO_PI) + 0.5 * cos(shape_uv.x * 0.5 * u.u_frequency * TWO_PI));

  var offset = mix(zigzag, wave, smoothstep(0.0, 1.0, u.u_shape));
  offset = mix(offset, irregular, smoothstep(1.0, 2.0, u.u_shape));
  offset = mix(offset, irregular2, smoothstep(2.0, 3.0, u.u_shape));
  offset *= 2.0 * u.u_amplitude;

  let spacing = (0.001 + u.u_spacing);
  let shape = 0.5 + 0.5 * sin((shape_uv.y + offset) * PI / spacing);

  let aa = 0.0001 + fwidth(shape);
  let dc = 1.0 - clamp(u.u_proportion, 0.0, 1.0);
  let e0 = dc - u.u_softness - aa;
  let e1 = dc + u.u_softness + aa;
  let res = smoothstep(min(e0, e1), max(e0, e1), shape);

  let fgColor = u.u_colorFront.rgb * u.u_colorFront.a;
  let fgOpacity = u.u_colorFront.a;
  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
  let bgOpacity = u.u_colorBack.a;

  var color = fgColor * res;
  var opacity = fgOpacity * res;

  color += bgColor * (1.0 - opacity);
  opacity += bgOpacity * (1.0 - opacity);

  return vec4f(color, opacity);
}
`;

export interface WavesUniforms extends ShaderSizingUniforms {
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_shape: number;
  u_frequency: number;
  u_amplitude: number;
  u_spacing: number;
  u_proportion: number;
  u_softness: number;
}

export interface WavesParams extends ShaderSizingParams {
  colorFront?: string;
  colorBack?: string;
  rotation?: number;
  shape?: number;
  frequency?: number;
  amplitude?: number;
  spacing?: number;
  proportion?: number;
  softness?: number;
}

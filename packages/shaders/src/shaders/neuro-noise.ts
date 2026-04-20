import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, rotation2, colorBandingFix } from '../shader-utils.js';

/**
 * A glowing, web-like structure of fluid lines and soft intersections.
 * Great for creating atmospheric, organic-yet-futuristic visuals.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_colorFront (vec4): Graphics highlight color in RGBA
 * - u_colorMid (vec4): Graphics main color in RGBA
 * - u_colorBack (vec4): Background color in RGBA
 * - u_brightness (float): Luminosity of the crossing points (0 to 1)
 * - u_contrast (float): Sharpness of the bright-dark transition (0 to 1)
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
 * Original algorithm: https://x.com/zozuar/status/1625182758745128981/
 */

export const neuroNoiseFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_brightness: f32,
  u_contrast: f32,
  u_colorFront: vec4f,
  u_colorMid: vec4f,
  u_colorBack: vec4f,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

${ rotation2 }

fn neuroShape(uv_in: vec2f, t: f32) -> f32 {
  var uv = uv_in;
  var sine_acc = vec2f(0.0);
  var res = vec2f(0.0);
  var scale: f32 = 8.0;

  for (var j: i32 = 0; j < 15; j++) {
    uv = rotate(uv, 1.0);
    sine_acc = rotate(sine_acc, 1.0);
    let layer = uv * scale + vec2f(f32(j)) + sine_acc - vec2f(t);
    sine_acc += sin(layer);
    res += (vec2f(0.5) + 0.5 * cos(layer)) / scale;
    scale *= 1.2;
  }
  return res.x + res.y;
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  var shape_uv = input.v_patternUV;
  shape_uv *= 0.13;

  let t = 0.5 * u.u_time;

  var noise_val = neuroShape(shape_uv, t);

  noise_val = (1.0 + u.u_brightness) * noise_val * noise_val;
  noise_val = pow(noise_val, 0.7 + 6.0 * u.u_contrast);
  noise_val = min(1.4, noise_val);

  let blend = smoothstep(0.7, 1.4, noise_val);

  var frontC = u.u_colorFront;
  frontC = vec4f(frontC.rgb * frontC.a, frontC.a);
  var midC = u.u_colorMid;
  midC = vec4f(midC.rgb * midC.a, midC.a);
  let blendFront = mix(midC, frontC, blend);

  let safeNoise = max(noise_val, 0.0);
  var color = blendFront.rgb * safeNoise;
  var opacity = clamp(blendFront.a * safeNoise, 0.0, 1.0);

  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u.u_colorBack.a * (1.0 - opacity);

  ${ colorBandingFix }

  return vec4f(color, opacity);
}
`;

export interface NeuroNoiseUniforms extends ShaderSizingUniforms {
  u_colorFront: [number, number, number, number];
  u_colorMid: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_brightness: number;
  u_contrast: number;
}

export interface NeuroNoiseParams extends ShaderSizingParams, ShaderMotionParams {
  colorFront?: string;
  colorMid?: string;
  colorBack?: string;
  brightness?: number;
  contrast?: number;
}

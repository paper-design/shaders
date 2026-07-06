import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, simplexNoise, glslMod, declarePI, colorBandingFix } from '../shader-utils.js';

/**
 * A single-colored animated spiral that morphs across a wide range of shapes -
 * from crisp, thin-lined geometry to flowing whirlpool forms and wavy, abstract rings.
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
 * Vertex shader outputs (used in fragment shader):
 * - v_patternUV (vec2): UV coordinates in pixels (scaled by 0.01 for precision), with rotation and offset applied
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colorFront (vec4): Foreground (ink) color in RGBA
 * - u_density (float): Spacing falloff simulating perspective, 0 = flat spiral (0 to 1)
 * - u_distortion (float): Power of shape distortion applied along the spiral (0 to 1)
 * - u_strokeWidth (float): Thickness of spiral curve (0 to 1)
 * - u_strokeTaper (float): How much stroke loses width away from center, 0 = full visibility (0 to 1)
 * - u_strokeCap (float): Extra stroke width at the center, no effect with strokeWidth = 0.5 (0 to 1)
 * - u_noise (float): Noise distortion applied over the canvas, no effect with noiseFrequency = 0 (0 to 1)
 * - u_noiseFrequency (float): Noise frequency, no effect with noise = 0 (0 to 1)
 * - u_softness (float): Color transition sharpness, 0 = hard edge, 1 = smooth gradient (0 to 1)
 *
 */

// language=WGSL
export const spiralFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorBack: vec4f,
  u_colorFront: vec4f,
  u_density: f32,
  u_distortion: f32,
  u_strokeWidth: f32,
  u_strokeCap: f32,
  u_strokeTaper: f32,
  u_noise: f32,
  u_noiseFrequency: f32,
  u_softness: f32,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

${declarePI}
${glslMod}
${simplexNoise}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let uv = 2.0 * input.v_patternUV;

  let t = u.u_time;
  var l = length(uv);
  let density = clamp(u.u_density, 0.0, 1.0);
  l = pow(max(l, 1e-6), density);
  let angle = atan2(uv.y, uv.x) - t;
  var angleNormalised = angle / TWO_PI;

  angleNormalised += 0.125 * u.u_noise * snoise(16.0 * pow(u.u_noiseFrequency, 3.0) * uv);

  var offset = l + angleNormalised;
  offset -= u.u_distortion * (sin(4.0 * l - 0.5 * t) * cos(PI + l + 0.5 * t));
  let stripe = fract(offset);

  let shape = 2.0 * abs(stripe - 0.5);
  var width = 1.0 - clamp(u.u_strokeWidth, 0.005 * u.u_strokeTaper, 1.0);

  let wCap = mix(width, (1.0 - stripe) * (1.0 - step(0.5, stripe)), (1.0 - clamp(l, 0.0, 1.0)));
  width = mix(width, wCap, u.u_strokeCap);
  width *= (1.0 - clamp(u.u_strokeTaper, 0.0, 1.0) * l);

  let fw = fwidth(offset);
  let fwMult = 4.0 - 3.0 * (smoothstep(0.05, 0.4, 2.0 * u.u_strokeWidth) * smoothstep(0.05, 0.4, 2.0 * (1.0 - u.u_strokeWidth)));
  var pixelSize = mix(fwMult * fw, fwidth(shape), clamp(fw, 0.0, 1.0));
  pixelSize = mix(pixelSize, 0.002, u.u_strokeCap * (1.0 - clamp(l, 0.0, 1.0)));

  let res = smoothstep(width - pixelSize - u.u_softness, width + pixelSize + u.u_softness, shape);

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

export interface SpiralUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colorFront: [number, number, number, number];
  u_density: number;
  u_distortion: number;
  u_strokeWidth: number;
  u_strokeTaper: number;
  u_strokeCap: number;
  u_noise: number;
  u_noiseFrequency: number;
  u_softness: number;
}

export interface SpiralParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colorFront?: string;
  density?: number;
  distortion?: number;
  strokeWidth?: number;
  strokeTaper?: number;
  strokeCap?: number;
  noise?: number;
  noiseFrequency?: number;
  softness?: number;
}

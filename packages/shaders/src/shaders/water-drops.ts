import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declarePI, declareRotate, colorBandingFix } from '../shader-utils';

/**

 */
export const waterDropsFragmentShader: string = `#version 300 es
precision highp float;

uniform sampler2D u_noiseTexture;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform vec4 u_colorBack;
uniform float u_brightness;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}

vec2 rand2(vec2 c) {
  mat2 m = mat2(12.9898, .16180, 78.233, .31415);
  return fract(sin(m * c) * vec2(43758.5453, 14142.1));
}

vec2 noise(vec2 p) {
  vec2 co = floor(p);
  vec2 mu = fract(p);
  mu = 3. * mu * mu - 2. * mu * mu * mu;
  vec2 a = rand2((co + vec2(0., 0.)));
  vec2 b = rand2((co + vec2(1., 0.)));
  vec2 c = rand2((co + vec2(0., 1.)));
  vec2 d = rand2((co + vec2(1., 1.)));
  return mix(mix(a, b, mu.x), mix(c, d, mu.x), mu.y);
}

void main() {
  vec2 shape_uv = v_patternUV;
  shape_uv *= .002;

  float t = .5 * u_time;

  float grid_scale = 23.;

  vec2 dropShapeDistortion = noise(shape_uv * grid_scale * 2.5);

  vec3 color = u_colorBack.rgb;
  float opacity = 1.;

  vec3 light_dir = normalize(vec3(.5, .5, -.7));

  vec2 grid_pos = TWO_PI * shape_uv * grid_scale + dropShapeDistortion;

  grid_pos -= light_dir.xy;
  vec2 s = sin(grid_pos);
  float shape = (s.x + s.y);

  grid_pos += light_dir.xy;
  s = sin(grid_pos);
  float shapeShifted = (s.x + s.y);

  vec2 uvRounded = floor(shape_uv * grid_scale + .25) / grid_scale;

  vec4 noise_detail = vec4(noise(uvRounded * 200.), noise(uvRounded));

  float shapeSaved = shape;
  float dropLife = max(0., 1. - 2. * fract(t * (noise_detail.b + .5) + noise_detail.g));
  shape *= dropLife;
  shapeShifted *= dropLife;

  float showCell = step(noise_detail.r, .2);
  vec3 shadowColor = vec3(0.);
  float shadowOpacity = .3;
  float edge = shadowOpacity * smoothstep(.3, .7, shapeShifted);
  vec3 shadow = mix(color, shadowColor, edge);

  float dropInner = showCell * step(.4, shape);

  color = mix(color, shadow, showCell * (1. - dropInner));

  vec3 normal = normalize(-vec3(cos(grid_pos), shape));

  float diffuse = clamp(dot(normal, light_dir), .0, 1.);
  float specular = smoothstep(.95, .96, dot(normal, light_dir));

  vec2 texUv = shape_uv + .5;
  texUv.y = 1. - texUv.y;
  vec3 test = texture(u_noiseTexture, texUv - normal.xy * .3).rgb;

  color = mix(color, vec3(1.) * diffuse, .7 * smoothstep(.7, .2, shape) * dropInner);
  color = mix(color, test, .4 * smoothstep(2., .0, shapeSaved) * dropInner);
  color = mix(color, vec3(1.), specular * dropInner);

  fragColor = vec4(color, opacity);
}

`;

export interface WaterDropsUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_brightness: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface WaterDropsParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  brightness?: number;
}

import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing';
import { declarePI, declareRotate, declareSimplexNoise, colorBandingFix } from '../shader-utils';

export const liquidMetalMeta = {
  maxColorCount: 10,
} as const;

/**
 */

export const liquidMetalFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_patternBlur;
uniform float u_patternScale;
uniform float u_dispersion;
uniform float u_edge;
uniform float u_liquid;
uniform float u_shape;

${sizingVariablesDeclaration}
in vec2 v_normalizedUV;

out vec4 fragColor;

${declarePI}
${declareRotate}
${declareSimplexNoise}

float get_color_channel(float c1, float c2, float stripe_p, vec3 w, float extra_blur, float bump) {

  float ch = c2;
  float border = 0.;
  float blur = u_patternBlur + extra_blur;

  ch = mix(ch, c1, smoothstep(.0, blur, stripe_p));

  border = w[0];
  ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));

  bump = smoothstep(.2, .8, bump);
  border = w[0] + .4 * (1. - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));

  border = w[0] + .5 * (1. - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));

  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));

  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border - blur, border + blur, stripe_p));

  return ch;
}

float get_border_map(vec2 uv_normalised) {
  vec2 outer = vec2(.3);

  vec2 bl = smoothstep(vec2(0.), outer, uv_normalised);
  vec2 tr = smoothstep(vec2(0.), outer, 1. - uv_normalised);

  bl = pow(bl, vec2(.04));
  tr = pow(tr, vec2(.04));
  float s = 1. - bl.x * bl.y * tr.x * tr.y;
  s = smoothstep(0., .3, s);
  return s;
}


void main() {
  
  float t = .25 * u_time;

  vec2 shape_uv = v_objectUV;
  if (u_shape < 2.) {
    shape_uv = v_normalizedUV;
  }
  shape_uv += .5;
  shape_uv.y = 1. - shape_uv.y;

  float cycleWidth = .5 * u_patternScale;
  if (u_shape < 2.) {
    float ratio = u_resolution.x / u_resolution.y;
    if (ratio > 1.) {
      shape_uv.y /= ratio;
      cycleWidth *= 2.;
    } else {
      shape_uv.x *= ratio;
    }
  }
 
  
  float mask = 1.;
  if (u_shape < 1.) {  
    mask = get_border_map(v_normalizedUV + .5);
  } else if (u_shape < 2.) {  
    shape_uv *= 5.;
    float wave = cos(1.5 * shape_uv.x - 2. * t) * sin(.8 * shape_uv.x + t) * (.75 + .25 * cos(-3. * t));
    mask = smoothstep(.2, .6, shape_uv.y - 1.1 + wave);
    mask += .5 * smoothstep(-.4, .6, shape_uv.y - 1.1 + wave);
    shape_uv /= 4.;
  } else if (u_shape < 3.) {  
    mask = pow(clamp(2. * length(shape_uv - .5), 0., 1.), 8.);
  } else if (u_shape < 4.) {
    shape_uv -= .5;
    shape_uv *= 1.3;
    float a = atan(shape_uv.y, shape_uv.x);
    mask = pow(clamp(1.7 * length(shape_uv) + .2 * sin(2. * a + t) - .1 * sin(5. * a - 2. * t) + .15 * sin(3. * a - .5 * t), 0., 1.), 8.);
    shape_uv += .5;
    shape_uv.y += .6;
    shape_uv *= .7;
  }

  float contour = smoothstep(0., 1., mask) * smoothstep(1., 0., mask);


  float diagBLtoTR = shape_uv.x - shape_uv.y;    
  float diagTLtoBR = shape_uv.x + shape_uv.y;

  vec3 color = vec3(0.);
  float opacity = 1.;

  vec3 color1 = vec3(.98, 0.98, 1.);
  vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, diagTLtoBR));

  vec2 grad_uv = shape_uv - .5;
  
  float dist = length(grad_uv + vec2(0., .2 * diagBLtoTR));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagBLtoTR) * PI);
  float direction = grad_uv.x;

  float bump = pow(1.8 * dist, 1.2);
  bump = 1. - bump;
  bump *= pow(shape_uv.y, .3);


  float thin_strip_1_ratio = .12 / cycleWidth * (1. - .4 * bump);
  float thin_strip_2_ratio = .07 / cycleWidth * (1. + .4 * bump);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycleWidth * thin_strip_1_ratio;
  float thin_strip_2_width = cycleWidth * thin_strip_2_ratio;

  opacity = 1. - smoothstep(.9 - .5 * u_edge, .92 - .5 * u_edge, mask);

  float noise = snoise(shape_uv - t);

  mask += (1. - mask) * u_liquid * noise;

  float colorDispersion = 0.;
  colorDispersion += (1. - 2. * bump);
  colorDispersion = clamp(colorDispersion, 0., 1.);

  direction += diagBLtoTR;

  direction -= 2. * noise * contour;
  direction -= 2. * contour;

  // bump *= clamp(pow(shape_uv.y, .1), .3, 1.);
  // direction *= (.1 + (1.1 - mask) * bump);
  direction *= smoothstep(1., .2, mask);

  float ridge = .18 * (smoothstep(.1, .2, shape_uv.y) * smoothstep(.4, .2, shape_uv.y));
  ridge += .03 * (smoothstep(.1, .2, 1. - shape_uv.y) * smoothstep(.4, .2, 1. - shape_uv.y));
  direction += ridge;

  direction *= (.5 + .5 * pow(shape_uv.y, 2.));

  direction *= cycleWidth;

  direction -= t;

  float dispersionRed = colorDispersion;
  dispersionRed += .03 * bump * noise;
  float dispersionBlue = 1.3 * colorDispersion;

  dispersionRed += 5. * (smoothstep(-.1, .2, shape_uv.y) * smoothstep(.5, .1, shape_uv.y)) * (smoothstep(.4, .6, bump) * smoothstep(1., .4, bump));
  dispersionRed -= diagBLtoTR;

  dispersionBlue += (smoothstep(0., .4, shape_uv.y) * smoothstep(.8, .1, shape_uv.y)) * (smoothstep(.4, .6, bump) * smoothstep(.8, .4, bump));
  dispersionBlue -= .2 * mask;

  dispersionRed *= u_dispersion;
  dispersionBlue *= u_dispersion;

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., mask + bump);
  float extraBlur = bump + .2 * contour;
  float stripe_r = mod(direction + dispersionRed, 1.);
  float r = get_color_channel(color1.r, color2.r, stripe_r, w, 0.02 + .03 * u_dispersion * bump, extraBlur);
  float stripe_g = mod(direction, 1.);
  float g = get_color_channel(color1.g, color2.g, stripe_g, w, 0.01 / (1. - diagBLtoTR), extraBlur);
  float stripe_b = mod(direction - dispersionBlue, 1.);
  float b = get_color_channel(color1.b, color2.b, stripe_b, w, .01, extraBlur);

  color = vec3(r, g, b);

  ${colorBandingFix}

  color *= opacity;

  fragColor = vec4(color, opacity);  
  // fragColor = vec4(vec3(mask), 1.);
  // fragColor = vec4(vec3(v_normalizedUV, 0.), 1.);
}
`;

export interface LiquidMetalUniforms extends ShaderSizingUniforms {
  u_patternBlur: number;
  u_patternScale: number;
  u_dispersion: number;
  u_edge: number;
  u_liquid: number;
  u_shape: number;
}

export interface LiquidMetalParams extends ShaderSizingParams, ShaderMotionParams {
  patternBlur?: number;
  patternScale?: number;
  dispersion?: number;
  edge?: number;
  liquid?: number;
  shape?: number;
}

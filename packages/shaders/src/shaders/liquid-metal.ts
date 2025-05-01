import type { vec4 } from '../types';
import type { ShaderMotionParams } from '../shader-mount';
import {
  sizingVariablesDeclaration,
  worldBoxTestStroke,
  sizingDebugVariablesDeclaration,
  sizingUniformsDeclaration,
  viewPortTestOriginPoint,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from '../shader-sizing';
import { declarePI, declareRotate, declareSimplexNoise, colorBandingFix } from '../shader-utils';

/**
 */

export const liquidMetalFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform float u_patternBlur;
uniform float u_patternScale;
uniform float u_dispersion;
uniform float u_liquid;
uniform float u_shape;


${sizingUniformsDeclaration}
${sizingVariablesDeclaration}
${sizingDebugVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${declareRotate}
${declareSimplexNoise}

float get_color_channel(float c1, float c2, float stripe_p, vec3 w, float extra_blur, float bump) {

  float ch = c2;
  float border = 0.;
  float blur = u_patternBlur + extra_blur;
  
  if (u_shape < 1.) {
    blur += .1 * smoothstep(-.4, -.6, v_screenSizeUV.y);
  }

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

void main() {
  
  float t = .1 * u_time;

  vec2 shape_uv = v_objectUV;
  if (u_shape < 1.) {
    shape_uv = v_screenSizeUV;
  }
  shape_uv += .5;
  shape_uv.y = 1. - shape_uv.y;

  float cycleWidth = .5 * u_patternScale; 
  
  float mask = 1.;
  if (u_shape < 1.) {
  
    float ratio = u_resolution.x / u_resolution.y;
    vec2 edge = min(shape_uv, 1. - shape_uv);
    vec2 pixel_thickness = vec2(350.0) / (u_resolution * u_pixelRatio);
    float maskX = smoothstep(0.0, pixel_thickness.x, edge.x);
    float maskY = smoothstep(0.0, pixel_thickness.y, edge.y);
    maskX = pow(maskX, .25);
    maskY = pow(maskY, .25);
    mask = clamp(1. - maskX * maskY, 0., 1.);
    if (ratio > 1.) {
      shape_uv.y /= ratio;
    } else {
      shape_uv.x *= ratio;
    }
    cycleWidth *= (.7 + ratio);
    shape_uv *= 1.2;
  } else if (u_shape < 2.) {  
    mask = pow(clamp(3. * length(shape_uv - .5), 0., 1.), 8.);
    shape_uv *= 1.4;
  } else if (u_shape < 3.) {
  
    shape_uv -= .5;
    shape_uv *= 2.;
    
    float r = length(shape_uv) * 2.;
    float a = atan(shape_uv.y, shape_uv.x) + .2;
    r *= (1. + .05 * sin(3. * a + 2. * t));
    float f = abs(cos(a * 3.));
    mask = smoothstep(f, f + .7, r);
    shape_uv *= .7;
    shape_uv += .5;
    shape_uv.y += .2;
    
  } else if (u_shape < 4.) {
    shape_uv -= .5;
    mask = 0.;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float speed = 4.5 + 2. * sin(fi * 12.345);
      float angle = -fi * 1.5;
      vec2 dir1 = vec2(cos(angle), sin(angle));
      vec2 dir2 = vec2(cos(angle + 1.57), sin(angle + 1.));
      vec2 traj = .4 * (dir1 * sin(t * speed + fi * 1.23) + dir2 * cos(t * (speed * 0.7) + fi * 2.17));
      float d = length(shape_uv + traj);
      mask += pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
    }
    
    mask = 1. - smoothstep(.85, 1., mask);
    shape_uv += .5;
    shape_uv *= 1.15;
    shape_uv.y += .2;
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

  opacity = 1. - smoothstep(.9, .92, mask);

  float noise = snoise(shape_uv - t);

  mask += (1. - mask) * u_liquid * noise;

  float colorDispersion = 0.;
  colorDispersion += (1. - bump);
  colorDispersion = clamp(colorDispersion, 0., 1.);

  direction += diagBLtoTR;

  direction -= 2. * noise * contour;

  bump *= clamp(pow(shape_uv.y, .1), .3, 1.);
  direction *= (.1 + (1.1 - mask) * bump);
  direction *= smoothstep(1., .7, mask);

  float ridge = .2 * (smoothstep(.0, .15, shape_uv.y) * smoothstep(.4, .15, shape_uv.y));
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
  float extraBlur = bump;
  float stripe_r = mod(direction + dispersionRed, 1.);
  float r = get_color_channel(color1.r, color2.r, stripe_r, w, 0.02 + .03 * u_dispersion * bump, extraBlur);
  float stripe_g = mod(direction, 1.);
  float g = get_color_channel(color1.g, color2.g, stripe_g, w, 0.01 / (1. - 0. * diagBLtoTR), extraBlur);
  float stripe_b = mod(direction - dispersionBlue, 1.);
  float b = get_color_channel(color1.b, color2.b, stripe_b, w, .01, extraBlur);

  color = vec3(r, g, b);

  ${colorBandingFix}
  
  ${worldBoxTestStroke}
  color = mix(color, vec3(1., 0., 0.), worldBoxTestStroke);
  opacity += worldBoxTestStroke;

  ${viewPortTestOriginPoint}
  color = mix(color, vec3(0., 1., 0.), viewPortTestOriginPoint);
  color = mix(color, vec3(0., 0., 1.), worldTestOriginPoint);
  opacity += viewPortTestOriginPoint;
  opacity += worldTestOriginPoint;
  
  color *= opacity;

  fragColor = vec4(color, opacity);
}
`;

export interface LiquidMetalUniforms extends ShaderSizingUniforms {
  u_patternBlur: number;
  u_patternScale: number;
  u_dispersion: number;
  u_liquid: number;
  u_shape: number;
}

export interface LiquidMetalParams extends ShaderSizingParams, ShaderMotionParams {
  patternBlur?: number;
  patternScale?: number;
  dispersion?: number;
  liquid?: number;
  shape?: number;
}

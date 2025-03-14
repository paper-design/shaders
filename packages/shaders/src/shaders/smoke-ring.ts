export type SmokeRingUniforms = {
  u_scale: number;
  u_colorBack: [number, number, number, number];
  u_colorInner: [number, number, number, number];
  u_colorOuter: [number, number, number, number];
  u_noiseScale: number;
  u_thickness: number;
};

/**
 * Smoke Ring by Ksenia Kondrashova
 * Renders a fractional Brownian motion (fBm) noise over the
 * polar coordinates masked with ring shape
 *
 * Uniforms include:
 * u_scale - the scale applied to user space: with scale = 1 the ring fits the screen height
 * u_colorBack - the background color of the scene
 * u_colorInner - the inner color of the ring gradient
 * u_colorOuter - the outer color of the ring gradient
 * u_noiseScale - the resolution of noise texture
 * u_thickness - the thickness of the ring
 */

export const smokeRingFragmentShader = `#version 300 es
precision highp float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_time;

uniform float u_scale;

uniform vec4 u_colorBack;
uniform vec4 u_colorInner;
uniform vec4 u_colorOuter;
uniform float u_noiseScale;
uniform float u_thickness;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

float random(in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  // Smoothstep for interpolation
  vec2 u = f * f * (3.0 - 2.0 * f);

  // Do the interpolation as two nested mix operations
  // If you try to do this in one big operation, there's enough precision loss to be off by 1px at cell boundaries
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);

}
float fbm(in vec2 n) {
  float total = 0.0, amplitude = .4;
  for (int i = 0; i < 12; i++) {
    total += noise(n) * amplitude;
    n += n;
    amplitude *= 0.6;
  }
  return total;
}

float get_ring_shape(vec2 uv, float innerRadius, float outerRadius) {
  float distance = length(uv);
  float line_width = outerRadius - innerRadius;
  float ringValue = smoothstep(innerRadius, innerRadius + .8 * line_width, distance);
  ringValue -= smoothstep(outerRadius, outerRadius + 1.2 * line_width, distance);
  return clamp(ringValue, 0., 1.);
}

void main() {

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;
  float worldRatio = u_worldWidth / u_worldHeight;

  uv -= .5;
  
  uv.x *= u_resolution.x;
  uv.y *= u_resolution.y;
  
  uv /= u_pixelRatio;
  
  uv.x /= u_worldWidth;
  uv.y /= u_worldHeight;
  
   
  vec2 world = vec2(u_worldWidth, u_worldHeight) * u_pixelRatio;
  
  if (world.x > u_resolution.x || world.y > u_resolution.y) {
    if (u_fit == 0.) {
      float scaleFactor = min(u_resolution.x / world.x, u_resolution.y / world.y);
      uv /= scaleFactor;
    }
  }

  vec2 box_uv = uv;

  if (u_fit == 0.) {
    if (worldRatio > 1.) {
        uv.x *= worldRatio;
    } else {
        uv.y /= worldRatio;
    }
  } else if (u_fit == 1.) {
    if (worldRatio > 1.) {
        uv.y /= worldRatio;
    } else {
        uv.x *= worldRatio;
    }
  }
 


  float t = u_time;

  float atg = atan(uv.y, uv.x);
  float angle = (atg + PI) / TWO_PI;

  vec2 polar_uv = vec2(atg, .1 * t - (.5 * length(uv)) + 1. / pow(length(uv), .5));
  polar_uv *= u_noiseScale;

  float noise_left = fbm(polar_uv + .05 * t);
  polar_uv.x = mod(polar_uv.x, u_noiseScale * TWO_PI);
  float noise_right = fbm(polar_uv + .05 * t);
  float noise = mix(noise_right, noise_left, smoothstep(-.2, .2, uv.x));

  float center_shape = 1. - pow(smoothstep(2., .0, length(uv)), 50.);

  float radius = .29 - .25 * u_thickness;
  float thickness = u_thickness;
  thickness = pow(thickness, 2.);

  float ring_shape = get_ring_shape(uv * (.5 + .6 * noise), radius - .2 * thickness, radius + .5 * thickness);

  float ring_shape_outer = 1. - pow(ring_shape, 7.);
  ring_shape_outer *= ring_shape;

  float ring_shape_inner = ring_shape - ring_shape_outer;
  ring_shape_inner *= ring_shape;

  float background = u_colorBack.a;

  float opacity = ring_shape_outer * u_colorOuter.a;
  opacity += ring_shape_inner * u_colorInner.a;
  opacity += background * (1. - ring_shape_inner * u_colorInner.a - ring_shape_outer * u_colorOuter.a);

  vec3 color = u_colorBack.rgb * (1. - ring_shape) * background;
  color += u_colorOuter.rgb * ring_shape_outer * u_colorOuter.a;
  color += u_colorInner.rgb * ring_shape_inner * u_colorInner.a;

  color += u_colorBack.rgb * ring_shape_inner * (1. - u_colorInner.a) * background;
  color += u_colorBack.rgb * ring_shape_outer * (1. - u_colorOuter.a) * background;
  
  
    vec2 halfSize = vec2(.5);
    vec2 dist = abs(box_uv);
    vec2 outer = step(halfSize, dist);
    vec2 inner = step(halfSize -  0.01, dist);
    float stroke = (1.0 - outer.x) * (1.0 - outer.y) * (inner.x + inner.y);
    color.r += .5 * stroke;

  fragColor = vec4(color, opacity);
//  fragColor = vec4(vec3(test), 1.);
}
`;

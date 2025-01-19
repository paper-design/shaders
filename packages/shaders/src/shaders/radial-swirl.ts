export type RadialSwirlUniforms = {
  u_color1: [number, number, number, number];
  u_color2: [number, number, number, number];
  u_color3: [number, number, number, number];
  u_density: number;
  u_dotSize: number;
  u_focus: number;
};

/**
 * RadialSwirl pattern
 * The artwork by Ksenia Kondrashova
 * Renders a number of circular shapes with gooey effect applied
 *
 * Uniforms include:
 * u_color1: The mataball base color #1
 * u_color2: The mataball base color #2
 * u_color3: The mataball base color #3
 * u_density: The scale of uv coordinates: with scale = 1 radialSwirl fit the screen height
 */

export const radialSwirlFragmentShader = `#version 300 es
precision highp float;

uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_density;
uniform float u_dotSize;
uniform float u_focus;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

#define TWO_PI 6.28318530718

out vec4 fragColor;

float smoothStep(float t) {
  return sin(t * 3.14159 * 3.0) * 0.5 + 0.5;
}

float remap(float t) {
  return smoothstep(0., 1., t);
}

vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer) {
  vec4 color1 = vec4(c1.rgb * c1.a, c1.a);
  vec4 color2 = vec4(c2.rgb * c2.a, c2.a);
  vec4 color3 = vec4(c3.rgb * c3.a, c3.a);

  vec4 res;
  float step = 1. / 6.;

  if (mixer < step) {
    float t = mixer / step;
    t = remap(t);
    res = mix(color1, color2, t);
  } else if (mixer < 2. * step) {
    float t = (mixer - step) / step;
    t = remap(t);
    res = mix(color2, color3, t);
  } else if (mixer < 3. * step) {
    float t = (mixer - 2. * step) / step;
    t = remap(t);
    res = mix(color3, color1, t);
  } else if (mixer < 4. * step) {
    float t = (mixer - 3. * step) / step;
    t = remap(t);
    res = mix(color1, color2, t);
  } else if (mixer < 5. * step) {
    float t = (mixer - 4. * step) / step;
    t = remap(t);
    res = mix(color2, color3, t);
  } else {
    float t = (mixer - 5. * step) / step;
    t = remap(t);
    res = mix(color3, color1, t);
  }
  return res;
}

mat2 rotationMatrix(float theta) {
  return mat2(
    cos(theta), -sin(theta),
    sin(theta), cos(theta)
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;

  uv -= .5;
  uv /= u_pixelRatio;
  uv.x *= ratio;

  float t = 2. * u_time;

  uv *= (10. * pow(u_density, 4.));

  float radius = length(uv);

  float len = length(uv);
  len = pow(len, 1. + (u_focus - 1.));

  float angle = atan(uv.y, uv.x) + TWO_PI * len;
  angle -= 10. * t;

  float stripe_map = fract((atan(uv.y, uv.x) - 10. * t) / TWO_PI + len);

  vec2 deformed_uv = vec2(radius * cos(angle), radius * sin(angle));

  float edge_width = fwidth(length(uv));

  vec3 color = u_color1.rgb * smoothstep(.0, edge_width, deformed_uv.y);

  color = mix(color, vec3(step(.5, stripe_map)), step(0., uv.x));
  fragColor = vec4(color, 1.);
}
`;

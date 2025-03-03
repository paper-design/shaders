export type PulsingBorderUniforms = {};

/**
 *
 * Border borderLine with optional pulsing animation. Inspired by
 *
 * Uniforms include:
 */

export const pulsingBorderFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform vec4 u_colorBack;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;

uniform float u_size;
uniform float u_power;
uniform float u_inner;
uniform float u_frequency;
uniform float u_borderLine;
uniform float u_grain;
uniform float u_pulse;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846


vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float get_border_map(vec2 uv_normalised) {
  vec2 outer = u_size / u_resolution;
  outer *= 2.447;
      
  vec2 bl = smoothstep(vec2(0.), outer, uv_normalised);
  vec2 tr = smoothstep(vec2(0.), outer, 1. - uv_normalised);

  bl = pow(bl, vec2(.04));
  tr = pow(tr, vec2(.04));
  float s = 1. - bl.x * bl.y * tr.x * tr.y; 
    
  return clamp(s, 0., 1.);
}

float rand(vec2 n) {
  return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
float noise(vec2 n) {
  const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
  return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}
float fbm_4(vec2 n) {
  float total = 0.0, amplitude = .2;
  for (int i = 0; i < 4; i++) {
    total += noise(n) * amplitude;
    n += n;
    amplitude *= 0.6;
  }
  return total;
}


vec2 get_rotated_uv(float rotation, float scale) {
    vec2 noise_uv = gl_FragCoord.xy;
    noise_uv /= u_pixelRatio;
    noise_uv -= .25 * u_resolution.xy;
    noise_uv = rotate(noise_uv, rotation);
    noise_uv += .25 * u_resolution.xy;
    noise_uv *= .0001 * scale * u_frequency;
    return noise_uv;
}

float get_shape(float t1, float t2, float border, float scale) {
  vec2 noise_uv1 = get_rotated_uv(t1, scale);
  float s = (.1 + snoise(noise_uv1));
  s *= (.2 + 1. * t2);
  s *= (1. + 2. * u_power);
  s *= border;
  return s;
}

float smoothSpeechEmulation(float time) {
    // Parameters for wave frequencies and modulations
    float baseFreq = 300.0 + sin(time * 0.1) * 100.0;  // Slow modulation for low u_frequency
    float midFreq = 600.0 + cos(time * 0.3) * 50.0;    // Slight modulation for mid-range
    float highFreq = 1200.0 + sin(time * 0.6) * 150.0; // Faster modulation for high-pitched components

    // Smooth sine waves for each u_frequency component
    float lowWave = sin(time * baseFreq);
    float midWave = sin(time * midFreq) * 0.5;
    float highWave = sin(time * highFreq) * 0.2;

    // Combine all waves with gentle mixing for a smoother result
    float speechSignal = lowWave + midWave + highWave;

    // Apply a smooth sine modulation to the entire signal for soft dynamics
    speechSignal *= 0.5 + 0.5 * sin(time * 0.05);  // Smooth amplitude modulation

    return speechSignal;
}

float get_sector(float a, float mask, float width) {
  float atg1 = mod(a, 1.);
  float s = smoothstep(.5 - width, .5, atg1) * smoothstep(.5 + width, .5, atg1);
  s *= mask;
  s = max(0., s);
  return s;
}


 
void main() {
  vec2 uv = gl_FragCoord.xy;
  uv /= u_pixelRatio;

  float ratio = u_resolution.x / u_resolution.y;

  float t = 1.5 * u_time;
  
  vec2 uv_normalised = gl_FragCoord.xy / u_resolution.xy;
  float oval_mask = smoothstep(0., 1., 1.5 * length(uv_normalised - .5));

  float grain = clamp(.6 * snoise(uv * .5) - fbm_4(.4 * uv) - fbm_4(.001 * uv), 0., 1.);
  
  float border = get_border_map(uv_normalised);

  float pulse = smoothSpeechEmulation(.012 * t);
  border *= (1. + u_pulse * pulse);

  vec2 uv_center = uv_normalised - .5;;
  

  float angle_norm = atan(uv_center.y, uv_center.x) / TWO_PI;
  
  
  float shape1 = 0.;
  float shape2 = 0.;
  
  
  // CHANGE WIDTH CALCULATION

  for (int i = 0; i < int(u_frequency + 1.); i++) {
    float fi = float(i);  
    float time = (.1 + .15 * abs(sin(fi * 4.) * cos(fi * 2.))) * t + rand(vec2(fi * 10.)) * 3.;
    time *= mix(1., -1., float(i % 2 == 0));
    float mask = .2 + sin(t + fi * 6. - fi);
    float width = (.1 - .004 * u_frequency) * (1. + rand(vec2(fi + 20., fi + 55.)));
    
//    shape1 = max(shape1, get_sector(angle_norm + time, mask, width));
    shape1 += get_sector(angle_norm + time, mask, width);
  }
    
  for (int i = 0; i < int(u_frequency); i++) {
    float fi = float(i);  
    float time = (.1 + .15 * abs(sin(fi * 2.) * cos(fi * 5.))) * t + rand(vec2(fi * 2. - 20.)) * 3.;
    time *= mix(-1., 1., float(i % 2 == 0));
    float mask = .2 + cos(t + fi * 5. - 2. * fi);
    float width = (.1 - .004 * u_frequency) * (1. + rand(vec2(fi + 120., fi - 55.)));
    
//    shape2 = max(shape2, get_sector(angle_norm + time, mask, width));
    shape2 += get_sector(angle_norm + time, mask, width);
  }
      
  float shape3 = 1. - max(shape1, shape2);

//  shape1 += .2 * snoise(.001 * uv);

  shape1 *= border;
  shape2 *= border;
  shape3 *= border;

  float noise_scale = (.0005 + .00012 * u_frequency);
  float inner1 = smoothstep(-1., 1., snoise(noise_scale * uv + .05 * t));
  float inner2 = smoothstep(-1., 1., snoise(noise_scale * uv - .05 * t + 125.));
  shape3 += .2 * u_inner * (inner1 - inner2) * (1. + u_pulse * pulse);;
  shape2 += .05 * u_inner * inner2 * (1. + u_pulse * pulse);;
  
  shape1 *= (1. + 2. * (.5 + .5 * sin(t)) * u_power);
  shape2 *= (1. + 2. * (.5 + .5 * cos(t)) * u_power);
  shape3 *= (1. + .2 * u_power);
  shape3 *= (.7 + .3 * inner1);
  
  
//    shape1 += grain * u_grain;
    shape2 += 2. * grain * u_grain;
    shape3 += grain * u_grain;


  vec3 color = u_colorBack.rgb;
  color += u_color1.rgb * shape1;
  color += u_color2.rgb * shape2;
  color += u_color3.rgb * shape3;


  // vec3 color = u_colorBack.rgb;
  // color = mix(color, u_color1.rgb, shape1);
  // color = mix(color, u_color2.rgb, shape1);
  // color = mix(color, u_color3.rgb, shape3);

  fragColor = vec4(color, 1.);
//  fragColor = vec4(vec3(shape2), 1.);
}

`;

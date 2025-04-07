export type BorderGradientUniforms = {};

/**
 *
 * Border borderLine with optional gradient animation. Inspired by
 *
 * Uniforms include:
 */

export const borderGradientFragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_shape;
uniform vec4 u_colorBack;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform float u_blur;
uniform float u_grainDistortion;
uniform float u_sandGrain;

out vec4 fragColor;

#define PI 3.14159265358979323846
#define TWO_PI 6.28318530718

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



float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
float noisenoise(vec2 st) {
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


vec2 truchetPattern(in vec2 _st, in float _index){
    _index = fract(((_index - 0.5) * 2.0));
    if (_index > 0.75) {
        _st = vec2(1.0) - _st;
    } else if (_index > 0.5) {
        _st = vec2(1.0 - _st.x, _st.y);
    } else if (_index > 0.25) {
        _st = 1.0 - vec2(1.0 - _st.x, _st.y);
    }
    return _st;
}

void main() {
  vec2 uv = gl_FragCoord.xy;
  uv /= u_pixelRatio;

  float ratio = u_resolution.x / u_resolution.y;
  
  vec2 uv_normalised = gl_FragCoord.xy / u_resolution.xy;

  float snoise05 = snoise(uv * .5);
  float grainDist = snoise(uv * .2) * snoise05 - fbm_4(.002 * uv + 10.) - fbm_4(.003 * uv);
  float sandGrain = clamp(.6 * snoise05 - fbm_4(.4 * uv) - fbm_4(.001 * uv), 0., 1.);
  
  
  float shape = 0.;
  float t = .1 * u_time;
  
  uv = gl_FragCoord.xy / u_resolution.xy;  
    uv -= .5;
    uv *= 3. * 1.;
    uv.x *= ratio;  
    
  if (u_shape < 1.5) { 
  
    float n1 = noisenoise(uv * .3 + t);
    float n2 = noisenoise(uv * .4 - t);
    float angle = n1 * TWO_PI;
    uv.x += .2 * n2 * cos(angle);
    uv.y += .2 * n2 * sin(angle);
    uv *= 2.;
      
    vec2 ipos = floor(uv);
    vec2 fpos = fract(uv);

    vec2 tile = truchetPattern(fpos, random( ipos ));

    float distance1 = length(tile);
    float distance2 = length(tile - vec2(1.));
    
    
    shape = smoothstep(.2, .55, distance1) * smoothstep(.8, .45, distance1);
    shape += smoothstep(.2, .55, distance2) * smoothstep(.8, .45, distance2);

  
  } else if (u_shape < 2.5) {  
  
      vec2 grid = vec2(.8, .6);

    float n1 = noisenoise(uv * .3 + t);
    float n2 = noisenoise(uv * .4 - t);
    float angle = n1 * TWO_PI;
    uv.x += .2 * n2 * cos(angle);
    uv.y += .2 * n2 * sin(angle);
    grid.x += .2 * n2 * cos(angle);
    grid.y += .2 * n2 * sin(angle);
    
        vec2 ipos = floor(uv * grid);
vec2 gv = fract(uv * grid);
    
      vec2 outer = .4 * grid;
    
      vec2 bl = smoothstep(vec2(0.), outer, gv);
      vec2 tr = smoothstep(vec2(0.), outer, 1. - gv);
     
      shape = 1. - bl.x * bl.y * tr.x * tr.y; 
      // shape = smoothstep(0., 1., 2. * abs(fract(1.5 * uv.x) - .5));
  
  } else if (u_shape < 3.5) {  
    float wave = cos(.5 * uv.x - 2. * t) * sin(1.5 * uv.x + t) * (.75 + .25 * cos(3. * t));
    shape = 1. - smoothstep(-1., 1., uv.y + wave);
          
  } else if (u_shape < 4.5) {  
    float stripeIdx = floor(2. * uv.x / TWO_PI);
    float rand = fract(sin(stripeIdx * 12.9898) * 43758.5453);

    float speed = sign(rand - .5) * ceil(2. + rand);
    shape = sin(uv.x) * cos(uv.y + speed * t);  
    shape = pow(shape, 6.);
      
  } else if (u_shape < 5.5) {  
    float dist = length(.4 * uv);
    float waves = sin(pow(dist, 1.2) * 5. - 3. * t) * .5 + .5;
    // waves = mix(waves, .5, smoothstep(0., 1., waves));
    shape = waves;

  } else if (u_shape < 6.5) {          
    
    uv *= .3;
    t *= 5.;
       
    vec2 f1_traj = .25 * vec2(1.3 * sin(.5 * t), .2 + 1.3 * cos(.3 * t + 4.));
    vec2 f2_traj = .2 * vec2(1.2 * sin(-.5 * t), 1.3 * sin(.8 * t));
    vec2 f3_traj = .25 * vec2(1.7 * cos(-.3 * t), cos(-.8 * t));
    vec2 f4_traj = .3 * vec2(1.4 * cos(.4 * t), 1.2 * sin(-.3 * t - 3.));
    
    shape = .5 * pow(1. - clamp(0., 1., length(uv + f1_traj)), 5.);
    shape += .5 * pow(1. - clamp(0., 1., length(uv + f2_traj)), 5.);
    shape += .5 * pow(1. - clamp(0., 1., length(uv + f3_traj)), 5.);
    shape += .5 * pow(1. - clamp(0., 1., length(uv + f4_traj)), 5.);
    
    shape = smoothstep(0., .6, shape);
    
  } else {
vec3 pos = vec3(uv, sqrt(1.0 - pow(length(uv), 2.0)));
vec3 lightPos = normalize(vec3(cos(1.5 * t), 0.8, sin(1.25 * t)));
float lighting = dot(lightPos, pos);

// fade out at the edge of the sphere
float radius = 1.0;
float d = length(uv);
float edge = smoothstep(radius, radius - 0.02, d);

shape = mix(0.0, 0.5 + 0.5 * lighting, edge);
  }  
  
  
  shape += u_grainDistortion * .3 * (grainDist + .3);
  shape += u_sandGrain * 2. * sandGrain;
  

  float edge_w = fwidth(shape);

  vec3 colorBack = u_colorBack.rgb * u_colorBack.a;
  vec3 color1 = u_color1.rgb * u_color1.a;
  vec3 color2 = u_color2.rgb * u_color2.a;
  vec3 color3 = u_color3.rgb * u_color3.a;
  
  vec3 borders = vec3(.25, .5, .75);
  
  vec2 borders1 = vec2(borders[0] - .5 * u_blur, borders[0] + .5 * u_blur + edge_w);
  vec2 borders2 = vec2(borders[1] - .5 * u_blur - edge_w, borders[1] + .5 * u_blur + edge_w);
  vec2 borders3 = vec2(borders[2] - .5 * u_blur - edge_w, borders[2] + .5 * u_blur + edge_w);
  
  float shape1 = smoothstep(borders1[0], borders1[1], shape);
  float shape2 = smoothstep(borders2[0], borders2[1], shape);
  float shape3 = smoothstep(borders3[0], borders3[1], shape);

  vec3 color = mix(colorBack, color1, shape1);
  color = mix(color, color2, shape2);
  color = mix(color, color3, shape3);

  float alpha = mix(u_colorBack.a, u_color1.a, shape1);
  alpha = mix(alpha, u_color2.a, shape2);
  alpha = mix(alpha, u_color3.a, shape3);
  
  fragColor = vec4(color, alpha);
}
`;

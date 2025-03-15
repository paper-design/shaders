'use client';
import {ShaderMount} from '@paper-design/shaders-react';
import {useControls} from 'leva';

const fragmentShader = `#version 300 es
precision highp float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_time;

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
  
  vec2 world = vec2(u_worldWidth, u_worldHeight) * u_pixelRatio;
  
  uv.x *= (u_resolution.x / world.x);
  uv.y *= (u_resolution.y / world.y);
  
  if (u_fit == 0.) {
    if (world.x < u_resolution.x && world.y < u_resolution.y) {
        float scaleFactor = min(u_resolution.x / world.x, u_resolution.y / world.y);
        uv /= scaleFactor;
    }
  } else {
    if (world.x < u_resolution.x || world.y < u_resolution.y) {
        float scaleFactor = max(u_resolution.x / world.x, u_resolution.y / world.y);
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
 

  float ring_shape = 1. - smoothstep(.1, .55, length(uv));
  vec3 color = normalize(vec3(.4, .2, 1.)) * 2. * ring_shape;

    vec2 halfSize = vec2(.5);
    vec2 dist = abs(box_uv);
    vec2 outer = step(halfSize, dist);
    vec2 inner = step(halfSize -  0.01, dist);
    float stroke = (1.0 - outer.x) * (1.0 - outer.y) * (inner.x + inner.y);
    color.r += .5 * stroke;

  fragColor = vec4(color, 1.);
}
`;

const MyTest = () => {
    const {left, top, width, height} = useControls('canvas', {
        left: {value: 150, min: 0, max: 200},
        top: {value: 150, min: 0, max: 200},
        width: {value: 600, min: 10, max: 1000},
        height: {value: 400, min: 10, max: 1000},
    });

    const {fit, worldWidth, worldHeight} = useControls('shader', {
        fit: {value: 0, min: 0, max: 1, step: 1},
        worldWidth: {value: 300, min: 10, max: 1000},
        worldHeight: {value: 300, min: 10, max: 1000},
    });

    return (
        <>
            <div style={{
                position: 'fixed',
                left: `10px`,
                top: `10px`,
            }}><span style={{color: 'red'}}>red</span>: world box
            </div>
            <div style={{
                position: 'fixed',
                left: `10px`,
                top: `40px`,
            }}>
                <div>
                    <b>fit = 0</b>: contain
                </div>
                <div>
                    <b>fit = 1</b>: cover
                </div>
            </div>
            <div style={{
                position: 'fixed',
                left: `10px`,
                top: `100px`,
            }}>fit describes only the relation between ring and world box
            </div>
            <div
                style={{
                    position: 'fixed',
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                }}
            >
                <ShaderMount
                    style={{width: '100%', height: '100%'}}
                    fragmentShader={fragmentShader}
                    uniforms={{
                        u_worldWidth: worldWidth,
                        u_worldHeight: worldHeight,
                        u_fit: fit
                    }}
                />
            </div>
        </>
    );
};

export default MyTest;


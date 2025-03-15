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


void main() {

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;
  float worldRatio = u_worldWidth / u_worldHeight;

  uv -= .5;
  
  vec2 world = vec2(u_worldWidth, u_worldHeight) * u_pixelRatio;
  
  uv.x *= (u_resolution.x / world.x);
  uv.y *= (u_resolution.y / world.y);
 
  if (world.x < u_resolution.x || world.y < u_resolution.y) {
    if (u_fit == 0.) {
      float scaleFactor = min(u_resolution.x / world.x, u_resolution.y / world.y);
      uv /= scaleFactor;
    } else if (u_fit == 1.) {
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
//  fragColor = vec4(vec3(test), 1.);
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


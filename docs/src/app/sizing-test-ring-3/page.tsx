'use client';
import {ShaderMount} from '@paper-design/shaders-react';
import {useControls} from 'leva';

const fragmentShader = `#version 300 es
precision highp float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_time;

uniform float u_fit;

out vec4 fragColor;


void main() {

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;

  uv -= .5;
 
  if (u_fit == 0.) {
    if (ratio > 1.) {
        uv.x *= ratio;
    } else {
        uv.y /= ratio;
    }
  } else if (u_fit == 1.) {
    if (ratio > 1.) {
        uv.y /= ratio;
    } else {
        uv.x *= ratio;
    }
  }
 


  float ring_shape = 1. - smoothstep(.1, .55, length(uv));
  vec3 color = normalize(vec3(.4, .2, 1.)) * 2. * ring_shape;
  

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

    const {fit} = useControls('shader', {
        fit: {value: 0, min: 0, max: 1, step: 1},
    });

    return (
        <>
            <div style={{
                position: 'fixed',
                left: `10px`,
                top: `10px`,
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
                top: `60px`,
            }}>fit describes the relation between ring and canvas viewport
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
                        u_fit: fit
                    }}
                />
            </div>
        </>
    );
};

export default MyTest;


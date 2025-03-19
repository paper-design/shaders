'use client';
import { ShaderMount } from '@paper-design/shaders-react';
import { useControls } from 'leva';

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


void main() {

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;
  float worldRatio = u_worldWidth / u_worldHeight;

  uv -= .5;

  vec2 world = vec2(u_worldWidth, u_worldHeight) * u_pixelRatio;
  vec2 resRatio = u_resolution / world;
  uv *= resRatio;


  if (u_fit == 0.) {
    if (ratio > 1.) {
      uv.x *= worldRatio;
      if (resRatio.y > 1.) {
        uv /= resRatio.y;
      }
      if (resRatio.x < 1.) {
        if (worldRatio < 1.) {
          uv /= worldRatio;
        }
      } else {
        if (world.y > u_resolution.x) {
          uv /= worldRatio;
          uv /= resRatio.x;
        }
      }
    } else {
      uv.y /= worldRatio;
      if (resRatio.x > 1.) {
        uv /= resRatio.x;
      }
      if (world.x > u_resolution.y) {
        if (resRatio.y > 1.) {
          uv *= worldRatio;
          uv /= resRatio.y;
        } else {
          if (worldRatio > 1.) {
            uv *= worldRatio;
          }
        }
      }
    }
  } else {
    if (ratio > 1.) {
      uv.x *= worldRatio;
      if (resRatio.x < 1.) {
        if (worldRatio > 1.) {
          uv /= worldRatio;
        }
      } else {
        if (world.y < u_resolution.x) {
          uv /= worldRatio;
          uv /= resRatio.x;
        }
      }
    } else {
      uv.y /= worldRatio;
      if (world.x > u_resolution.y) {
        if (worldRatio < 1.) {
          uv *= worldRatio;
        }
      } else {
        uv *= worldRatio;
        if (worldRatio > 1.) {
          uv /= resRatio.y;
        } else {
          if (resRatio.y > 1.) {
            uv /= resRatio.y;
          }
        }
      }
    }
  }

  float ring_shape = 1. - smoothstep(.1, .5, length(uv));
  vec3 color = normalize(vec3(.4, .2, 1.)) * 2. * ring_shape;

  color = mix(color, vec3(.4), 1. - step(uv.x, .5));
  color = mix(color, vec3(.4), 1. - step(uv.y, .5));
  color = mix(color, vec3(.4), step(uv.x, -.5));
  color = mix(color, vec3(.4), step(uv.y, -.5));

  fragColor = vec4(color, 1.);
}
`;

const MyTest = () => {
  const { width, height } = useControls('canvas', {
    width: { value: 370, min: 10, max: 1000 },
    height: { value: 330, min: 10, max: 1000 },
  });

  const { fit, worldWidth, worldHeight, offsetX, offsetY } = useControls('shader', {
    fit: { value: 0, min: 0, max: 1, step: 1 },
    worldWidth: { value: 370, min: 10, max: 1000 },
    worldHeight: { value: 900, min: 10, max: 1000 },
    offsetX: {value: 0, min: 0, max: 100},
    offsetY: {value: 0, min: 0, max: 100},
  });

  return (
    <>
      <div
        style={{
          width: `100%`,
          display: 'flex',
          // flexDirection: (width / height > 1) ? 'row' : 'column',
          flexDirection: 'row',
          alignItems: 'start',
          justifyContent: 'start',
        }}
      >
        <div
          style={{
            width: `${width}px`,
            height: `${height}px`,
            background: 'grey',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              color: 'red',
            }}
          >
            img
          </span>
          <img
            style={{
              minWidth: `${worldWidth}px`,
              minHeight: `${worldHeight}px`,
              width: `100%`,
              height: `100%`,
              objectFit: fit ? 'cover' : 'contain',
              objectPosition: `${offsetX}% ${offsetY}%`,
            }}
            src="https://workers.paper.design/user-images/01JNZJBZJEV693N5NH06FV53Q1/01JPD59V69P2WKXGXGGTHR6AYW.png"
          />
        </div>

        <div
          style={{
            width: `${width}px`,
            height: `${height}px`,
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              color: 'red',
            }}
          >
            shader
          </span>

          <ShaderMount
            style={{ width: '100%', height: '100%' }}
            fragmentShader={fragmentShader}
            uniforms={{
              u_worldWidth: worldWidth,
              u_worldHeight: worldHeight,
              u_fit: fit,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default MyTest;

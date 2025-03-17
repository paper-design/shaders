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

  float xRatio = u_resolution.x / world.x;
  float yRatio = u_resolution.y / world.y;

  uv *= vec2(xRatio, yRatio);


  if (u_fit == 0.) {
    if (ratio > 1.) {
      uv.x *= worldRatio;
      if (yRatio > 1.) {
        uv /= yRatio;
      }
      if (xRatio < 1.) {
        if (worldRatio < 1.) {
          uv /= worldRatio;
        }
      } else {
        if (world.y > u_resolution.x) {
          uv /= worldRatio;
          uv /= xRatio;
        }
      }
    } else {
      uv.y /= worldRatio;
      if (xRatio > 1.) {
        uv /= xRatio;
      }
      if (world.x > u_resolution.y) {
        if (yRatio > 1.) {
          uv *= worldRatio;
          uv /= yRatio;
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
      if (xRatio < 1.) {
        if (worldRatio > 1.) {
          uv /= worldRatio;
        }
      } else {
        if (world.y < u_resolution.x) {
          uv /= worldRatio;
          uv /= xRatio;
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
          uv /= yRatio;
        } else {
          if (yRatio > 1.) {
            uv /= yRatio;
          }
        }
      }
    }
  }
  
  
//    if (u_fit == 0.) {
//      if (ratio > 1.) {
//        uv.x *= worldRatio;
//        if (world.y < u_resolution.y) {
//          uv /= (u_resolution.y / world.y);  
//        }
//        if (world.x > u_resolution.x) {
//            if (world.y > world.x) {
//                uv /= worldRatio;
//            }
//        } else {
//            if (world.y > u_resolution.x) {
//                uv /= worldRatio;
//                uv /= (u_resolution.x / world.x);  
//            }
//        }
//      } else {
//          uv.y /= worldRatio;
//          if (world.x < u_resolution.x) {
//            uv /= (u_resolution.x / world.x);  
//          }
//          if (world.x > u_resolution.y) {
//            if (world.y < u_resolution.y) {
//                uv *= worldRatio;
//                uv /= (u_resolution.y / world.y);          
//            } else {
//                if (world.y < world.x) {
//                  uv *= worldRatio;
//                }
//            }
//          }
//      }
//  } else {
//      if (ratio > 1.) {
//        uv.x *= worldRatio;
//        if (world.x > u_resolution.x) {
//            if (world.y < world.x) {
//              uv /= worldRatio;
//            } 
//         } else {
//            if (world.y < u_resolution.x) {
//              uv /= worldRatio;
//              uv /= (u_resolution.x / world.x);          
//            } 
//         }
//      } else {
//        uv.y /= worldRatio;
//        if (world.x > u_resolution.y) {
//            if (world.y > world.x) {
//              uv *= worldRatio;
//            } 
//        } else {
//            if (world.y < world.x) {
//              uv *= worldRatio;
//              uv /= (u_resolution.y / world.y);       
//            } else {
//              if (world.y > u_resolution.y) {
//                uv *= worldRatio;
//              } else {
//                 uv *= worldRatio;
//                 uv /= (u_resolution.y / world.y);     
//              }
//            }
//        }
//      }
//  }



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
    width: { value: 800, min: 10, max: 1000 },
    height: { value: 150, min: 10, max: 1000 },
  });

  const { fit, worldWidth, worldHeight } = useControls('shader', {
    fit: { value: 0, min: 0, max: 1, step: 1 },
    worldWidth: { value: 600, min: 10, max: 1000 },
    worldHeight: { value: 950, min: 10, max: 1000 },
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

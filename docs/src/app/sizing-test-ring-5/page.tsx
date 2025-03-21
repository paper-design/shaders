'use client';
import { ShaderMount } from '@paper-design/shaders-react';
import { useControls } from 'leva';

const fragmentShader = `#version 300 es
precision highp float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_time;

uniform float u_offsetX;
uniform float u_offsetY;

uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846


vec2 getSizedMult(float viewBoxRatio, vec2 viewBox, vec2 world) {

  vec2 mult = vec2(1.);

  if (u_fit == 0.) {
    if (viewBoxRatio > 1.) {
                      
      // make the world size depend on height
      mult.x *= (world.x / world.y);

      // if worldRatio is same as viewBoxRatio => just render world height px
  
      // if worldRatio is different than viewBoxRatio
      if (world.x < world.y) {
        if (world.y > viewBox.x) {
          if (world.x <= viewBox.x) {
            // if world gets smaller than viewport width => fix width it to viewport width, ignore world height
            mult *= (world.y / viewBox.x);
          } else {
            // if world gets larger than viewport width => render world width even if the whole thing exceed the viewport
            mult *= (world.y / world.x);
          }
        }
      }

      // if world gets smaller than viewport height => fix height it to viewport height
      if (world.y < viewBox.y) {
        mult *= world.y / viewBox.y;
      }
      
    } else {      
    
      // make the world size depend on width
      mult.y *= (world.y / world.x);
      
      // if worldRatio is same as viewBoxRatio => just render world width px
      
      // if worldRatio is different than viewBoxRatio
      if (world.x > world.y) {
        if (world.x > viewBox.y) {
          if (world.y <= viewBox.y) {
            // if world gets smaller than viewport height => fix height it to viewport height, ignore world width
            mult *= world.x / viewBox.y;
          } else {
            // if world gets larger than viewport height => render world height even if the whole thing exceed the viewport
            mult *= (world.x / world.y);
          }
        }
      }

      // if world gets smaller than viewport width => fix width it to viewport width
      if (world.x < viewBox.x) {
        mult *= world.x / viewBox.x;
      }
    }
  } else {
    if (viewBoxRatio > 1.) {

      // if world ratio is same as viewbox
      if (world.y < world.x) {
        // make the world size depend on its width
        mult.y *= (world.y / world.x);
        if (world.x <= viewBox.x) {
          // world doesn't fit by width => fix world width to viewbox width
          mult *= (world.x / viewBox.x);
        }
        
      // if world ratio is different than viewbox
      } else {
        // make the world size depend on its height
        mult.x *= (world.x / world.y);
        if (world.y <= viewBox.x) {
          // world doesn't fit by width => fix world width to viewbox height
          mult *= (world.y / viewBox.y);
          mult *= (viewBox.y / viewBox.x);
        }
      }
      
    } else {     
      
      // if world ratio is same as viewbox
      if (world.y > world.x) {
        // make the world size depend on its height
        mult.x *= (world.x / world.y);
        if (world.y <= viewBox.y) {
          // world doesn't fit by heoight => fix world height to viewbox height
          mult *= (world.y / viewBox.y);
        }
        
      // if world ratio is different than viewbox
      } else {
        // make the world size depend on its width
        mult.y *= (world.y / world.x);
        if (world.x <= viewBox.y) {
           // world doesn't fit by width => fix world width to viewbox height
          mult *= (world.x / viewBox.x);
          mult *= (viewBox.x / viewBox.y);
        }
      }
    }
  }
  
  return mult;
}

void main() {

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float viewBoxRatio = u_resolution.x / u_resolution.y;
  vec2 world = vec2(u_worldWidth, u_worldHeight) * u_pixelRatio;

  uv -= .5;


  // keep graphics aspect ratio
  uv *= (u_resolution / world);
  vec2 original_uv = uv;  

  vec2 resizer = getSizedMult(viewBoxRatio, u_resolution, world);
  uv *= resizer;
  
  uv.x += u_offsetX * (uv.x / original_uv.x);
  uv.y += u_offsetY * (uv.y / original_uv.y);


  float ring_shape = 1. - smoothstep(.1, .5, length(uv));
  vec3 color = normalize(vec3(.4, .2, 1.)) * 2. * ring_shape;

  color = mix(color, vec3(.4), 1. - step(uv.x, .5));
  color = mix(color, vec3(.4), 1. - step(uv.y, .5));
  color = mix(color, vec3(.4), step(uv.x, -.5));
  color = mix(color, vec3(.4), step(uv.y, -.5));
  
  
    vec2 halfSize = vec2(.5);
    vec2 dist = abs(original_uv);
    vec2 outer = step(halfSize, dist);
    vec2 inner = step(halfSize - 0.005, dist);
    float stroke = (1.0 - outer.x) * (1.0 - outer.y) * (inner.x + inner.y);
    color.g += .4 * stroke;


  fragColor = vec4(color, 1.);
}
`;

const MyTest = () => {
  const { width, height } = useControls('canvas', {
    width: { value: 600, min: 10, max: 1000 },
    height: { value: 250, min: 10, max: 1000 },
  });

  const { fit, worldWidth, worldHeight, offsetX, offsetY } = useControls('shader', {
    fit: { value: 0, min: 0, max: 1, step: 1 },
    worldWidth: { value: 370, min: 10, max: 1000 },
    worldHeight: { value: 250, min: 10, max: 1000 },
    offsetX: {value: 50, min: 0, max: 100},
    offsetY: {value: 50, min: 0, max: 100},
  });

  return (
    <>
      <div
        style={{
          width: `100%`,
          display: 'flex',
          flexDirection: 'row',
          // flexDirection: 'column',
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
              u_offsetX: .5 - offsetX / 100,
              u_offsetY: offsetY / 100 - .5,
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

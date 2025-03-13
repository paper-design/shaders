'use client';
import {ShaderMount} from '@paper-design/shaders-react';
import {useControls} from 'leva';

const fragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform float u_texture_aspect_ratio;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;

out vec4 fragColor;

vec2 get_img_uv(vec2 uv, float canvas_ratio, float img_ratio) {

  bool is_centered = true;
  float scale_factor = 1.;
//  float scale_factor = u_worldWidth / u_resolution.x;

  vec2 img_uv = uv;
  img_uv.y = 1. - img_uv.y;
  
  img_uv.x += .5;
  img_uv.y -= .5;
  
  if (is_centered) {
    img_uv -= .5;  
  }
  
  if (u_fit == 1.) {
    if (canvas_ratio > img_ratio) {
      img_uv.y *= (img_ratio / canvas_ratio);
    } else {
      img_uv.x *= (canvas_ratio / img_ratio);
    }
  } else {
    if (canvas_ratio > img_ratio) {
      img_uv.x = img_uv.x * canvas_ratio / img_ratio;
    } else {
      img_uv.y = img_uv.y * img_ratio / canvas_ratio;
    }
  }
  
  img_uv /= scale_factor;
  if (is_centered) {
    img_uv += .5;  
  }

  return img_uv;
}

float get_uv_frame(vec2 uv) {
  return step(1e-3, uv.x) * step(uv.x, 1. - 1e-3) * step(1e-3, uv.y) * step(uv.y, 1. - 1e-3);
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
  
  vec2 box_uv = uv;
  
  vec2 inage_uv = get_img_uv(uv, worldRatio, u_texture_aspect_ratio);
  
  vec4 img = texture(u_texture, inage_uv);
  vec4 background = vec4(.2, .2, .2, 1.);
  
  float frame = get_uv_frame(inage_uv);
  
  vec4 color = mix(background, img, frame);
  
  
  
    vec2 halfSize = vec2(.5);
    vec2 dist = abs(box_uv);
    vec2 outer = step(halfSize, dist);
    vec2 inner = step(halfSize -  0.01, dist);
    float stroke = (1.0 - outer.x) * (1.0 - outer.y) * (inner.x + inner.y);
    color.r += .5 * stroke;
    
  fragColor = color;
}`;

const MyTest = () => {
    const {left, top, width, height} = useControls('canvas', {
        left: {value: 150, min: 0, max: 200},
        top: {value: 150, min: 0, max: 200},
        width: {value: 400, min: 10, max: 1000},
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
            }}><span style={{color: 'red'}}>red</span>: world size in px
            </div>
            <div style={{
                position: 'fixed',
                left: `10px`,
                top: `50px`,
            }}>
                <div>
                    <b>fit = 0</b>: contain
                </div>
                <div>
                    <b>fit = 1</b>: cover
                </div>
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
                        u_texture: '/placeholder.png',
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


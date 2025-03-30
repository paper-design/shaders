/* eslint-disable @next/next/no-img-element */

'use client';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ShaderMount } from '@paper-design/shaders-react';

const fragmentShader = `#version 300 es
precision highp float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_time;

uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;

uniform float u_scale;

out vec4 fragColor;

#define TWO_PI 6.28318530718

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float neuro_shape(vec2 uv, float t) {
  vec2 sine_acc = vec2(0.);
  vec2 res = vec2(0.);
  float scale = 8.;

  for (int j = 0; j < 15; j++) {
    uv = rotate(uv, 1.);
    sine_acc = rotate(sine_acc, 1.);
    vec2 layer = uv * scale + float(j) + sine_acc - t;
    sine_acc += sin(layer);
    res += (.5 + .5 * cos(layer)) / scale;
    scale *= (1.2);
  }
  return res.x + res.y;
}

void main() {  
  vec2 worldSize = vec2(u_worldWidth, u_worldHeight) * u_pixelRatio;
  
  float maxWidth = max(u_resolution.x, worldSize.x);
  float maxHeight = max(u_resolution.y, worldSize.y);

  float worldRatio = worldSize.x / max(worldSize.y, 1e-4);
  // crop
  float imageWidth = worldRatio * min(worldSize.x / worldRatio, worldSize.y);
  float imageWidthCrop = imageWidth;
  if (u_fit == 1.) {
    // cover
    imageWidth = worldRatio * max(maxWidth / worldRatio, maxHeight);
  } else if (u_fit == 2.) {
    // contain
    imageWidth = worldRatio * min(maxWidth / worldRatio, maxHeight);
  }
  float imageHeight = imageWidth / worldRatio;


  vec2 world = vec2(imageWidth, imageHeight);
  vec2 origin = vec2(.5 - u_originX, u_originY - .5);
  vec2 scale = u_resolution.xy / world;

  
  vec2 worldBox = gl_FragCoord.xy / u_resolution.xy;
  worldBox -= .5;
  worldBox *= scale;
  worldBox += origin * (scale - 1.);
  worldBox /= u_scale;
  worldBox += .5;
  
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv -= .5;

  uv += origin * (1. - 1. / scale);
  uv *= .003;
  uv *= u_resolution.xy;
  uv /= u_pixelRatio;
    
  if (u_fit > 0.) {
    uv *= (imageWidthCrop / imageWidth);
  }
  uv /= u_scale;
  uv += .5;

  float t = .0 * u_time;

  float noise = neuro_shape(uv, t);

  noise = 1.25 * pow(noise, 3.);
  noise += pow(noise, 12.);
  noise = max(.0, noise - .5);
  
  vec4 u_colorBack = vec4(0., 0., 0., 1.);
  vec4 u_colorFront = vec4(0., 1., .5, 1.);

  vec3 color = mix(u_colorBack.rgb * u_colorBack.a, u_colorFront.rgb * u_colorFront.a, noise);
  
  float left   = step(0., worldBox.x);
  float right  = step( worldBox.x, 1.);
  float top    = step( worldBox.y, 1.);
  float bottom = step(0., worldBox.y);
  float box = left * right * top * bottom;
  
  float opacity = mix(u_colorBack.a, u_colorFront.a, noise);
  opacity *= box;

  fragColor = vec4(color, opacity);
}
`;
export default function Page() {
  // React scaffolding
  const [fit, setFit] = useState<'crop' | 'cover' | 'contain'>('crop');
  const [canvasWidth, setCanvasWidth] = useState(400);
  const [canvasHeight, setCanvasHeight] = useState(200);
  const [worldWidth, setWorldWidth] = useState(500);
  const [worldHeight, setWorldHeight] = useState(150);
  const [originX, setOriginX] = useState(0.5);
  const [originY, setOriginY] = useState(0.5);
  const [scale, setScale] = useState(1);
  const canvasResizeObserver = useRef<ResizeObserver | null>(null);
  const canvasNodeRef = useRef<HTMLDivElement>(null);

  const fitCode = (fit === 'crop' ? 0 : (fit === 'cover' ? 1 : 2));

  return (
    <div className="grid min-h-dvh grid-cols-[1fr_300px]">
      <div className="jusify-center relative flex h-full flex-col items-center self-center">
        <div
          className="bg-gray absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 resize overflow-hidden bg-black"
          style={{
            width: canvasWidth,
            height: canvasHeight,
          }}
          ref={(node) => {
            canvasNodeRef.current = node;
            canvasResizeObserver.current?.disconnect();

            if (node) {
              canvasResizeObserver.current = new ResizeObserver(() => {
                flushSync(() => {
                  setCanvasWidth(node.clientWidth);
                  setCanvasHeight(node.clientHeight);
                });
              });

              canvasResizeObserver.current.observe(node);
            }
          }}
        >
          <ShaderMount
            style={{ width: '100%', height: '100%', background: 'white', border: '1px solid grey' }}
            fragmentShader={fragmentShader}
            uniforms={{
              u_worldWidth: worldWidth,
              u_worldHeight: worldHeight,
              u_fit: fitCode,
              u_originX: originX,
              u_originY: originY,
              u_scale: scale,
            }}
          />
        </div>
      </div>

      <div className="relative flex flex-col gap-4 border-l border-black/10 bg-white">
        <div className="flex flex-col gap-4 px-7 py-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="canvasWidth" className="text-sm font-medium">
              Canvas width
            </label>
            <input
              id="canvasWidth"
              type="number"
              min={0}
              value={canvasWidth}
              className="h-7 rounded bg-black/5 px-2 text-base"
              onChange={(e) => setCanvasWidth(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="canvasHeight" className="text-sm font-medium">
              Canvas height
            </label>
            <input
              id="canvasHeight"
              type="number"
              min={0}
              value={canvasHeight}
              className="h-7 rounded bg-black/5 px-2 text-base"
              onChange={(e) => setCanvasHeight(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="worldWidth" className="text-sm font-medium">
              World width
            </label>
            <input
              id="worldWidth"
              type="number"
              min={0}
              value={worldWidth}
              className="h-7 rounded bg-black/5 px-2 text-base"
              onChange={(e) => setWorldWidth(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="worldHeight" className="text-sm font-medium">
              World height
            </label>
            <input
              id="worldHeight"
              type="number"
              min={0}
              value={worldHeight}
              className="h-7 rounded bg-black/5 px-2 text-base"
              onChange={(e) => setWorldHeight(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="fit" className="text-sm font-medium">
              Fit
            </label>
            <select
              id="fit"
              className="h-7 appearance-none rounded bg-black/5 px-2 text-base"
              value={fit}
              onChange={(e) => setFit(e.target.value as 'cover' | 'contain' | 'crop')}
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="crop">Crop</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="originX" className="text-sm font-medium">
              Origin X
            </label>
            <input
              id="originX"
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={originX}
              className="h-7 rounded bg-black/5 px-2 text-base"
              onChange={(e) => setOriginX(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="originY" className="text-sm font-medium">
              Origin Y
            </label>
            <input
              id="originY"
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={originY}
              className="h-7 rounded bg-black/5 px-2 text-base"
              onChange={(e) => setOriginY(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="scale" className="text-sm font-medium">
              Scale
            </label>
            <input
                id="scale"
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={scale}
                className="h-7 rounded bg-black/5 px-2 text-base"
                onChange={(e) => setScale(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

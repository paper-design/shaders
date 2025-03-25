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

out vec4 fragColor;

void main() {

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 world = vec2(u_worldWidth, u_worldHeight) * u_pixelRatio;
  vec2 origin = vec2(.5 - u_originX, u_originY - .5);

  uv -= .5;
  
  vec2 scale = u_resolution / world;
  uv *= scale;
  uv += origin * (scale - 1.);

  float ring_shape = 1. - smoothstep(.1, .5, length(uv));
  vec3 color = normalize(vec3(.4, .2, 1.)) * 2. * ring_shape;

  color = mix(color, vec3(.4), 1. - step(uv.x, .5));
  color = mix(color, vec3(.4), 1. - step(uv.y, .5));
  color = mix(color, vec3(.4), step(uv.x, -.5));
  color = mix(color, vec3(.4), step(uv.y, -.5));

  fragColor = vec4(color, 1.);
}
`;

export default function Page() {
  // React scaffolding
  const [fit, setFit] = useState<'crop' | 'cover' | 'contain'>('contain');
  const [image, setImage] = useState('image-square.png');
  const [canvasWidth, setCanvasWidth] = useState(300);
  const [canvasHeight, setCanvasHeight] = useState(650);
  const [worldWidth, setWorldWidth] = useState(400);
  const [worldHeight, setWorldHeight] = useState(100);
  const [originX, setOriginX] = useState(0.5);
  const [originY, setOriginY] = useState(0.5);
  const imageAspectRatio = image.includes('square') ? 1 : image.includes('landscape') ? 2 : 0.5;

  // Sizes
  const renderedWorldWidth = Math.max(canvasWidth, worldWidth);
  const renderedWorldHeight = Math.max(canvasHeight, worldHeight);

  const imageWidth = (() => {
    if (fit === 'cover') {
      return imageAspectRatio * Math.max(renderedWorldWidth / imageAspectRatio, renderedWorldHeight);
    }

    if (fit === 'contain') {
      return imageAspectRatio * Math.min(renderedWorldWidth / imageAspectRatio, renderedWorldHeight);
    }

    // fit === 'crop'
    return imageAspectRatio * Math.min(worldWidth / imageAspectRatio, worldHeight);
  })();

  const imageHeight = imageWidth / imageAspectRatio;
  const imageOffsetX = (canvasWidth - imageWidth) * originX;
  const imageOffsetY = (canvasHeight - imageHeight) * originY;

  return (
    <div className="grid min-h-dvh grid-cols-[1fr_300px] bg-[#333]">
      <div className="flex h-screen flex-row items-center justify-around">
        {/*<div className="flex h-screen flex-col items-center justify-around">*/}
        <div
          className="bg-gray relative overflow-hidden bg-black outline outline-black"
          style={{
            width: canvasWidth,
            height: canvasHeight,
          }}
        >
          <span className="absolute text-red-50">img</span>
          <img
            src={`/${image}`}
            alt=""
            className="block size-1 max-w-none outline-dotted -outline-offset-1 outline-[red]"
            style={{
              width: imageWidth,
              height: imageHeight,
              translate: `${imageOffsetX}px ${imageOffsetY}px`,
            }}
          />
        </div>
        <div
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            position: 'relative',
          }}
        >
          <span className="absolute text-red-50">shader</span>
          <ShaderMount
            style={{ width: '100%', height: '100%' }}
            fragmentShader={fragmentShader}
            uniforms={{
              u_worldWidth: imageWidth,
              u_worldHeight: imageHeight,
              u_originX: originX,
              u_originY: originY,
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
            <label htmlFor="aspectRatio" className="text-sm font-medium">
              Image aspect ratio
            </label>
            <select
              id="aspectRatio"
              className="h-7 appearance-none rounded bg-black/5 px-2 text-base"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            >
              <option value="image-square.png">Square 1:1</option>
              <option value="image-landscape.webp">Landscape 2:1</option>
              <option value="image-portrait.webp">Portrait 1:2</option>
            </select>
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

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-black/50">
              Rendered world width: {Math.round(renderedWorldWidth)}
            </span>
            <span className="text-sm font-medium text-black/50">
              Rendered world height: {Math.round(renderedWorldHeight)}
            </span>

            {/* <span className="text-sm font-medium text-black/50">
              Rendered aspect ratio: {renderAspectRatio.toFixed(3)}
            </span> */}

            {/* <span className="text-sm font-medium text-black/50">Fit size: {Math.round(fitSize)}</span> */}

            <span className="text-sm font-medium text-black/50">Origin offset X: {Math.round(imageOffsetX)}</span>
            <span className="text-sm font-medium text-black/50">Origin offset Y: {Math.round(imageOffsetY)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

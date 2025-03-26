/* eslint-disable @next/next/no-img-element */

'use client';
import { useRef, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { ShaderMount } from '@paper-design/shaders-react';

const fragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;

out vec4 fragColor;


float get_uv_frame(vec2 uv) {
  return step(1e-3, uv.x) * step(uv.x, 1. - 1e-3) * step(1e-3, uv.y) * step(uv.y, 1. - 1e-3);
}

void main() {

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 world = vec2(u_worldWidth, u_worldHeight) * u_pixelRatio;
  vec2 origin = vec2(-u_originX, 1. - u_originY);
  
  vec2 scale = u_resolution / world;
  uv *= scale;
  uv.y = 1. - uv.y;
  uv += origin * (scale - 1.);
  
  vec2 effect_uv = uv;

  float effect = .03 * sin(effect_uv.x * 22.1 - effect_uv.y * 22.05);

  vec4 img = texture(u_texture, uv + effect);
  vec4 background = vec4(.2, .2, .2, 1.);
  
  float frame = get_uv_frame(uv + effect);
  vec4 color = mix(background, img, frame);

  color.a = mix(0., color.a, frame);
  
  fragColor = color;
}`;

export default function Page() {
  // React scaffolding
  const [fit, setFit] = useState<'crop' | 'cover' | 'contain'>('crop');
  const [canvasWidth, setCanvasWidth] = useState(400);
  const [canvasHeight, setCanvasHeight] = useState(200);
  const [worldWidth, setWorldWidth] = useState(400);
  const [worldHeight, setWorldHeight] = useState(400);
  const [originX, setOriginX] = useState(0.5);
  const [originY, setOriginY] = useState(0.5);


  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    const img = new Image();
    // img.src = '/image-landscape.webp';
    img.src = '/image-portrait.webp';
    img.onload = () => {
      setImage(img);
      setImageAspectRatio(img.naturalWidth / img.naturalHeight);
    };
  }, []);

  const canvasResizeObserver = useRef<ResizeObserver | null>(null);
  const canvasNodeRef = useRef<HTMLDivElement>(null);

  // Sizes
  const renderedWorldWidth = Math.max(canvasWidth, worldWidth);
  const renderedWorldHeight = Math.max(canvasHeight, worldHeight);

  const imageWidth = (() => {
    if (!imageAspectRatio) return 0;

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

  if (image === null) {
    return null;
  }


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
              u_texture: image,
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
          </div>
        </div>
      </div>
    </div>
  );
}

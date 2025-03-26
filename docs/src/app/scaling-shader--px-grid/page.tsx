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


out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy;
  uv.y = u_resolution.y - uv.y;

  uv /= u_pixelRatio;

  vec2 gridSpacing = vec2(50.);
  vec2 grid = fract(uv / gridSpacing) + 1e-4;
  vec2 grid_idx = floor(uv / gridSpacing);

  vec2 center = vec2(0.5) - 1e-3;
  vec2 p = (grid - center) * gridSpacing;

  float baseSize = 15.;

  float dist = length(p);

  float edgeWidth = fwidth(dist);
  float shapeInner = smoothstep(baseSize + edgeWidth, baseSize - edgeWidth, dist);

  vec3 color = vec3(shapeInner);

  float opacity = 1.;

  fragColor = vec4(color, opacity);
}
`;

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

  if (imageAspectRatio === null) {
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

        </div>
      </div>
    </div>
  );
}

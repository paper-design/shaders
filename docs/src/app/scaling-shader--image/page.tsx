/* eslint-disable @next/next/no-img-element */

'use client';
import { useRef, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { ShaderMount } from '@paper-design/shaders-react';

const fragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform float u_texture_aspect_ratio;

uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_time;

uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;

uniform float u_scale;
uniform float u_offsetX;
uniform float u_offsetY;

out vec4 fragColor;


float get_uv_frame(vec2 uv) {
  return step(1e-3, uv.x) * step(uv.x, 1. - 1e-3) * step(1e-3, uv.y) * step(uv.y, 1. - 1e-3);
}

void main() {

  // ===============================================
  // START OF API INSERTION 

  vec2 worldSize = vec2(u_worldWidth, u_worldHeight) * u_pixelRatio;
  float worldRatio = worldSize.x / max(worldSize.y, 1e-4);
  //   float worldRatio = u_texture_aspect_ratio;
  
  float maxWidth = max(u_resolution.x, worldSize.x);
  float maxHeight = max(u_resolution.y, worldSize.y);

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
  uv += vec2(-u_offsetX, u_offsetY) / scale;

  uv += origin * (1. - 1. / scale);
  uv /= u_scale;
  uv *= u_resolution.xy;
  uv /= u_pixelRatio;
  if (u_fit > 0.) {
    uv *= (imageWidthCrop / imageWidth);
  }

  // END OF API INSERTION 
  // ===============================================
  
  uv *= .003;
  
  float t = .0 * u_time;

  vec2 dist = abs(worldBox - .5);  
  float box = (step(max(dist.x, dist.y), .5) - step(max(dist.x, dist.y), .495));
    
  vec2 effect_uv = uv;

  float effect = .03 * sin(effect_uv.x * 22.1 - effect_uv.y * 22.05);

  vec4 img = texture(u_texture, worldBox + effect);
  vec4 background = vec4(.2, .2, .2, 1.);

  float frame = get_uv_frame(worldBox + effect);
  vec4 color = mix(background, img, frame);
  
  color.r = box;

  color.a = mix(0., color.a, frame) + box;
  fragColor = color;
}`;

export default function Page() {
  // React scaffolding
  const [fit, setFit] = useState<'crop' | 'cover' | 'contain'>('crop');
  const [canvasWidth, setCanvasWidth] = useState(600);
  const [canvasHeight, setCanvasHeight] = useState(400);
  const [worldWidth, setWorldWidth] = useState(300);
  const [worldHeight, setWorldHeight] = useState(300);
  const [originX, setOriginX] = useState(0.5);
  const [originY, setOriginY] = useState(0.5);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
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

  const fitCode = (fit === 'crop' ? 0 : (fit === 'cover' ? 1 : 2));

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
              u_worldWidth: worldWidth,
              u_worldHeight: worldHeight,
              u_fit: fitCode,
              u_originX: originX,
              u_originY: originY,
              u_scale: scale,
              u_offsetX: offsetX,
              u_offsetY: offsetY,
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
              <span>Scale</span>
              <span> {scale}</span>
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

          <div className="flex flex-col gap-1">
            <label htmlFor="offsetX" className="text-sm font-medium">
              <span>OffsetX</span>
              <span> {offsetX}</span>
            </label>
            <input
                id="offsetX"
                type="range"
                min={-1}
                max={1}
                step={0.01}
                value={offsetX}
                className="h-7 rounded bg-black/5 px-2 text-base"
                onChange={(e) => setOffsetX(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="offsetY" className="text-sm font-medium">
              <span>offsetY</span>
              <span> {offsetY}</span>
            </label>
            <input
                id="offsetY"
                type="range"
                min={-1}
                max={1}
                step={0.01}
                value={offsetY}
                className="h-7 rounded bg-black/5 px-2 text-base"
                onChange={(e) => setOffsetY(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

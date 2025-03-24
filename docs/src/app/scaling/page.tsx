/* eslint-disable @next/next/no-img-element */
'use client';
import { useRef, useState } from 'react';

export default function Page() {
  const [fit, setFit] = useState<'crop' | 'cover' | 'contain'>('cover');

  const [canvasWidth, setCanvasWidth] = useState(100);
  const [canvasHeight, setCanvasHeight] = useState(100);

  const [worldWidth, setWorldWidth] = useState(100);
  const [worldHeight, setWorldHeight] = useState(100);

  const [originX, setOriginX] = useState(0.5);
  const [originY, setOriginY] = useState(0.5);

  const [imageWidth, setImageWidth] = useState(100);
  const [imageHeight, setImageHeight] = useState(100);

  const canvasResizeObserver = useRef<ResizeObserver | null>(null);
  const canvasNodeRef = useRef<HTMLDivElement>(null);

  const worldNodeRef = useRef<HTMLDivElement>(null);
  const worldResizeObserver = useRef<ResizeObserver | null>(null);

  return (
    <div className="grid min-h-dvh grid-cols-[1fr_300px] bg-[#333]">
      <div className="jusify-center relative flex flex-col items-center self-center">
        <div
          className="bg-gray absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 resize overflow-hidden bg-black outline outline-black"
          style={{
            width: canvasWidth,
            height: canvasHeight,
          }}
          ref={(node) => {
            canvasNodeRef.current = node;
            canvasResizeObserver.current?.disconnect();

            if (node) {
              canvasResizeObserver.current = new ResizeObserver(() => {
                setCanvasWidth(node.clientWidth);
                setCanvasHeight(node.clientHeight);
              });

              canvasResizeObserver.current.observe(node);
            }
          }}
        >
          <div
            className="absolute resize overflow-hidden bg-black outline-dotted -outline-offset-1 outline-[red]"
            style={{
              width: worldWidth,
              height: worldHeight,
            }}
            ref={(node) => {
              worldNodeRef.current = node;
              worldResizeObserver.current?.disconnect();

              if (node) {
                worldResizeObserver.current = new ResizeObserver(() => {
                  setWorldWidth(node.clientWidth);
                  setWorldHeight(node.clientHeight);
                });

                worldResizeObserver.current.observe(node);
              }
            }}
          >
            <img src="/image.webp" alt="" className="max-w-none" width={imageWidth} height={imageHeight} />
          </div>
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
        </div>
      </div>
    </div>
  );
}

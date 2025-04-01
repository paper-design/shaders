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
uniform float u_offsetX;
uniform float u_offsetY;

out vec4 fragColor;

#define TWO_PI 6.28318530718

float hash(float x) {
  return fract(sin(x) * 43758.5453123);
}
float lerp(float a, float b, float t) {
  return a + t * (b - a);
}
float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f); // Smoothstep function for interpolation
  return lerp(hash(i), hash(i + 1.0), u);
}

float get_ball_shape(vec2 uv, vec2 c, float p) {
  float s = .5 * length(uv - c);
  s = 1. - clamp(s, 0., 1.);
  s = pow(s, p);
  return s;
}

void main() {

  vec2 worldSize = vec2(u_worldWidth, u_worldHeight) * u_pixelRatio;
  float worldRatio = 1.;

  float maxWidth = max(u_resolution.x, worldSize.x);
  float maxHeight = max(u_resolution.y, worldSize.y);

  // crop
  float imageWidth = worldRatio * min(worldSize.x / worldRatio, worldSize.y);
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

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv -= .5;
  uv *= scale;
  uv += origin * (scale - 1.);
  uv /= u_scale;
  uv += .5;

  vec2 worldBox = uv;
  uv += vec2(-u_offsetX, u_offsetY);

  float t = .5 * u_time;

  vec4 u_color1 = vec4(1., .4, .7, 1.);
  vec4 u_color2 = vec4(1., 1., .7, 1.);
  vec4 u_color3 = vec4(0., .4, .7, 1.);
  float u_visibilityRange = .7;

  vec3 total_color = vec3(0.);
  float total_shape = 0.;

  const int max_balls_number = 15;

  for (int i = 0; i < max_balls_number; i++) {
    vec2 pos = vec2(.5 + 1e-4);
    float idx_fract = float(i) / float(max_balls_number);
    float angle = TWO_PI * idx_fract;

    float speed = 1. - .2 * idx_fract;
    float noiseX = noise(angle * 10. + float(i) + t * speed);
    float noiseY = noise(angle * 20. + float(i) - t * speed);

    pos += .9 * (vec2(noiseX, noiseY) - .5);

    vec4 ball_color;
    if (i % 3 == 0) {
      ball_color = u_color1;
    } else if (i % 3 == 1) {
      ball_color = u_color2;
    } else {
      ball_color = u_color3;
    }

    float shape = get_ball_shape(uv, pos, 30.) * ball_color.a;

    shape *= smoothstep((float(i) - 1.) / float(max_balls_number), idx_fract, u_visibilityRange);

    total_color += ball_color.rgb * shape;
    total_shape += shape;
  }

  total_color /= max(total_shape, 1e-4);

  float edge_width = fwidth(total_shape);
  float final_shape = smoothstep(.4, .4 + edge_width, total_shape);

  vec3 color = total_color * final_shape;

  vec2 dist = abs(worldBox - .5);
  float box = (step(max(dist.x, dist.y), .5) - step(max(dist.x, dist.y), .495));
  color.r = box;

  float opacity = 1.;

  fragColor = vec4(color, opacity);
}
`;
export default function Page() {
  // React scaffolding
  const [fit, setFit] = useState<'crop' | 'cover' | 'contain'>('contain');
  const [canvasWidth, setCanvasWidth] = useState(400);
  const [canvasHeight, setCanvasHeight] = useState(200);
  const [worldWidth, setWorldWidth] = useState(400);
  const [worldHeight, setWorldHeight] = useState(200);
  const [originX, setOriginX] = useState(0.5);
  const [originY, setOriginY] = useState(0.5);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const canvasResizeObserver = useRef<ResizeObserver | null>(null);
  const canvasNodeRef = useRef<HTMLDivElement>(null);

  const fitCode = fit === 'crop' ? 0 : fit === 'cover' ? 1 : 2;

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

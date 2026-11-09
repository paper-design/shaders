'use client';

import Link from 'next/link';
import {
  FlutedGlass,
  HalftoneCmyk,
  HalftoneDots,
  ImageDithering,
  LensDistortion,
  PaperTexture,
  Water,
} from '@paper-design/shaders-react';
import './supported-shaders.css';

const shaders: { name: string; Shader: React.ComponentType<any>; params: Record<string, unknown> }[] = [
  {
    name: 'paper texture',
    Shader: PaperTexture,
    params: {
      colorBack: '#00000000',
      clip: true,
      colorShadow: '#aaaaaa',
      distortion: -0.8,
      angle: 15,
      roughness: 0.3,
      fiber: 0.3,
      fiberSize: 0.72,
      wrinkleSize: 0.5,
      drops: 0.5,
      seed: 311,
    },
  },
  {
    name: 'fluted glass',
    Shader: FlutedGlass,
    params: {
      originX: 0,
      originY: 0,
      colorShadow: '#ff9e66',
      shadows: 0.4,
      highlights: 0,
      blur: 0,
      edges: 0,
      marginLeft: 0,
      marginRight: 0,
      marginTop: 0,
      marginBottom: 0.5,
      size: 0.7,
      distortion: 0.2,
    },
  },
  {
    name: 'water',
    Shader: Water,
    params: {
      originX: 0,
      originY: 0,
      colorBack: '#00000000',
      colorHighlight: '#eeeeff',
      highlights: 0.25,
      layering: 0.5,
      waves: 0.1,
      caustic: 0.03,
      size: 0.4,
      edges: 0,
    },
  },
  {
    name: 'image dithering',
    Shader: ImageDithering,
    params: {
      originX: 0,
      originY: 0,
      colorFront: '#fff3a8',
      colorHighlight: '#ff00f7',
      originalColors: true,
      type: '8x8',
      size: 2,
      colorSteps: 2,
    },
  },
  {
    name: 'halftone dots',
    Shader: HalftoneDots,
    params: {
      originX: 0,
      originY: 0,
      colorBack: '#fff6d6',
      grainMixer: 0,
      radius: 1.7,
      contrast: 0.18,
      size: 0.15,
      grainOverlay: 0,
    },
  },
  {
    name: 'halftone cmyk',
    Shader: HalftoneCmyk,
    params: {
      originX: 0,
      originY: 0,
      size: 0.05,
      gridNoise: 0.5,
      softness: 0.5,
      contrast: 1.2,
      gainC: 0,
      gainY: 0,
      floodC: 0,
      grainSize: 0,
    },
  },
  {
    name: 'lens distortion',
    Shader: LensDistortion,
    params: {
      spread: 0.1,
      bias: 0,
      angle: 28,
      perspective: 1,
      count: 50,
      focusCenter: 0.5,
      focusEdges: 0,
      swirl: 0,
      noise: 0,
      lensBulge: 0.1,
      dispersionColor: 0.75,
    },
  },
];

const hoverSpeed = 4;

function setBallSpeed(tile: HTMLElement, speed: number) {
  tile.querySelectorAll('i').forEach((ball) => {
    ball.getAnimations().forEach((animation) => animation.updatePlaybackRate(speed));
  });
}

function handleTileEnter(event: React.PointerEvent<HTMLDivElement>) {
  const tile = event.currentTarget;
  tile.dataset.colorway = String((Number(tile.dataset.colorway ?? 0) + 1) % 3);
  setBallSpeed(tile, hoverSpeed);
}

function handleTileLeave(event: React.PointerEvent<HTMLDivElement>) {
  setBallSpeed(event.currentTarget, 1);
}

export function SupportedShaders() {
  return (
    <div className="grid grid-cols-1 gap-32 text-lg xs:grid-cols-2 md:gap-48 lg:grid-cols-3 2xl:grid-cols-4 3xl:gap-64">
      {shaders.map(({ name, Shader, params }) => (
        <Link
          key={name}
          href={`/${name.replace(/ /g, '-')}/html-in-canvas`}
          className="group flex flex-col gap-8 no-underline outline-0"
        >
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-header/50 outline-offset-4 outline-focus will-change-transform group-focus-visible:outline-2 squircle:rounded-4xl"
            onPointerEnter={handleTileEnter}
            onPointerLeave={handleTileLeave}
          >
            <Shader {...params} style={{ position: 'absolute', inset: 0 }}>
              <div className="colorway" aria-hidden>
                <i />
                <i />
                <i />
                <p>
                  HTML
                  <br />
                  in
                  <br />
                  canvas
                </p>
              </div>
            </Shader>
          </div>
          <div className="text-center">{name}</div>
        </Link>
      ))}
    </div>
  );
}

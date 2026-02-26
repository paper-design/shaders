'use client';

import { useState, useCallback } from 'react';
import {
  ColorPanels,
  Dithering,
  DotGrid,
  DotOrbit,
  FlutedGlass,
  GodRays,
  GrainGradient,
  HalftoneCmyk,
  HalftoneDots,
  Heatmap,
  ImageDithering,
  LiquidMetal,
  MeshGradient,
  Metaballs,
  NeuroNoise,
  PaperTexture,
  PerlinNoise,
  PulsingBorder,
  SimplexNoise,
  SmokeRing,
  Spiral,
  StaticMeshGradient,
  StaticRadialGradient,
  Swirl,
  Voronoi,
  Warp,
  Water,
  Waves,
} from '@paper-design/shaders-react';
import type { ReactElement } from 'react';

const sampleImage = 'https://shaders.paper.design/images/image-filters/0018.webp';
const sampleSvg = 'https://shaders.paper.design/images/logos/diamond.svg';

const shaderFactories: Array<(key: string) => ReactElement> = [
  (key) => <FlutedGlass key={key} image={sampleImage} />,
  (key) => <PaperTexture key={key} image={sampleImage} />,
  (key) => <Water key={key} image={sampleImage} />,
  (key) => <ImageDithering key={key} image={sampleImage} />,
  (key) => <Heatmap key={key} image={sampleSvg} />,
  (key) => <LiquidMetal key={key} image={sampleSvg} />,
  (key) => <HalftoneDots key={key} image={sampleImage} />,
  (key) => <HalftoneCmyk key={key} image={sampleImage} />,
  (key) => <MeshGradient key={key} />,
  (key) => <SmokeRing key={key} />,
  (key) => <NeuroNoise key={key} />,
  (key) => <DotOrbit key={key} />,
  (key) => <DotGrid key={key} />,
  (key) => <SimplexNoise key={key} />,
  (key) => <Metaballs key={key} />,
  (key) => <Waves key={key} />,
  (key) => <PerlinNoise key={key} />,
  (key) => <Voronoi key={key} />,
  (key) => <Warp key={key} />,
  (key) => <GodRays key={key} />,
  (key) => <Spiral key={key} />,
  (key) => <Swirl key={key} />,
  (key) => <Dithering key={key} />,
  (key) => <GrainGradient key={key} />,
  (key) => <PulsingBorder key={key} />,
  (key) => <ColorPanels key={key} />,
  (key) => <StaticMeshGradient key={key} />,
  (key) => <StaticRadialGradient key={key} />,
];

let nextId = 0;

export default function TestPage() {
  const [shaders, setShaders] = useState<ReactElement[]>([]);

  const addShader = useCallback(() => {
    const factory = shaderFactories[Math.floor(Math.random() * shaderFactories.length)]!;
    const id = `shader-${nextId++}`;
    setShaders((prev) => [...prev, factory(id)]);
  }, []);

  const removeShader = useCallback(() => {
    setShaders((prev) => prev.slice(0, -1));
  }, []);

  return (
    <div>
      <div style={{ padding: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={addShader} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Add shader
        </button>
        <button
          onClick={removeShader}
          disabled={shaders.length === 0}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Remove shader
        </button>
        <span style={{ color: '#888' }}>{shaders.length} shaders</span>
      </div>
      <div className="grid grid-cols-4 *:aspect-video">{shaders}</div>
    </div>
  );
}

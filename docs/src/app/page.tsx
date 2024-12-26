'use client';

import meshGradientImg from '../../public/shaders/mesh-gradient.webp';
import simplexNoiseImg from '../../public/shaders/simplex-noise.webp';
import grainCloudsImg from '../../public/shaders/grain-clouds.webp';
import neuroNoiseImg from '../../public/shaders/neuro-noise.webp';
import dotOrbitImg from '../../public/shaders/dot-orbit.webp';
import smokeRingImg from '../../public/shaders/smoke-ring.webp';
import metaballsImg from '../../public/shaders/metaballs.webp';
import { ShaderItem } from './shader-item';
import {
  DotsOrbit,
  GrainClouds,
  MeshGradient,
  Metaballs,
  NeuroNoise,
  SmokeRing,
  SteppedSimplexNoise,
} from '@paper-design/shaders-react';
import { GithubIcon } from '@/icons';
import Link from 'next/link';

const shaders = [
  {
    name: 'simplex noise',
    image: simplexNoiseImg,
    url: '/stepped-simplex-noise',
    ShaderComponent: SteppedSimplexNoise,
    shaderConfig: {
      color1: '#56758f',
      color2: '#91be6f',
      color3: '#f94346',
      color4: '#f9c54e',
      color5: '#ffffff',
      scale: 1.5,
      speed: 0.25,
      stepsNumber: 13,
    },
  },
  {
    name: 'grain clouds',
    image: grainCloudsImg,
    url: '/grain-clouds',
    ShaderComponent: GrainClouds,
    shaderConfig: {
      color1: '#73a6ff',
      color2: '#ffffff',
      scale: 0.7,
      grainAmount: 0,
      speed: 0.3,
    },
  },
  {
    name: 'mesh gradient',
    image: meshGradientImg,
    url: '/mesh-gradient',
    ShaderComponent: MeshGradient,
    shaderConfig: { speed: 0.2 },
  },
  {
    name: 'neuro noise',
    image: neuroNoiseImg,
    url: '/neuro-noise',
    ShaderComponent: NeuroNoise,
    shaderConfig: { scale: 2.5 },
  },
  {
    name: 'dot orbit',
    image: dotOrbitImg,
    url: '/dots-orbit',
    ShaderComponent: DotsOrbit,
    shaderConfig: {
      color1: '#cf2a30',
      color2: '#396a4e',
      color3: '#f0a519',
      color4: '#5d3f73',
      dotSize: 0.15,
      dotSizeRange: 0.05,
      scale: 16,
      speed: 2,
      spreading: 0.25,
    },
  },
  {
    name: 'smoke ring',
    image: smokeRingImg,
    url: '/smoke-ring',
    ShaderComponent: SmokeRing,
    shaderConfig: {
      colorBack: '#3d84ff',
      color1: '#ffffff',
      color2: '#ffffff',
      speed: 1,
      thickness: 0.7,
      noiseScale: 1.8,
    },
  },
  {
    name: 'metaballs',
    image: metaballsImg,
    url: '/metaballs',
    ShaderComponent: Metaballs,
    shaderConfig: {
      color1: '#f42547',
      color2: '#eb4763',
      color3: '#f49d71',
      scale: 7,
      speed: 0.6,
      dotSize: 1,
      visibilityRange: 0.4,
      seed: 0,
    },
  },
];

export default function Home() {
  return (
    <>
      <header className="bg-[#f7f6f0] pt-5 pb-32">
        <div className="container mx-auto max-w-screen-lg px-4">
          <div className="flex justify-between mb-5 items-center">
            <div className="font-semibold text-xl">Paper</div>
            <Link href="https://github.com/paper-design/shaders" target="_blank">
              <GithubIcon className="size-8" />
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-center max-w-64 mx-auto">
            <h1 className="text-4xl font-bold">Paper Shaders</h1>
            <p className="text-lg text-gray-600">ultra fast zero-dependency shaders for your designs</p>
          </div>
        </div>
      </header>
      <main className="-mt-12 pb-16">
        <div className="container mx-auto max-w-screen-lg px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-16 gap-x-16 gap-y-8 md:gap-y-16">
            {shaders.map((shader) => (
              <ShaderItem key={shader.name} {...shader} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

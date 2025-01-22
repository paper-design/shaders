import meshGradientImg from '../public/shaders/mesh-gradient.webp';
import simplexNoiseImg from '../public/shaders/simplex-noise.webp';
import grainCloudsImg from '../public/shaders/grain-clouds.webp';
import neuroNoiseImg from '../public/shaders/neuro-noise.webp';
import dotOrbitImg from '../public/shaders/dot-orbit.webp';
import smokeRingImg from '../public/shaders/smoke-ring.webp';
import metaballsImg from '../public/shaders/metaballs.webp';

import {
  DotsGrid,
  DotsGridParams,
  DotsGridShapes,
  DotsOrbit,
  DotsOrbitParams,
  GrainClouds,
  GrainCloudsParams,
  MeshGradient,
  MeshGradientParams,
  Metaballs,
  MetaballsParams,
  NeuroNoise,
  NeuroNoiseParams,
  SmokeRing,
  SmokeRingParams,
  SteppedSimplexNoise,
  SteppedSimplexNoiseParams,
  Voronoi,
  VoronoiParams,
  Waves,
  WavesParams,
  wavesPresets,
  PerlinNoise,
  RadialSwirl,
  radialSwirlPresets,
} from '@paper-design/shaders-react';
import { StaticImageData } from 'next/image';

type HomeShaderConfig = {
  name: string;
  image?: StaticImageData;
  url: string;
  ShaderComponent: React.ComponentType;
  shaderConfig: Record<string, unknown>;
};

export const homeShaders = [
  {
    name: 'simplex noise',
    image: simplexNoiseImg,
    url: '/stepped-simplex-noise',
    ShaderComponent: SteppedSimplexNoise,
  },
  {
    name: 'grain clouds',
    image: grainCloudsImg,
    url: '/grain-clouds',
    ShaderComponent: GrainClouds,
  },
  {
    name: 'mesh gradient',
    image: meshGradientImg,
    url: '/mesh-gradient',
    ShaderComponent: MeshGradient,
  },
  {
    name: 'neuro noise',
    image: neuroNoiseImg,
    url: '/neuro-noise',
    ShaderComponent: NeuroNoise,
  },
  {
    name: 'dot orbit',
    image: dotOrbitImg,
    url: '/dots-orbit',
    ShaderComponent: DotsOrbit,
  },
  {
    name: 'smoke ring',
    image: smokeRingImg,
    url: '/smoke-ring',
    ShaderComponent: SmokeRing,
  },
  {
    name: 'metaballs',
    image: metaballsImg,
    url: '/metaballs',
    ShaderComponent: Metaballs,
  },
  {
    name: 'dots grid',
    url: '/dots-grid',
    ShaderComponent: DotsGrid,
  },
  {
    name: 'perlin',
    url: '/perlin-noise',
    ShaderComponent: PerlinNoise,
  },
  {
    name: 'voronoi',
    url: '/voronoi',
    ShaderComponent: Voronoi,
  },
  {
    name: 'waves',
    url: '/waves',
    ShaderComponent: Waves,
  },
  {
    name: 'radial swirl',
    url: '/radial-swirl',
    ShaderComponent: RadialSwirl,
  },
] satisfies HomeShaderConfig[];

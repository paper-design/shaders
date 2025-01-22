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
    shaderConfig: {

    } satisfies SteppedSimplexNoiseParams,
  },
  {
    name: 'grain clouds',
    image: grainCloudsImg,
    url: '/grain-clouds',
    ShaderComponent: GrainClouds,
    shaderConfig: {
    } satisfies GrainCloudsParams,
  },
  {
    name: 'mesh gradient',
    image: meshGradientImg,
    url: '/mesh-gradient',
    ShaderComponent: MeshGradient,
    shaderConfig: {

    } satisfies MeshGradientParams,
  },
  {
    name: 'neuro noise',
    image: neuroNoiseImg,
    url: '/neuro-noise',
    ShaderComponent: NeuroNoise,
    shaderConfig: {

    } satisfies NeuroNoiseParams,
  },
  {
    name: 'dot orbit',
    image: dotOrbitImg,
    url: '/dots-orbit',
    ShaderComponent: DotsOrbit,
    shaderConfig: {

    } satisfies DotsOrbitParams,
  },
  {
    name: 'smoke ring',
    image: smokeRingImg,
    url: '/smoke-ring',
    ShaderComponent: SmokeRing,
    shaderConfig: {

    } satisfies SmokeRingParams,
  },
  {
    name: 'metaballs',
    image: metaballsImg,
    url: '/metaballs',
    ShaderComponent: Metaballs,
    shaderConfig: {

    } satisfies MetaballsParams,
  },
  {
    name: 'dots grid',
    url: '/dots-grid',
    ShaderComponent: DotsGrid,
    shaderConfig: {

    } satisfies DotsGridParams,
  },
  {
    name: 'voronoi',
    url: '/voronoi',
    ShaderComponent: Voronoi,
    shaderConfig: {

    } satisfies VoronoiParams,
  },
  {
    name: 'waves',
    url: '/waves',
    ShaderComponent: Waves,
    shaderConfig: wavesPresets[0].params,
  },
] satisfies HomeShaderConfig[];

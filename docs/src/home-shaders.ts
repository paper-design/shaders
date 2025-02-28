import meshGradientImg from '../public/shaders/mesh-gradient.webp';
import simplexNoiseImg from '../public/shaders/simplex-noise.webp';
import grainCloudsImg from '../public/shaders/grain-clouds.webp';
import neuroNoiseImg from '../public/shaders/neuro-noise.webp';
import dotOrbitImg from '../public/shaders/dot-orbit.webp';
import smokeRingImg from '../public/shaders/smoke-ring.webp';
import metaballsImg from '../public/shaders/metaballs.webp';

import {
  DotsGrid,
  dotsOrbitPresets,
  DotsOrbit,
  dotsGridPresets,
  GrainClouds,
  grainCloudsPresets,
  MeshGradient,
  meshGradientPresets,
  Metaballs,
  metaballsPresets,
  NeuroNoise,
  neuroNoisePresets,
  SmokeRing,
  smokeRingPresets,
  SteppedSimplexNoise,
  steppedSimplexNoisePresets,
  Voronoi,
  voronoiPresets,
  Waves,
  wavesPresets,
  PerlinNoise,
  perlinNoisePresets,
  Warp,
  warpPresets,
  GodRays,
  godRaysPresets,
  Spiral,
  spiralPresets,
} from '@paper-design/shaders-react';
import { StaticImageData } from 'next/image';
import TextureTest from './app/texture-test/page';

type HomeShaderConfig = {
  name: string;
  image?: StaticImageData;
  url: string;
  ShaderComponent: React.ComponentType;
  shaderConfig: Record<string, unknown>;
};

export const homeShaders = [
  {
    name: 'texture test',
    url: '/texture-test',
    ShaderComponent: TextureTest,
    shaderConfig: {},
  },
  {
    name: 'simplex noise',
    image: simplexNoiseImg,
    url: '/stepped-simplex-noise',
    ShaderComponent: SteppedSimplexNoise,
    shaderConfig: steppedSimplexNoisePresets[0].params,
  },
  {
    name: 'grain clouds',
    image: grainCloudsImg,
    url: '/grain-clouds',
    ShaderComponent: GrainClouds,
    shaderConfig: grainCloudsPresets[0].params,
  },
  {
    name: 'mesh gradient',
    image: meshGradientImg,
    url: '/mesh-gradient',
    ShaderComponent: MeshGradient,
    shaderConfig: meshGradientPresets[0].params,
  },
  {
    name: 'neuro noise',
    image: neuroNoiseImg,
    url: '/neuro-noise',
    ShaderComponent: NeuroNoise,
    shaderConfig: neuroNoisePresets[0].params,
  },
  {
    name: 'dot orbit',
    image: dotOrbitImg,
    url: '/dots-orbit',
    ShaderComponent: DotsOrbit,
    shaderConfig: dotsOrbitPresets[0].params,
  },
  {
    name: 'smoke ring',
    image: smokeRingImg,
    url: '/smoke-ring',
    ShaderComponent: SmokeRing,
    shaderConfig: smokeRingPresets[0].params,
  },
  {
    name: 'metaballs',
    image: metaballsImg,
    url: '/metaballs',
    ShaderComponent: Metaballs,
    shaderConfig: metaballsPresets[0].params,
  },
  {
    name: 'dots grid',
    url: '/dots-grid',
    ShaderComponent: DotsGrid,
    shaderConfig: dotsOrbitPresets[0].params,
  },
  {
    name: 'perlin',
    url: '/perlin-noise',
    ShaderComponent: PerlinNoise,
    shaderConfig: perlinNoisePresets[0].params,
  },
  {
    name: 'voronoi',
    url: '/voronoi',
    ShaderComponent: Voronoi,
    shaderConfig: voronoiPresets[0].params,
  },
  {
    name: 'waves',
    url: '/waves',
    ShaderComponent: Waves,
    shaderConfig: wavesPresets[0].params,
  },
  {
    name: 'warp',
    url: '/warp',
    ShaderComponent: Warp,
    shaderConfig: warpPresets[0].params,
  },
  {
    name: 'god rays',
    url: '/god-rays',
    ShaderComponent: GodRays,
    shaderConfig: godRaysPresets[0].params,
  },
  {
    name: 'spiral',
    url: '/spiral',
    ShaderComponent: Spiral,
    shaderConfig: spiralPresets[0].params,
  },
] satisfies HomeShaderConfig[];

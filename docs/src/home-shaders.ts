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
    shaderConfig: {
      color1: '#56758f',
      color2: '#91be6f',
      color3: '#f94346',
      color4: '#f9c54e',
      color5: '#ffffff',
      scale: 0.5,
      speed: 0.25,
      stepsNumber: 13,
    } satisfies SteppedSimplexNoiseParams,
  },
  {
    name: 'grain clouds',
    image: grainCloudsImg,
    url: '/grain-clouds',
    ShaderComponent: GrainClouds,
    shaderConfig: {
      color1: '#73a6ff',
      color2: '#ffffff',
      scale: 0.15,
      grainAmount: 0,
      speed: 0.3,
    } satisfies GrainCloudsParams,
  },
  {
    name: 'mesh gradient',
    image: meshGradientImg,
    url: '/mesh-gradient',
    ShaderComponent: MeshGradient,
    shaderConfig: { speed: 0.2 } satisfies MeshGradientParams,
  },
  {
    name: 'neuro noise',
    image: neuroNoiseImg,
    url: '/neuro-noise',
    ShaderComponent: NeuroNoise,
    shaderConfig: { scale: 0.4 } satisfies NeuroNoiseParams,
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
      dotSize: 0.14,
      dotSizeRange: 0.05,
      scale: 0.9,
      speed: 2,
      spreading: 0.25,
    } satisfies DotsOrbitParams,
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
    } satisfies SmokeRingParams,
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
    } satisfies MetaballsParams,
  },
  {
    name: 'dots grid',
    url: '/dots-grid',
    ShaderComponent: DotsGrid,
    shaderConfig: {
      colorBack: '#ffffff',
      colorFill: '#121212',
      colorStroke: '#f0a519',
      dotSize: 2,
      gridSpacingX: 22,
      gridSpacingY: 22,
      strokeWidth: 0,
      sizeRange: 0,
      opacityRange: 0,
      shape: DotsGridShapes.Circle,
    } satisfies DotsGridParams,
  },
  {
    name: 'voronoi',
    url: '/voronoi',
    ShaderComponent: Voronoi,
    shaderConfig: {
      color1: '#ffffff',
      color2: '#ffffff',
      color3: '#000000',
      colorEdges: '#000000',
      colorMid: '#000000',
      colorGradient: 1,
      scale: 3,
      distance: 0.45,
      edgesSize: 0.02,
      edgesSharpness: 0.07,
      middleSize: 0,
      middleSharpness: 0,
      speed: 0.8,
      seed: 0,
    } satisfies VoronoiParams,
  },
  {
    name: 'waves',
    url: '/waves',
    ShaderComponent: Waves,
    shaderConfig: wavesPresets[0].params,
  },
  {
    name: 'radial swirl',
    url: '/radial-swirl',
    ShaderComponent: RadialSwirl,
    shaderConfig: radialSwirlPresets[0].params,
  },
] satisfies HomeShaderConfig[];

import meshGradientImg from '../public/shaders/mesh-gradient.webp';
import simplexNoiseImg from '../public/shaders/simplex-noise.webp';
import neuroNoiseImg from '../public/shaders/neuro-noise.webp';
import perlinNoiseImg from '../public/shaders/perlin-noise.webp';
import dotGridImg from '../public/shaders/dot-grid.webp';
import dotOrbitImg from '../public/shaders/dot-orbit.webp';
import smokeRingImg from '../public/shaders/smoke-ring.webp';
import metaballsImg from '../public/shaders/metaballs.webp';
import voronoiImg from '../public/shaders/voronoi.webp';
import wavesImg from '../public/shaders/waves.webp';
import warpImg from '../public/shaders/warp.webp';
import godRaysImg from '../public/shaders/god-rays.webp';
import spiralImg from '../public/shaders/spiral.webp';

import {
  DotGrid,
  dotGridPresets,
  DotOrbit,
  dotOrbitPresets,
  MeshGradient,
  meshGradientPresets,
  Metaballs,
  metaballsPresets,
  NeuroNoise,
  neuroNoisePresets,
  SmokeRing,
  smokeRingPresets,
  SimplexNoise,
  simplexNoisePresets,
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
  Swirl,
  swirlPresets,
  Dithering,
  ditheringPresets,
  LiquidMetal,
  liquidMetalPresets,
  GrainGradient,
  grainGradientPresets,
  PulsingBorder,
  pulsingBorderPresets,
  BlobsGrid,
  blobsGridPresets,
} from '@paper-design/shaders-react';
import { StaticImageData } from 'next/image';
import TextureTest from './app/texture-test/page';

type HomeShaderConfig = {
  name: string;
  image?: StaticImageData;
  url: string;
  ShaderComponent: React.ComponentType;
  shaderConfig?: Record<string, unknown>;
  style?: React.CSSProperties;
};

export const homeShaders = [
  // {
  //   name: 'texture test',
  //   url: '/texture-test',
  //   ShaderComponent: TextureTest,
  //   shaderConfig: {},
  // },
  {
    name: 'simplex noise',
    image: simplexNoiseImg,
    url: '/simplex-noise',
    ShaderComponent: SimplexNoise,
    shaderConfig: { ...simplexNoisePresets[0].params, scale: 0.35 },
  },
  {
    name: 'mesh gradient',
    image: meshGradientImg,
    url: '/mesh-gradient',
    ShaderComponent: MeshGradient,
    shaderConfig: { ...meshGradientPresets[0].params },
  },
  {
    name: 'neuro noise',
    image: neuroNoiseImg,
    url: '/neuro-noise',
    ShaderComponent: NeuroNoise,
    shaderConfig: { ...neuroNoisePresets[0].params },
  },
  {
    name: 'dot orbit',
    image: dotOrbitImg,
    url: '/dot-orbit',
    ShaderComponent: DotOrbit,
    shaderConfig: { ...dotOrbitPresets[0].params, scale: 0.35 },
  },
  {
    name: 'smoke ring',
    image: smokeRingImg,
    url: '/smoke-ring',
    ShaderComponent: SmokeRing,
    shaderConfig: { ...smokeRingPresets[3].params },
  },
  {
    name: 'metaballs',
    image: metaballsImg,
    url: '/metaballs',
    ShaderComponent: Metaballs,
    shaderConfig: { ...metaballsPresets[0].params },
  },
  {
    name: 'dot grid',
    url: '/dot-grid',
    ShaderComponent: DotGrid,
    image: dotGridImg,
    shaderConfig: { ...dotGridPresets[0].params, scale: 0.4 },
  },
  {
    name: 'perlin',
    url: '/perlin-noise',
    ShaderComponent: PerlinNoise,
    image: perlinNoiseImg,
    shaderConfig: { ...perlinNoisePresets[1].params, scale: 0.8 },
  },
  {
    name: 'voronoi',
    url: '/voronoi',
    ShaderComponent: Voronoi,
    image: voronoiImg,
    shaderConfig: { ...voronoiPresets[0].params, scale: 0.5 },
  },
  {
    name: 'waves',
    url: '/waves',
    ShaderComponent: Waves,
    image: wavesImg,
    shaderConfig: { ...wavesPresets[0].params, shape: 1 },
  },
  {
    name: 'warp',
    url: '/warp',
    ShaderComponent: Warp,
    image: warpImg,
    shaderConfig: { ...warpPresets[2].params, scale: 0.25 },
  },
  {
    name: 'god rays',
    url: '/god-rays',
    ShaderComponent: GodRays,
    image: godRaysImg,
    shaderConfig: { ...godRaysPresets[0].params, offsetX: -1.1, midSize: 7 },
  },
  {
    name: 'spiral',
    url: '/spiral',
    ShaderComponent: Spiral,
    image: spiralImg,
    shaderConfig: { ...spiralPresets[1].params },
  },
  {
    name: 'swirl',
    url: '/swirl',
    ShaderComponent: Swirl,
    shaderConfig: { ...swirlPresets[0].params },
  },
  {
    name: 'dithering',
    url: '/dithering',
    ShaderComponent: Dithering,
    shaderConfig: { ...ditheringPresets[0].params },
  },
  {
    name: 'liquid metal',
    url: '/liquid-metal',
    ShaderComponent: LiquidMetal,
    shaderConfig: { ...liquidMetalPresets[0].params },
  },
  {
    name: 'grain gradient',
    url: '/grain-gradient',
    ShaderComponent: GrainGradient,
    shaderConfig: { ...grainGradientPresets[0].params },
  },
  {
    name: 'pulsing border',
    url: '/pulsing-border',
    ShaderComponent: PulsingBorder,
    shaderConfig: { ...pulsingBorderPresets[0].params },
  },
  {
    name: 'blobs grid',
    url: '/blobs-grid',
    ShaderComponent: BlobsGrid,
    shaderConfig: { ...blobsGridPresets[0].params },
  },
] satisfies HomeShaderConfig[];

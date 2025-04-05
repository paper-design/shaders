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
  dotOrbitPresets,
  DotOrbit,
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
  PerlinNoise,
  perlinNoisePresets,
  Warp,
  warpPresets,
  GodRays,
  godRaysPresets,
  Spiral,
  spiralPresets,
  Dithering,
  ditheringPresets,
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
    shaderConfig: { ...steppedSimplexNoisePresets[0].params, scale: 0.5, speed: 0.3 },
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
    shaderConfig: { ...neuroNoisePresets[0].params, scale: 0.4 },
  },
  {
    name: 'dot orbit',
    image: dotOrbitImg,
    url: '/dot-orbit',
    ShaderComponent: DotOrbit,
    shaderConfig: { ...dotOrbitPresets[0].params, scale: 0.7, dotSizeRange: 0.15 },
  },
  {
    name: 'smoke ring',
    image: smokeRingImg,
    url: '/smoke-ring',
    ShaderComponent: SmokeRing,
    shaderConfig: smokeRingPresets[1].params,
    style: { background: '#4082FF' },
  },
  {
    name: 'metaballs',
    image: metaballsImg,
    url: '/metaballs',
    ShaderComponent: Metaballs,
    shaderConfig: { ...metaballsPresets[0].params, scale: 1 },
  },
  {
    name: 'dot grid',
    url: '/dot-grid',
    ShaderComponent: DotGrid,
    image: dotGridImg,
  },
  {
    name: 'perlin',
    url: '/perlin-noise',
    ShaderComponent: PerlinNoise,
    image: perlinNoiseImg,
    shaderConfig: { ...perlinNoisePresets[1].params, scale: 0.6 },
    style: { background: '#2D63D4' },
  },
  {
    name: 'voronoi',
    url: '/voronoi',
    ShaderComponent: Voronoi,
    image: voronoiImg,
    shaderConfig: { ...voronoiPresets[0].params, scale: 2.1 },
    style: { background: '#301A04' },
  },
  {
    name: 'waves',
    url: '/waves',
    ShaderComponent: Waves,
    image: wavesImg,
  },
  {
    name: 'warp',
    url: '/warp',
    ShaderComponent: Warp,
    image: warpImg,
    shaderConfig: { ...warpPresets[0].params, scale: 3, speed: 0.6 },
  },
  {
    name: 'god rays',
    url: '/god-rays',
    ShaderComponent: GodRays,
    image: godRaysImg,
    shaderConfig: { ...godRaysPresets[0].params, offsetX: -0.55, offsetY: -0.55, speed: 2 },
  },
  {
    name: 'spiral',
    url: '/spiral',
    ShaderComponent: Spiral,
    image: spiralImg,
    shaderConfig: { ...spiralPresets[1].params, scale: 0.5 },
  },
  {
    name: 'dithering',
    url: '/dithering',
    ShaderComponent: Dithering,
    image: spiralImg,
    shaderConfig: { ...ditheringPresets[0].params },
  },
] satisfies HomeShaderConfig[];

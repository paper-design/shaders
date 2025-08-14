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
import swirlImg from '../public/shaders/swirl.webp';
import ditheringImg from '../public/shaders/dithering.webp';
import liquidMetalImg from '../public/shaders/liquid-metal.webp';
import grainGradientImg from '../public/shaders/grain-gradient.webp';
import pulsingBorderImg from '../public/shaders/pulsing-border.webp';
import colorPanelsImg from '../public/shaders/color-panels.webp';
import staticMeshGradientImg from '../public/shaders/static-mesh-gradient.webp';
import staticRadialGradientImg from '../public/shaders/static-radial-gradient.webp';

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
  ColorPanels,
  colorPanelsPresets,
  StaticMeshGradient,
  staticMeshGradientPresets,
  StaticRadialGradient,
  staticRadialGradientPresets,
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
  isStatic?: boolean;
};

export const homeShaders = [
  // {
  //   name: 'texture test',
  //   url: '/texture-test',
  //   ShaderComponent: TextureTest,
  //   shaderConfig: {},
  // },
  {
    name: 'grain gradient',
    url: '/grain-gradient',
    ShaderComponent: GrainGradient,
    image: grainGradientImg,
    shaderConfig: { ...grainGradientPresets[0].params, frame: 7000, speed: 2 },
  },
  {
    name: 'mesh gradient',
    image: meshGradientImg,
    url: '/mesh-gradient',
    ShaderComponent: MeshGradient,
    shaderConfig: { ...meshGradientPresets[0].params, frame: 41500 },
  },
  {
    isStatic: true,
    name: 'static mesh gradient',
    url: '/static-mesh-gradient',
    ShaderComponent: StaticMeshGradient,
    image: staticMeshGradientImg,
    shaderConfig: { ...staticMeshGradientPresets[0].params, rotation: 270 },
  },
  {
    isStatic: true,
    name: 'static radial gradient',
    url: '/static-radial-gradient',
    ShaderComponent: StaticRadialGradient,
    image: staticRadialGradientImg,
    shaderConfig: { ...staticRadialGradientPresets[0].params, scale: 0.7 },
  },
  {
    name: 'dithering',
    url: '/dithering',
    ShaderComponent: Dithering,
    image: ditheringImg,
    shaderConfig: { ...ditheringPresets[0].params, scale: 0.45 },
  },
  {
    name: 'dot orbit',
    image: dotOrbitImg,
    url: '/dot-orbit',
    ShaderComponent: DotOrbit,
    shaderConfig: { ...dotOrbitPresets[0].params, scale: 0.45 },
  },
  {
    isStatic: true,
    name: 'dot grid',
    url: '/dot-grid',
    ShaderComponent: DotGrid,
    image: dotGridImg,
    shaderConfig: { ...dotGridPresets[0].params, scale: 0.96, gapY: 24, size: 2 },
  },
  {
    name: 'warp',
    url: '/warp',
    ShaderComponent: Warp,
    image: warpImg,
    shaderConfig: { ...warpPresets[0].params, speed: 2, offsetX: -0.2, scale: 0.6, frame: 20000 },
  },
  {
    name: 'spiral',
    url: '/spiral',
    ShaderComponent: Spiral,
    image: spiralImg,
    shaderConfig: { ...spiralPresets[0].params, scale: 0.5, speed: 2 },
  },
  {
    name: 'swirl',
    url: '/swirl',
    ShaderComponent: Swirl,
    image: swirlImg,
    shaderConfig: { ...swirlPresets[0].params, speed: 0.7 },
  },
  {
    isStatic: true,
    name: 'waves',
    url: '/waves',
    ShaderComponent: Waves,
    image: wavesImg,
    shaderConfig: { ...wavesPresets[0].params, scale: 0.9, spacing: 1.15, proportion: 0.15 },
  },
  {
    name: 'neuro noise',
    image: neuroNoiseImg,
    url: '/neuro-noise',
    ShaderComponent: NeuroNoise,
    shaderConfig: { ...neuroNoisePresets[0].params, scale: 0.6, frame: 1500, offsetX: -0.17 },
  },
  {
    name: 'perlin',
    url: '/perlin-noise',
    ShaderComponent: PerlinNoise,
    image: perlinNoiseImg,
    shaderConfig: { ...perlinNoisePresets[0].params, scale: 0.8, speed: 0.2 },
  },
  {
    name: 'simplex noise',
    image: simplexNoiseImg,
    url: '/simplex-noise',
    ShaderComponent: SimplexNoise,
    shaderConfig: { ...simplexNoisePresets[0].params, scale: 0.4 },
  },
  {
    name: 'voronoi',
    url: '/voronoi',
    ShaderComponent: Voronoi,
    image: voronoiImg,
    shaderConfig: { ...voronoiPresets[0].params, scale: 0.35 },
  },
  {
    name: 'pulsing border',
    url: '/pulsing-border',
    ShaderComponent: PulsingBorder,
    image: pulsingBorderImg,
    shaderConfig: { ...pulsingBorderPresets[0].params, scale: 0.45 },
  },
  {
    name: 'metaballs',
    image: metaballsImg,
    url: '/metaballs',
    ShaderComponent: Metaballs,
    shaderConfig: { ...metaballsPresets[0].params, scale: 0.7, frame: 21300, offsetY: -0.01 },
  },
  {
    name: 'color panels',
    url: '/color-panels',
    ShaderComponent: ColorPanels,
    image: colorPanelsImg,
    shaderConfig: { ...colorPanelsPresets[0].params, speed: 2, scale: 0.6 },
  },
  {
    name: 'smoke ring',
    image: smokeRingImg,
    url: '/smoke-ring',
    ShaderComponent: SmokeRing,
    shaderConfig: { ...smokeRingPresets[0].params, scale: 0.6, speed: 2 },
  },
  {
    name: 'liquid metal',
    url: '/liquid-metal',
    ShaderComponent: LiquidMetal,
    image: liquidMetalImg,
    shaderConfig: { ...liquidMetalPresets[0].params, scale: 0.45 },
  },
  {
    name: 'god rays',
    url: '/god-rays',
    ShaderComponent: GodRays,
    image: godRaysImg,
    shaderConfig: { ...godRaysPresets[0].params, speed: 2, scale: 0.5, offsetY: -0.5 },
  },
] satisfies HomeShaderConfig[];

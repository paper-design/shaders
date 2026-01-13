import meshGradientImg from '../../public/shaders/mesh-gradient.webp';
import simplexNoiseImg from '../../public/shaders/simplex-noise.webp';
import neuroNoiseImg from '../../public/shaders/neuro-noise.webp';
import perlinNoiseImg from '../../public/shaders/perlin-noise.webp';
import dotGridImg from '../../public/shaders/dot-grid.webp';
import dotOrbitImg from '../../public/shaders/dot-orbit.webp';
import smokeRingImg from '../../public/shaders/smoke-ring.webp';
import metaballsImg from '../../public/shaders/metaballs.webp';
import voronoiImg from '../../public/shaders/voronoi.webp';
import wavesImg from '../../public/shaders/waves.webp';
import warpImg from '../../public/shaders/warp.webp';
import godRaysImg from '../../public/shaders/god-rays.webp';
import spiralImg from '../../public/shaders/spiral.webp';
import swirlImg from '../../public/shaders/swirl.webp';
import ditheringImg from '../../public/shaders/dithering.webp';
import grainGradientImg from '../../public/shaders/grain-gradient.webp';
import pulsingBorderImg from '../../public/shaders/pulsing-border.webp';
import colorPanelsImg from '../../public/shaders/color-panels.webp';
import staticMeshGradientImg from '../../public/shaders/static-mesh-gradient.webp';
import staticRadialGradientImg from '../../public/shaders/static-radial-gradient.webp';
import flutedGlassImg from '../../public/shaders/fluted-glass.webp';
import imageDitheringImg from '../../public/shaders/image-dithering.webp';
import paperTextureImg from '../../public/shaders/paper-texture.webp';
import waterImg from '../../public/shaders/water.webp';
import heatmapImg from '../../public/shaders/heatmap.webp';
import liquidMetalImg from '../../public/shaders/liquid-metal.webp';
import halftoneDotsImg from '../../public/shaders/halftone-dots.webp';
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
  PaperTexture,
  paperTexturePresets,
  FlutedGlass,
  flutedGlassPresets,
  Water,
  waterPresets,
  ImageDithering,
  imageDitheringPresets,
  liquidMetalPresets,
  LiquidMetal,
  Heatmap,
  heatmapPresets,
  HalftoneDots,
  halftoneDotsPresets,
} from '@paper-design/shaders-react';
import { StaticImageData } from 'next/image';

export type HomeShaderConfig = {
  name: string;
  image: StaticImageData;
  url: string;
  pixelated?: boolean;
  ShaderComponent: React.FC<any>;
  shaderConfig: Record<string, unknown>;

  /**
   * Whether to render the shader itself in place of the preview image
   * (can be used for grainy shaders that look bad when previews are compressed/resized)
   */
  alwaysLivePreview?: boolean;
};

type HomeCategory = {
  name: string;
  shaders: HomeShaderConfig[];
};

export const homeThumbnails = [
  {
    name: 'Image Filters',
    shaders: [
      {
        name: 'paper texture',
        url: '/paper-texture',
        ShaderComponent: PaperTexture,
        image: paperTextureImg,
        shaderConfig: { ...paperTexturePresets[0].params, scale: 1.05 },
      },
      {
        name: 'fluted glass',
        url: '/fluted-glass',
        ShaderComponent: FlutedGlass,
        image: flutedGlassImg,
        shaderConfig: { ...flutedGlassPresets[0].params, scale: 1.05, distortion: 0.2 },
      },
      {
        name: 'water',
        url: '/water',
        ShaderComponent: Water,
        image: waterImg,
        shaderConfig: {
          ...waterPresets[0].params,
          scale: 1.05,
          colorBack: '#e0f2ff',
          image: '/images/image-filters/0018.webp',
        },
      },
      {
        name: 'image dithering',
        url: '/image-dithering',
        ShaderComponent: ImageDithering,
        image: imageDitheringImg,
        shaderConfig: { ...imageDitheringPresets[0].params, scale: 1.05 },
      },
      {
        name: 'halftone dots',
        url: '/halftone-dots',
        ShaderComponent: HalftoneDots,
        image: halftoneDotsImg,
        shaderConfig: {
          ...halftoneDotsPresets[0].params,
          image: '/images/image-filters/0018.webp',
          speed: 0,
        },
      },
    ],
  },
  {
    name: 'Logo Animations',
    shaders: [
      {
        name: 'heatmap',
        url: '/heatmap',
        ShaderComponent: Heatmap,
        image: heatmapImg,
        shaderConfig: {
          ...heatmapPresets[0].params,
          scale: 0.9,
          frame: 5800,
          suspendWhenProcessingImage: true,
          image: '/images/logos/diamond.svg',
        },
      },
      {
        name: 'liquid metal',
        url: '/liquid-metal',
        ShaderComponent: LiquidMetal,
        image: liquidMetalImg,
        shaderConfig: {
          ...liquidMetalPresets[0].params,
          scale: 0.9,
          suspendWhenProcessingImage: true,
          image: '/images/logos/diamond.svg',
        },
      },
    ],
  },
  {
    name: 'Effects',
    shaders: [
      {
        name: 'mesh gradient',
        image: meshGradientImg,
        url: '/mesh-gradient',
        ShaderComponent: MeshGradient,
        shaderConfig: { ...meshGradientPresets[0].params },
      },
      {
        name: 'static mesh gradient',
        url: '/static-mesh-gradient',
        ShaderComponent: StaticMeshGradient,
        image: staticMeshGradientImg,
        shaderConfig: { ...staticMeshGradientPresets[0].params },
      },
      {
        name: 'static radial gradient',
        url: '/static-radial-gradient',
        ShaderComponent: StaticRadialGradient,
        image: staticRadialGradientImg,
        shaderConfig: { ...staticRadialGradientPresets[0].params, radius: 0.65, offsetY: -0.03 },
      },
      {
        name: 'dithering',
        url: '/dithering',
        ShaderComponent: Dithering,
        image: ditheringImg,
        pixelated: true,
        shaderConfig: { ...ditheringPresets[0].params },
        // This shader doesn't render consistently when
        // thumbnails are resized, so we live render it
        alwaysLivePreview: true,
      },
      {
        name: 'grain gradient',
        image: grainGradientImg,
        url: '/grain-gradient',
        ShaderComponent: GrainGradient,
        shaderConfig: { ...grainGradientPresets[0].params, speed: 1.5 },
        // This shader thumbnails look nowhere near as crisp
        // when resized, so we live render it to maintain the quality
        alwaysLivePreview: true,
      },
      {
        name: 'dot orbit',
        image: dotOrbitImg,
        url: '/dot-orbit',
        ShaderComponent: DotOrbit,
        shaderConfig: { ...dotOrbitPresets[0].params, scale: 0.45 },
      },
      {
        name: 'dot grid',
        url: '/dot-grid',
        ShaderComponent: DotGrid,
        image: dotGridImg,
        shaderConfig: { ...dotGridPresets[0].params, gapX: 24, gapY: 24, size: 1.5, speed: 0 },
      },
      {
        name: 'warp',
        url: '/warp',
        ShaderComponent: Warp,
        image: warpImg,
        shaderConfig: { ...warpPresets[0].params, scale: 0.6 },
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
        shaderConfig: { ...swirlPresets[0].params },
      },
      {
        name: 'waves',
        url: '/waves',
        ShaderComponent: Waves,
        image: wavesImg,
        shaderConfig: { ...wavesPresets[0].params, speed: 0, scale: 0.55, spacing: 1.2 },
      },
      {
        name: 'neuro noise',
        image: neuroNoiseImg,
        url: '/neuro-noise',
        ShaderComponent: NeuroNoise,
        shaderConfig: { ...neuroNoisePresets[0].params, scale: 0.8 },
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
        shaderConfig: {
          ...simplexNoisePresets[0].params,
          scale: 0.4,
        },
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
        shaderConfig: { ...pulsingBorderPresets[0].params },
      },
      {
        name: 'metaballs',
        image: metaballsImg,
        url: '/metaballs',
        ShaderComponent: Metaballs,
        shaderConfig: { ...metaballsPresets[0].params, scale: 1, count: 8, speed: 1.5 },
      },
      {
        name: 'color panels',
        url: '/color-panels',
        ShaderComponent: ColorPanels,
        image: colorPanelsImg,
        shaderConfig: { ...colorPanelsPresets[0].params, scale: 0.75, speed: 2 },
      },
      {
        name: 'smoke ring',
        image: smokeRingImg,
        url: '/smoke-ring',
        ShaderComponent: SmokeRing,
        shaderConfig: { ...smokeRingPresets[0].params, scale: 0.8, speed: 1 },
      },
      {
        name: 'god rays',
        url: '/god-rays',
        ShaderComponent: GodRays,
        image: godRaysImg,
        shaderConfig: { ...godRaysPresets[0].params, offsetY: -0.7, speed: 1.25 },
      },
    ],
  },
] satisfies HomeCategory[];

export const flatHomeThumbnails = homeThumbnails.flatMap((category) => category.shaders as HomeShaderConfig[]);

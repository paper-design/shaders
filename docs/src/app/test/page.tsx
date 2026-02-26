'use client';

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

const sampleImage = 'https://shaders.paper.design/images/image-filters/0018.webp';
const sampleSvg = 'https://shaders.paper.design/images/logos/diamond.svg';

export default function TestPage() {
  return (
    <div className="grid grid-cols-4 *:aspect-video">
      <FlutedGlass image={sampleImage} />
      <PaperTexture image={sampleImage} />
      <Water image={sampleImage} />
      <ImageDithering image={sampleImage} />
      <Heatmap image="https://shaders.paper.design/images/logos/diamond.svg" />
      <LiquidMetal image="https://shaders.paper.design/images/logos/diamond.svg" />
      <HalftoneDots image={sampleImage} />
      <HalftoneCmyk image={sampleImage} />

      {/* Non-image shaders */}
      <MeshGradient />
      <SmokeRing />
      <NeuroNoise />
      <DotOrbit />
      <DotGrid />
      <SimplexNoise />
      <Metaballs />
      <Waves />
      <PerlinNoise />
      <Voronoi />
      <Warp />
      <GodRays />
      <Spiral />
      <Swirl />
      <Dithering />
      <GrainGradient />
      <PulsingBorder />
      <ColorPanels />
      <StaticMeshGradient />
      <StaticRadialGradient />
    </div>
  );
}

'use client';

import {
  MeshGradient,
  SmokeRing,
  NeuroNoise,
  DotOrbit,
  DotGrid,
  SimplexNoise,
  Metaballs,
  Waves,
  PerlinNoise,
  Voronoi,
  Warp,
  GodRays,
  Spiral,
  Swirl,
  Dithering,
  GrainGradient,
  PulsingBorder,
  ColorPanels,
  StaticMeshGradient,
  StaticRadialGradient,
  PaperTexture,
  FlutedGlass,
  Water,
  ImageDithering,
  Heatmap,
  LiquidMetal,
  HalftoneDots,
  HalftoneCmyk,
  GemSmoke,
} from '@paper-design/shaders-react';

const IMAGE_URL = 'https://shaders.paper.design/images/image-filters/0018.webp';

function ShaderCell({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="relative aspect-video">
      <div className="absolute inset-0 [&>*]:w-full [&>*]:h-full">{children}</div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 z-10">
        {name}
      </div>
    </div>
  );
}

export default function TestPage() {
  return (
    <div className="grid grid-cols-4 gap-1 p-1 bg-black">
      <ShaderCell name="MeshGradient">
        <MeshGradient />
      </ShaderCell>
      <ShaderCell name="SmokeRing">
        <SmokeRing />
      </ShaderCell>
      <ShaderCell name="NeuroNoise">
        <NeuroNoise />
      </ShaderCell>
      <ShaderCell name="DotOrbit">
        <DotOrbit />
      </ShaderCell>
      <ShaderCell name="DotGrid">
        <DotGrid />
      </ShaderCell>
      <ShaderCell name="SimplexNoise">
        <SimplexNoise />
      </ShaderCell>
      <ShaderCell name="Metaballs">
        <Metaballs />
      </ShaderCell>
      <ShaderCell name="Waves">
        <Waves />
      </ShaderCell>
      <ShaderCell name="PerlinNoise">
        <PerlinNoise />
      </ShaderCell>
      <ShaderCell name="Voronoi">
        <Voronoi />
      </ShaderCell>
      <ShaderCell name="Warp">
        <Warp />
      </ShaderCell>
      <ShaderCell name="GodRays">
        <GodRays />
      </ShaderCell>
      <ShaderCell name="Spiral">
        <Spiral />
      </ShaderCell>
      <ShaderCell name="Swirl">
        <Swirl />
      </ShaderCell>
      <ShaderCell name="Dithering">
        <Dithering />
      </ShaderCell>
      <ShaderCell name="GrainGradient">
        <GrainGradient />
      </ShaderCell>
      <ShaderCell name="PulsingBorder">
        <PulsingBorder />
      </ShaderCell>
      <ShaderCell name="ColorPanels">
        <ColorPanels />
      </ShaderCell>
      <ShaderCell name="StaticMeshGradient">
        <StaticMeshGradient />
      </ShaderCell>
      <ShaderCell name="StaticRadialGradient">
        <StaticRadialGradient />
      </ShaderCell>
      <ShaderCell name="PaperTexture">
        <PaperTexture />
      </ShaderCell>
      <ShaderCell name="FlutedGlass">
        <FlutedGlass image={IMAGE_URL} />
      </ShaderCell>
      <ShaderCell name="Water">
        <Water image={IMAGE_URL} />
      </ShaderCell>
      <ShaderCell name="ImageDithering">
        <ImageDithering image={IMAGE_URL} />
      </ShaderCell>
      <ShaderCell name="Heatmap">
        <Heatmap image={IMAGE_URL} />
      </ShaderCell>
      <ShaderCell name="LiquidMetal">
        <LiquidMetal />
      </ShaderCell>
      <ShaderCell name="HalftoneDots">
        <HalftoneDots image={IMAGE_URL} />
      </ShaderCell>
      <ShaderCell name="HalftoneCmyk">
        <HalftoneCmyk image={IMAGE_URL} />
      </ShaderCell>
      <ShaderCell name="GemSmoke">
        <GemSmoke />
      </ShaderCell>
    </div>
  );
}

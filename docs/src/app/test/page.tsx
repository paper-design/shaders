'use client';

import { FlutedGlass, Heatmap, ImageDithering, PaperTexture, Water } from '@paper-design/shaders-react';

export default function TestPage() {
  return (
    <div className="grid grid-cols-4 *:aspect-video">
      <FlutedGlass image="https://shaders.paper.design/images/image-filters/0018.webp" />
      <FlutedGlass image="" />
      <PaperTexture image="https://shaders.paper.design/images/image-filters/0018.webp" />
      <PaperTexture />
      <Water image="https://shaders.paper.design/images/image-filters/0018.webp" />
      <Water />
      <ImageDithering image="https://shaders.paper.design/images/image-filters/0018.webp" />
      <ImageDithering image="" />
      <Heatmap image="https://shaders.paper.design/images/logos/diamond.svg" />
      <Heatmap image="" />
    </div>
  );
}

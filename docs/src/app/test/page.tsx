'use client';

import { FlutedGlass, Heatmap, ImageDithering, PaperTexture, Water } from '@paper-design/shaders-react';

export default function TestPage() {
  return (
    <div className="grid grid-cols-3">
      <FlutedGlass height={600} image="" />
      <PaperTexture height={600} />
      <Water height={600} />
      <ImageDithering height={600} image="" />
      <Heatmap height={600} image="" />
    </div>
  );
}

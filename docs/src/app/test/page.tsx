'use client';

import { FlutedGlass, Heatmap, ImageDithering, PaperTexture, Water } from '@paper-design/shaders-react';

export default function TestPage() {
  return (
    <div className="grid grid-cols-3 *:aspect-video">
      <FlutedGlass image="" />
      <PaperTexture />
      <Water />
      <ImageDithering image="" />
      <Heatmap image="" />
    </div>
  );
}

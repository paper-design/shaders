'use client';

import { FlutedGlass, Heatmap, ImageDithering, PaperTexture, Water } from '@paper-design/shaders-react';

export default function TestPage() {
  return (
    <div className="grid grid-cols-3 *:aspect-square">
      <FlutedGlass
        margin={0.25}
        image="https://images.unsplash.com/photo-1757574425844-47a2edbc4e5a?q=100&w=3136&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
    </div>
  );
}

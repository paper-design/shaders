'use client';

import { Water, Heatmap, heatmapPresets } from '@paper-design/shaders-react';

export default function TestPage() {
  return (
    <div style={{ display: 'flex' }}>
      <Water style={{ width: 600, height: 600 }} />
      <Heatmap image={heatmapPresets[0].params.image} style={{ width: 600, height: 600 }} />
    </div>
  );
}

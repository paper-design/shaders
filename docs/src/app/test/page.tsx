'use client';

import { Heatmap, heatmapPresets } from '@paper-design/shaders-react';

export default function TestPage() {
  return (
    <div style={{ display: 'flex' }}>
      <Heatmap width={500} height={500} {...heatmapPresets.find((preset) => preset.name === 'Default')?.params} />
    </div>
  );
}

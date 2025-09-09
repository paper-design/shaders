'use client';

import { Heatmap, heatmapPresets } from '@paper-design/shaders-react';

export default function TestPage() {
  return (
    <div style={{ display: 'flex' }}>
      <Heatmap
        {...heatmapPresets.find((preset) => preset.name === 'Default')?.params}
        style={{ width: 600, height: 600 }}
        shouldSuspend
      />
    </div>
  );
}

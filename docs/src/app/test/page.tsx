'use client';

import { Water, Heatmap, heatmapPresets } from '@paper-design/shaders-react';

export default function TestPage() {
  return (
    <div style={{ display: 'flex' }}>
      <Heatmap
          // colors={['#ffffff', '#ff0000', '#ffff00']}
          // colorBack={'#000000'}
          // noise={0.5}
          // speed={2}
          image={'./heatmap-temporary/logo-pics/apple.svg'}
          style={{ width: 600, height: 600 }}
      />
    </div>
  );
}

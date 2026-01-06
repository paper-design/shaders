'use client';

import { Heatmap, HeatmapProps } from '@paper-design/shaders-react';

export function HeatmapExample(props: HeatmapProps) {
  return <Heatmap style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

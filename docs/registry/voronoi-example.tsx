'use client';

import { Voronoi, VoronoiProps } from '@paper-design/shaders-react';

export function VoronoiExample(props: VoronoiProps) {
  return (
    <Voronoi
      colorCell1="#e64d1a"
      colorCell2="#1ae6e6"
      colorCell3="#1aa2e6"
      colorGradient={0}
      scale={1}
      distance={0.25}
      edgesSize={0.2}
      edgesSoftness={0}
      speed={1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

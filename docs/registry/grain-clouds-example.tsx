'use client';

import { GrainClouds, GrainCloudsProps } from '@paper-design/shaders-react';

export function GrainCloudsExample(props: GrainCloudsProps) {
  return (
    <GrainClouds
      color1="#000000"
      color2="#ffffff"
      scale={1}
      grainAmount={0.5}
      speed={0.2}
      seed={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
}

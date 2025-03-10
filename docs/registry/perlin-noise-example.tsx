'use client';

import { PerlinNoise, PerlinNoiseProps } from '@paper-design/shaders-react';

export function PerlinNoiseExample(props: PerlinNoiseProps) {
  return (
    <PerlinNoise
      color1="#262626"
      color2="#bde6ff"
      scale={1}
      proportion={0.34}
      contour={0.9}
      octaveCount={2}
      persistence={1}
      lacunarity={1.5}
      speed={0.5}
      seed={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

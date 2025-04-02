'use client';

import { PerlinNoise, PerlinNoiseProps } from '@paper-design/shaders-react';

export function PerlinNoiseExample(props: PerlinNoiseProps) {
  return (
    <PerlinNoise
      color1="#222222"
      color2="#eeeeee"
      scale={1}
      proportion={0.34}
      softness={0.1}
      octaveCount={2}
      persistence={1}
      lacunarity={1.5}
      speed={0.5}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

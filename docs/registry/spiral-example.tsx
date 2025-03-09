'use client';

import { Spiral, SpiralProps } from '@paper-design/shaders-react';

export function SpiralExample(props: SpiralProps) {
  return (
    <Spiral
      color1="#90e32b"
      color2="#2c8618"
      scale={1.3}
      offsetX={0}
      offsetY={0}
      spiralDensity={0.5}
      spiralDistortion={0}
      strokeWidth={0.5}
      strokeTaper={0}
      strokeCap={0.5}
      noiseFreq={0.1}
      noisePower={1}
      blur={0}
      speed={1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

'use client';

import { SmokeRing, SmokeRingProps } from '@paper-design/shaders-react';

export function SmokeRingExample(props: SmokeRingProps) {
  return (
    <SmokeRing
      colorBack="#08121b"
      colorInner="#ffffff"
      colorOuter="#47a0ff"
      scale={1}
      noiseScale={1.4}
      thickness={0.33}
      speed={1}
      seed={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

'use client';

import { DotsOrbit, type DotsOrbitProps } from '@paper-design/shaders-react';

export function DotsOrbitExample(props: DotsOrbitProps) {
  return (
    <DotsOrbit
      color1="#cf2a30"
      color2="#3b6d50"
      color3="#f0a519"
      color4="#5d3e74"
      scale={1}
      dotSize={0.7}
      dotSizeRange={0.2}
      spreading={1}
      speed={2}
      seed={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

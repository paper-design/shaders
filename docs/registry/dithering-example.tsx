'use client';

import { Dithering, DitheringProps } from '@paper-design/shaders-react';

export function DitheringExample(props: DitheringProps) {
  return (
    <Dithering
      color1="#56758f"
      color2="#91be6f"
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

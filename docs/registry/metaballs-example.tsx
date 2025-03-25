'use client';

import { Metaballs, MetaballsProps } from '@paper-design/shaders-react';

export function MetaballsExample(props: MetaballsProps) {
  return (
    <Metaballs
      color1="#f42547"
      color2="#eb4763"
      color3="#f49d71"
      scale={1}
      ballSize={1}
      visibilityRange={0.4}
      speed={1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

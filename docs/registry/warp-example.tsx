'use client';

import { Warp, WarpProps } from '@paper-design/shaders-react';

export function WarpExample(props: WarpProps) {
  return (
    <Warp
      color1="#262626"
      color2="#75c1f0"
      color3="#ffffff"
      scale={1}
      rotation={0}
      proportion={0.5}
      softness={1}
      distortion={0.25}
      swirl={0.9}
      swirlIterations={10}
      shape="checks"
      shapeScale={0.5}
      speed={0.3}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

'use client';

import { Swirl, SwirlProps } from '@paper-design/shaders-react';

export function SwirlExample(props: SwirlProps) {
  return (
    <Swirl
      color1="#ffd966"
      color2="#5ebeed"
      color3="#b83df5"
      offsetX={0}
      offsetY={0}
      bandCount={2.5}
      twist={0.2}
      noiseFreq={3}
      noise={0.37}
      softness={0}
      speed={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

'use client';

import { SteppedSimplexNoise, SteppedSimplexNoiseProps } from '@paper-design/shaders-react';

export function SteppedSimplexNoiseExample(props: SteppedSimplexNoiseProps) {
  return (
    <SteppedSimplexNoise
      color1="#56758f"
      color2="#91be6f"
      color3="#f94346"
      color4="#f9c54e"
      color5="#ffffff"
      scale={1}
      stepsNumber={13}
      speed={0.5}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

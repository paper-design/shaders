import { SteppedSimplexNoise, SteppedSimplexNoiseProps } from '@paper-design/shaders-react';

export function SteppedSimplexNoiseExample(props: SteppedSimplexNoiseProps) {
  return (
    <SteppedSimplexNoise
      scale={1}
      speed={0.5}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

import { NeuroNoise, type NeuroNoiseProps } from '@paper-design/shaders-react';

export function NeuroNoiseExample(props: NeuroNoiseProps) {
  return (
    <NeuroNoise
      colorBack="hsla(200, 100%, 5%, 1)"
      colorFront="hsla(200, 100%, 25%, 1)"
      scale={1}
      brightness={1.3}
      speed={1}
      seed={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

import { Waves, WavesProps } from '@paper-design/shaders-react';

export function WavesExample(props: WavesProps) {
  return (
    <Waves
      color1="#10266B"
      color2="#10266B"
      scale={1}
      rotation={0}
      frequency={0.5}
      amplitude={0.5}
      spacing={0.75}
      dutyCycle={0.2}
      softness={0}
      shape={1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

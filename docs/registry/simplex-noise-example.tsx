import { SimplexNoise, SimplexNoiseProps } from '@paper-design/shaders-react';

export function SimplexNoiseExample(props: SimplexNoiseProps) {
  return <SimplexNoise scale={1} speed={0.5} style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

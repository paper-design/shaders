import { PerlinNoise, PerlinNoiseProps } from '@paper-design/shaders-react';

export function PerlinNoiseExample(props: PerlinNoiseProps) {
  return <PerlinNoise style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

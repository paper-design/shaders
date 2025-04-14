import { MeshGradient, MeshGradientProps } from '@paper-design/shaders-react';

export function MeshGradientExample(props: MeshGradientProps) {
  return (
    <MeshGradient
      colors={['#b3a6ce', '#562b9c', '#f4e8b8', '#c79acb']}
      distortion={0.5}
      swirl={0.1}
      speed={0.15}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
}

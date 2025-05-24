import { MeshGradient, MeshGradientProps } from '@paper-design/shaders-react';

export function MeshGradientExample(props: MeshGradientProps) {
  return <MeshGradient style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

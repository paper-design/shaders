import { StaticMeshGradient, StaticMeshGradientProps } from '@paper-design/shaders-react';

export function StaticMeshGradientExample(props: StaticMeshGradientProps) {
  return <StaticMeshGradient style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

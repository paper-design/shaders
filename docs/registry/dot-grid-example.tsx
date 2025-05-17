import { DotGrid, type DotGridProps } from '@paper-design/shaders-react';

export function DotGridExample(props: DotGridProps) {
  return <DotGrid style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

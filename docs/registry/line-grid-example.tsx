import { LineGrid, type LineGridProps } from '@paper-design/shaders-react';

export function DotGridExample(props: LineGridProps) {
  return <LineGrid style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

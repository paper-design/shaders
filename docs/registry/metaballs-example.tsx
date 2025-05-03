import { Metaballs, MetaballsProps } from '@paper-design/shaders-react';

export function MetaballsExample(props: MetaballsProps) {
  return <Metaballs style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

import { DotOrbit, type DotOrbitProps } from '@paper-design/shaders-react';

export function DotOrbitExample(props: DotOrbitProps) {
  return <DotOrbit style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

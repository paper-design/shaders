import { SmokeRing, SmokeRingProps } from '@paper-design/shaders-react';

export function SmokeRingExample(props: SmokeRingProps) {
  return <SmokeRing style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

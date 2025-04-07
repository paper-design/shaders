import { SmokeRing, SmokeRingProps } from '@paper-design/shaders-react';

export function SmokeRingExample(props: SmokeRingProps) {
  return (
    <SmokeRing
      colorInner="#ffffff"
      colorOuter="#47a0ff"
      scale={1}
      noiseScale={1.4}
      thickness={0.33}
      radius={0.5}
      innerShape={1}
      noiseIterations={8}
      speed={1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

import { LiquidMetal, LiquidMetalProps } from '@paper-design/shaders-react';

export function LiquidMetalExample(props: LiquidMetalProps) {
  return <LiquidMetal scale={1} speed={0.5} style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

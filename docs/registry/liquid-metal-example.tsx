import {LiquidMetal, LiquidMetalProps } from '@paper-design/shaders-react';

export function LiquidMetalExample(props: LiquidMetalProps) {
  return <LiquidMetal style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

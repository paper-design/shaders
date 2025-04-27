import { WaterDrops, type WaterDropsProps } from '@paper-design/shaders-react';

export function WaterDropsExample(props: WaterDropsProps) {
  return <WaterDrops style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

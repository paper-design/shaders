import { Water, WaterProps } from '@paper-design/shaders-react';

export function WaterExample(props: WaterProps) {
  return <Water style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

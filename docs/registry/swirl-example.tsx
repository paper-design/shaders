import { Swirl, SwirlProps } from '@paper-design/shaders-react';

export function SwirlExample(props: SwirlProps) {
  return (
    <Swirl color1="#90e32b" color2="#2c8618" style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />
  );
}

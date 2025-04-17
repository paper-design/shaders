import { Swirl, SwirlProps } from '@paper-design/shaders-react';

export function SwirlExample(props: SwirlProps) {
  return (
    <Swirl style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />
  );
}

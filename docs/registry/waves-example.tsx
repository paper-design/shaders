import { Waves, WavesProps } from '@paper-design/shaders-react';

export function WavesExample(props: WavesProps) {
  return <Waves style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

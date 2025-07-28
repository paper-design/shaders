import { Tartan, type TartanProps } from '@paper-design/shaders-react';

export function TartanExample(props: TartanProps) {
  return <Tartan style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

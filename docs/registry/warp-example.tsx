import { Warp, WarpProps } from '@paper-design/shaders-react';

export function WarpExample(props: WarpProps) {
  return <Warp style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

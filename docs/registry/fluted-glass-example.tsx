import { FlutedGlass, FlutedGlassProps } from '@paper-design/shaders-react';

export function FlutedGlassExample(props: FlutedGlassProps) {
  return <FlutedGlass style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

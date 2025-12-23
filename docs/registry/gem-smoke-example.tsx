import { GemSmoke, type GemSmokeProps } from '@paper-design/shaders-react';

export function GemSmokeExample(props: GemSmokeProps) {
  return <GemSmoke style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

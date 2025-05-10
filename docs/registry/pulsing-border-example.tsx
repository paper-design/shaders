import { PulsingBorder, PulsingBorderProps } from '@paper-design/shaders-react';

export function PulsingBorderExample(props: PulsingBorderProps) {
  return <PulsingBorder style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

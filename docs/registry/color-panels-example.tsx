import { ColorPanels, ColorPanelsProps } from '@paper-design/shaders-react';

export function ColorPanelsExample(props: ColorPanelsProps) {
  return <ColorPanels scale={1} speed={0.5} style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

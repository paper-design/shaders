import { Pixelate, PixelateProps } from '@paper-design/shaders-react';

export function PixelateExample(props: PixelateProps) {
  return <Pixelate style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

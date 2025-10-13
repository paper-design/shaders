import {ImageLiquidMetal, ImageLiquidMetalProps } from '@paper-design/shaders-react';

export function ImageLiquidMetalExample(props: ImageLiquidMetalProps) {
  return <ImageLiquidMetal style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

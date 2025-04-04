'use client';

import { DotGrid, type DotGridProps } from '@paper-design/shaders-react';

export function DotGridExample(props: DotGridProps) {
  return (
    <DotGrid
      colorBack="#000000"
      colorFill="#ffffff"
      colorStroke="#f0a519"
      dotSize={2}
      gridSpacingX={50}
      gridSpacingY={50}
      strokeWidth={0}
      sizeRange={0}
      opacityRange={0}
      shape="circle"
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

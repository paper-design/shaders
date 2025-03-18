'use client';

import { DotGrid, type DotGridProps } from '@paper-design/shaders-react';

export function DotGridExample(props: DotGridProps) {
  return (
    <DotGrid
      colorFill="#122118"
      colorStroke="#f0a519"
      dotSize={2}
      gridSpacingX={50}
      gridSpacingY={50}
      strokeWidth={0}
      sizeRange={0}
      opacityRange={0}
      shape={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

'use client';

import { MeshGradient, MeshGradientProps } from '@paper-design/shaders-react';

export function MeshGradientExample(props: MeshGradientProps) {
  return (
    <MeshGradient
      colors={['#b3a6ce', '#562b9c', '#f4e8b8', '#c79acb']}
      speed={0.15}
      seed={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

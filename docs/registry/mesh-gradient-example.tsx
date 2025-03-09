'use client';

import { MeshGradient, MeshGradientProps } from '@paper-design/shaders-react';

export function MeshGradientExample(props: MeshGradientProps) {
  return (
    <MeshGradient
      color1="#b3a6ce"
      color2="#562b9c"
      color3="#f4e8b8"
      color4="#c79acb"
      speed={0.15}
      seed={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      {...props}
    />
  );
}

'use client';

import { ImageLiquidMetal, imageLiquidMetalPresets } from '@paper-design/shaders-react';
import diamond from '../../../public/images/image-filters/0019.webp';

export default function TestPage() {
  return (
    <div style={{ display: 'flex' }}>
      <ImageLiquidMetal
        {...imageLiquidMetalPresets.find((preset) => preset.name === 'Default')?.params}
        style={{ backgroundColor: 'red' }}
        width={1000}
        height={500}
      />
    </div>
  );
}

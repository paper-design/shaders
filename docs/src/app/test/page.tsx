'use client';

import { ImageLiquidMetal } from '@paper-design/shaders-react';
import diamond from '../../../public/images/image-filters/0019.webp';

export default function TestPage() {
  return (
    <div style={{ display: 'flex' }}>
      <ImageLiquidMetal width={500} height={500} image={diamond.src} />
    </div>
  );
}

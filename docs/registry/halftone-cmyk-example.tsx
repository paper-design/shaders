'use client';

import { HalftoneCmyk, HalftoneCmykParams } from '@paper-design/shaders-react';

export function HalftoneCmykExample(props: HalftoneCmykParams) {
  return <HalftoneCmyk style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

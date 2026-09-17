'use client';

import { HalftoneLines, HalftoneLinesProps } from '@paper-design/shaders-react';

export function HalftoneLinesExample(props: HalftoneLinesProps) {
  return <HalftoneLines style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}

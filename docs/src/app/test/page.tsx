'use client';

import { Water } from '@paper-design/shaders-react';

export default function TestPage() {
  return (
    <div className="flex">
      <Water width={500} height={500} size={0.5} />
      <Water width={500} height={500} effectScale={2} />
    </div>
  );
}

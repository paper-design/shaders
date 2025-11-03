'use client';

import dynamic from 'next/dynamic';

const GrainGradient = dynamic(() => import('@paper-design/shaders-react').then((mod) => mod.GrainGradient), {
  ssr: false,
});

export default function TestPage() {
  return <GrainGradient key={1} width={100} height={100} />;
}

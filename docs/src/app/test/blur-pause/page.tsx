'use client';

import { useEffect, useRef, useState } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import type { PaperShaderElement } from '@paper-design/shaders';

const newsletterSrcDoc = `
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 20px; font: 14px/1.4 -apple-system, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; background: white; }
  h3 { margin: 0 0 4px; font-size: 16px; }
  p { margin: 0 0 14px; color: #737373; font-size: 13px; }
  form { display: flex; gap: 8px; }
  input { flex: 1; min-width: 0; padding: 9px 12px; font: inherit; border: 1px solid #d4d4d4; border-radius: 6px; outline: none; }
  input:focus { border-color: #241d9a; box-shadow: 0 0 0 3px #e2e1ff; }
  button { padding: 9px 16px; font: inherit; font-weight: 600; color: white; background: #241d9a; border: none; border-radius: 6px; cursor: pointer; }
  .foot { margin-top: 12px; font-size: 11px; color: #a3a3a3; text-align: right; }
</style>
<h3>Get product updates</h3>
<p>One email a month. Unsubscribe anytime.</p>
<form onsubmit="return false">
  <input type="email" placeholder="you@company.com" />
  <button type="submit">Subscribe</button>
</form>
<div class="foot">Powered by Mailform</div>
`;

export default function BlurPausePage() {
  const ref = useRef<PaperShaderElement>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      const mount = ref.current?.paperShaderMount as unknown as { currentSpeed: number } | undefined;
      if (mount) setIsAnimating(mount.currentSpeed !== 0);
    }, 100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-10 px-4 text-center text-white">
      <MeshGradient
        ref={ref}
        speed={3}
        colors={['#0e0b3d', '#241d9a', '#9f50d3', '#f75092']}
        distortion={0.8}
        swirl={0.1}
        className="fixed inset-0 -z-10"
      />

      <div
        className={`fixed right-4 top-4 rounded-full px-3 py-1 text-sm font-medium ${isAnimating ? 'bg-green-600' : 'bg-red-600'}`}
      >
        {isAnimating ? 'Animating' : 'Paused'}
      </div>

      <div className="flex max-w-xl flex-col gap-4">
        <h1 className="text-5xl font-semibold tracking-tight">Ship something beautiful</h1>
        <p className="text-lg text-white/75">Click into the form below</p>
      </div>

      <iframe
        srcDoc={newsletterSrcDoc}
        title="Newsletter signup"
        className="h-[176px] w-full max-w-md rounded-xl shadow-2xl"
      />
    </div>
  );
}

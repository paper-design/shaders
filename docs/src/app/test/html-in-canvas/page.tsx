'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Water } from '@paper-design/shaders-react';

const waterParams = {
  colorBack: '#0d2b45',
  colorHighlight: '#ffffff',
  highlights: 0.2,
  waves: 0.1,
  caustic: 0.05,
  size: 1,
};

/** One case of the fit-content comparison: its title, and the live size of the box it holds (the OUTER DIV) */
function SizingCase({ title, children }: { title: string; children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState('');

  useEffect(() => {
    const box = stageRef.current?.firstElementChild;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => {
      const { inlineSize, blockSize } = entry!.borderBoxSize[0]!;
      setSize(`${Math.round(inlineSize)} × ${Math.round(blockSize)}`);
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className="sizing-case">
      <figcaption>
        {title}
        <b>{size}</b>
      </figcaption>
      <div ref={stageRef}>{children}</div>
    </figure>
  );
}

const badge = (
  <div className="badge">
    <h2>Hello from HTML</h2>
    <p>The box should wrap around this</p>
  </div>
);

/**
 * The fit-content problem: an OUTER DIV can't wrap around HTML drawn into its canvas.
 * Each OUTER DIV is outlined in red, with its live size under the title
 */
export default function HtmlInCanvasTestPage() {
  return (
    <>
      <style>{`
        .sizing { display: flex; flex-wrap: wrap; align-items: start; gap: 48px; min-height: 100dvh; padding: 48px; background: #f4f4f4; color: #111; font: 16px/1.4 system-ui }
        .sizing > h2 { flex-basis: 100%; margin: 0; font-size: 28px }
        .sizing-case { display: grid; gap: 12px; margin: 0 }
        .sizing-case figcaption { display: grid; font-family: ui-monospace, monospace; font-size: 13px }
        .sizing-case [data-paper-shader], .sizing-case .reference { outline: 2px dashed #e5484d; outline-offset: 4px }
        .badge { padding: 32px; border-radius: 20px; background: #fff }
        .badge h2 { margin: 0 0 8px; font-size: 32px }
        .badge p { margin: 0 }
      `}</style>
      <section className="sizing">
        <SizingCase title="OUTER DIV 480 × 240">
          <Water {...waterParams} style={{ width: 480, height: 240 }}>
            {badge}
          </Water>
        </SizingCase>
        <SizingCase title="OUTER DIV width: fit-content">
          <Water {...waterParams} style={{ width: 'fit-content' }}>
            {badge}
          </Water>
        </SizingCase>
        <SizingCase title="No shader: plain div with width: fit-content (expected box)">
          <div className="reference" style={{ width: 'fit-content' }}>
            {badge}
          </div>
        </SizingCase>
      </section>
    </>
  );
}

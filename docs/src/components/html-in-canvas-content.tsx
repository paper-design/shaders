'use client';

import { forwardRef, useState } from 'react';

export const HtmlInCanvasContent = forwardRef<
  HTMLDivElement,
  {
    toggledA: boolean;
    onToggleA: () => void;
    toggledB: boolean;
    onToggleB: () => void;
  }
>(function HtmlInCanvasContent({ toggledA, onToggleA, toggledB, onToggleB }, ref) {
  const [hoverA, setHoverA] = useState(false);
  const [hoverB, setHoverB] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: toggledB ? '#818cf8' : 'white',
      }}
    >
      <div style={{ fontSize: 16, opacity: 0.5, marginBottom: 28 }}>
        Live HTML through a WebGL shader
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <button
          onClick={onToggleA}
          onPointerEnter={() => setHoverA(true)}
          onPointerLeave={() => setHoverA(false)}
          style={{
            padding: '12px 32px',
            borderRadius: 10,
            border: '2px solid transparent',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            background: toggledA
              ? '#818cf8'
              : hoverA
                ? 'rgba(255,255,255,0.2)'
                : 'rgba(255,255,255,0.08)',
            borderColor: hoverA && !toggledA ? 'rgba(255,255,255,0.3)' : 'transparent',
            color: toggledA ? '#0f172a' : 'white',
          }}
        >
          Button 1
        </button>
        <button
          onClick={onToggleB}
          onPointerEnter={() => setHoverB(true)}
          onPointerLeave={() => setHoverB(false)}
          style={{
            padding: '12px 32px',
            borderRadius: 10,
            border: '2px solid transparent',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            background: toggledB
              ? '#818cf8'
              : hoverB
                ? 'rgba(255,255,255,0.2)'
                : 'rgba(255,255,255,0.08)',
            borderColor: hoverB && !toggledB ? 'rgba(255,255,255,0.3)' : 'transparent',
            color: toggledB ? '#0f172a' : 'white',
          }}
        >
          Button 2
        </button>
      </div>
    </div>
  );
});

'use client';

import { forwardRef, useCallback, useRef } from 'react';

export const HtmlInCanvasContent = forwardRef<
  HTMLDivElement,
  { toggled: boolean; onToggle: () => void; range: number; onRangeChange: (v: number) => void }
>(function HtmlInCanvasContent({ toggled, onToggle, range, onRangeChange }, ref) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const track = trackRef.current;
      if (!track) return;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      const update = (clientX: number) => {
        const rect = track.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        onRangeChange(Math.round(ratio * 100));
      };

      update(e.clientX);

      const onMove = (ev: PointerEvent) => update(ev.clientX);
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [onRangeChange]
  );

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'white',
      }}
    >
      <div style={{ width: 420, textAlign: 'center' }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: '-1.5px',
            marginBottom: 6,
            lineHeight: 1.1,
          }}
        >
          Paper Shaders
        </div>
        <div style={{ fontSize: 16, opacity: 0.45, marginBottom: 36 }}>Live HTML through a WebGL shader</div>

        <button
          onClick={onToggle}
          style={{
            padding: '10px 32px',
            borderRadius: 10,
            border: 'none',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms',
            background: toggled ? '#818cf8' : 'rgba(255,255,255,0.1)',
            color: toggled ? '#0f172a' : 'white',
            marginBottom: 28,
          }}
        >
          {toggled ? 'On' : 'Off'}
        </button>

        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          style={{
            position: 'relative',
            height: 28,
            cursor: 'pointer',
            touchAction: 'none',
            margin: '0 20px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.12)',
              transform: 'translateY(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: `${range}%`,
              height: 4,
              borderRadius: 2,
              background: '#818cf8',
              transform: 'translateY(-50%)',
              transition: 'width 50ms',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${range}%`,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#818cf8',
              transform: 'translate(-50%, -50%)',
              transition: 'left 50ms',
              boxShadow: '0 0 8px rgba(129,140,248,0.5)',
            }}
          />
        </div>
        <div style={{ fontSize: 13, opacity: 0.35, marginTop: 10 }}>{range}%</div>
      </div>
    </div>
  );
});

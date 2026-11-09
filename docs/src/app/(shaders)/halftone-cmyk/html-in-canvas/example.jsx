'use client';

import { useEffect, useRef, useState } from 'react';
import { HalftoneCmyk } from '@paper-design/shaders-react';
import './example.css';

export const params = {
  originX: 0,
  originY: 0,
  size: 0.12,
  gridNoise: 0,
  softness: 0.2,
  contrast: 1.2,
  gainC: 0,
  gainY: 0,
  floodC: 0,
  grainSize: 0,
};

const visibleTime = 10000;
const drawInterval = 66;
const counterEvery = 3;
const paletteCount = 3;
// Ripples in a row, then how long the dot rests in milliseconds
const bursts = [[2, 3400], [1, 4600], [3, 2800], [1, 5400], [2, 3800], [1, 3000]];
const rippleGap = 2200;
const rippleDuration = 800;
const ringCount = Math.ceil(rippleDuration / rippleGap);

// Moved with translate, so the block keeps its place in the layout
function drag(event) {
  event.preventDefault();
  const element = event.currentTarget;
  const startX = event.clientX - Number(element.dataset.x ?? 0);
  const startY = event.clientY - Number(element.dataset.y ?? 0);
  const move = ({ clientX, clientY }) => {
    element.dataset.x = clientX - startX;
    element.dataset.y = clientY - startY;
    element.style.translate = `${element.dataset.x}px ${element.dataset.y}px`;
  };
  element.setPointerCapture(event.pointerId);
  element.addEventListener('pointermove', move);
  element.addEventListener('lostpointercapture', () => element.removeEventListener('pointermove', move), { once: true });
}

export default function Example(props) {
  const rootRef = useRef(null);
  const [repaints, setRepaints] = useState(0);
  const [palette, setPalette] = useState(0);

  // The canvas fires "paint" whenever the HTML inside it changes, so this counts real repaints
  useEffect(() => {
    const root = rootRef.current;
    const canvas = root.closest('canvas');
    if (!canvas) return;
    const dot = root.querySelector('.field i');
    const rings = root.querySelectorAll('.field span');
    let ring = 0;
    let burst = 0;
    let rippleTimeout;
    const chart = root.querySelector('svg');
    const [area, line] = chart.querySelectorAll('path');
    const paintTimes = [];
    const samples = [];
    const countPaint = () => paintTimes.push(performance.now());
    canvas.addEventListener('paint', countPaint);

    // The counter and the tip of the line read the same value: repaints in the last second
    let draws = 0;
    const drawLine = () => {
      const now = performance.now();
      while (paintTimes[0] < now - 1000) paintTimes.shift();
      while (samples[1]?.time < now - visibleTime) samples.shift();
      const paints = paintTimes.length;
      samples.push({ time: now, paints });
      draws += 1;
      if (draws % counterEvery === 0) setRepaints(paints);

      const { clientWidth: width, clientHeight: height } = chart;
      const toX = (time) => width - ((now - time) / visibleTime) * width;
      const toY = (value) => height - 16 - (Math.min(value, 60) / 60) * (height - 48);
      const path = samples.map((sample) => `${toX(sample.time)} ${toY(sample.paints)}`).join(' L ');
      line.setAttribute('d', `M ${path}`);
      area.setAttribute('d', `M ${path} L ${width} ${height} L ${toX(samples[0].time)} ${height} Z`);
    };
    const drawing = setInterval(drawLine, drawInterval);

    // The dot ripples a different number of times, then rests, and the repaints drop with it
    const ripple = (ripplesLeft) => {
      rings[ring++ % ringCount].animate(
        [
          { offset: 0, width: '48px', height: '48px', opacity: 1 },
          { offset: 0.7, opacity: 1 },
          { offset: 1, width: '150px', height: '150px', opacity: 0 },
        ],
        { duration: rippleDuration, easing: 'ease-out' }
      );
      dot.animate({ scale: [1, 0.7, 1] }, { duration: rippleDuration, easing: 'ease-in-out' });
      if (ripplesLeft > 1) {
        rippleTimeout = setTimeout(() => ripple(ripplesLeft - 1), rippleGap);
      } else {
        const rest = bursts[burst++ % bursts.length][1];
        rippleTimeout = setTimeout(nextBurst, rippleDuration + rest);
      }
    };
    const nextBurst = () => ripple(bursts[burst % bursts.length][0]);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) nextBurst();

    return () => {
      canvas.removeEventListener('paint', countPaint);
      clearInterval(drawing);
      clearTimeout(rippleTimeout);
    };
  }, []);

  return (
    <HalftoneCmyk {...params} style={{ height: '100vh' }} {...props}>
      <div className="meter" data-palette={palette} ref={rootRef}>
        <h1>The canvas repaints when HTML changes</h1>

        <div className="row">
          <div className="stat">
            <b>{repaints}</b>
            <span>repaints / second</span>
          </div>
          <svg className="chart">
            <defs>
              <linearGradient id="meter-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopOpacity="0.9" />
                <stop offset="1" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path fill="url(#meter-area)" />
            <path fill="none" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="row">
          <div className="field">
            <div>
              {Array.from({ length: ringCount }, (_, index) => (
                <span key={index} />
              ))}
              <i />
            </div>
          </div>
          <button className="palette" onClick={() => setPalette((palette + 1) % paletteCount)}>
            change palette
          </button>
          <div className="drag" onPointerDown={drag}>
            drag me
          </div>
        </div>
      </div>
    </HalftoneCmyk>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { HalftoneCmyk, Metaballs } from '@paper-design/shaders-react';
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
// Metaballs colors for each palette in example.css: the field, then the balls in the ink color
const metaballs = [
  { colorBack: '#8ea6f0', colors: ['#1b2a8f'] },
  { colorBack: '#ffa58a', colors: ['#2a1410'] },
  { colorBack: '#7fbf9a', colors: ['#1f3d2b'] },
  { colorBack: '#a98ae0', colors: ['#3a1f5c'] },
];

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
  const [playing, setPlaying] = useState(false);

  // The canvas fires "paint" whenever the HTML inside it changes, so this counts real repaints
  useEffect(() => {
    const root = rootRef.current;
    const canvas = root.closest('canvas');
    if (!canvas) return;
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


    return () => {
      canvas.removeEventListener('paint', countPaint);
      clearInterval(drawing);
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
            <path />
            <path fill="none" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="row">
          <div className="field" onClick={() => setPlaying(!playing)}>
            <Metaballs {...metaballs[palette]} count={8} size={0.7} speed={playing ? 2.5 : 0} />
            <button aria-label={playing ? 'pause' : 'play'}>
              <svg viewBox="0 0 24 24">
                <path d={playing ? 'M6 4h4v16H6zM14 4h4v16h-4z' : 'M7 4l13 8-13 8z'} />
              </svg>
            </button>
          </div>
          <button className="palette" onClick={() => setPalette((palette + 1) % metaballs.length)}>
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

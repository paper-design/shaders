'use client';

import { useState } from 'react';
import { LensDistortion } from '@paper-design/shaders-react';
import { useFollowPanel } from '@/helpers/html-in-canvas-page'; // docs-only
import './example.css';

export const params = {
  dispersionColor: 0.75,
  spread: 0.15,
  angle: 28,
  perspective: 1,
  count: 50,
  focusCenter: 0.5,
  focusEdges: 0,
  swirl: 0,
  noise: 0,
  lensBulge: 0.1,
};

const dials = [
  { label: 'ev', property: '--ev', min: -2, max: 2, step: 0.1, value: 0, format: '%' },
  { label: 'zoom', property: '--zoom', min: 1, max: 3, step: 0.1, value: 1, format: '%×' },
  { label: 'wb', property: '--wb', min: 3200, max: 8000, step: 100, value: 5600, format: '%K', digits: 0 },
];

function startTimecode(element) {
  const timecode = element.querySelector('time');
  let frames = 0;
  const interval = setInterval(() => {
    if (element.dataset.recording === 'off') return;
    frames += 1;
    const parts = [frames / 86400, (frames / 1440) % 60, (frames / 24) % 60, frames % 24];
    timecode.textContent = parts.map((part) => String(Math.floor(part)).padStart(2, '0')).join(':');
  }, 1000 / 24);
  return () => clearInterval(interval);
}

function toggleRecording(event) {
  const viewfinder = event.currentTarget.closest('.viewfinder');
  viewfinder.dataset.recording = viewfinder.dataset.recording === 'off' ? 'on' : 'off';
}

function updateDial(event) {
  const input = event.target;
  if (!input.dataset.property) return;
  input.closest('.viewfinder').style.setProperty(input.dataset.property, input.value);
  const value = input.valueAsNumber.toFixed(Number(input.dataset.digits ?? 1));
  input.parentElement.querySelector('output').textContent = input.dataset.format.replace('%', value);
}

export default function Example(props) {
  // The color slider drives the shader, so the HTML also controls the lens it's seen through
  const [dispersionColor, setDispersionColor] = useState(params.dispersionColor);
  useFollowPanel(props.dispersionColor, setDispersionColor); // docs-only

  return (
    <LensDistortion {...params} style={{ height: '100vh' }} {...props} dispersionColor={dispersionColor}>
      <div className="viewfinder" data-recording="on" ref={startTimecode}>
        <img className="scene" src="/images/image-filters/003.webp" crossOrigin="anonymous" alt="" />
        <div className="tint" />
        <div className="shade" />
        <header>
          <time>00:00:00:00</time>
          <button className="rec" onClick={toggleRecording}>
            rec
          </button>
        </header>
        <footer onInput={updateDial}>
          {dials.map(({ label, property, min, max, step, value, format, digits }) => (
            <label className="dial" key={label}>
              <span>{label}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                defaultValue={value}
                data-property={property}
                data-format={format}
                data-digits={digits}
              />
              <output>{format.replace('%', value.toFixed(digits ?? 1))}</output>
            </label>
          ))}
          <label className="dial">
            <span>color</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={dispersionColor}
              onChange={(event) => setDispersionColor(event.currentTarget.valueAsNumber)}
            />
            <output>{dispersionColor.toFixed(2)}</output>
          </label>
        </footer>
      </div>
    </LensDistortion>
  );
}

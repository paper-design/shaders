'use client';

import { useState } from 'react';
import { FlutedGlass } from '@paper-design/shaders-react';
import { useFollowPanel } from '@/helpers/html-in-canvas-page'; // docs-only
import './example.css';

export const params = {
  originX: 0,
  originY: 0,
  colorShadow: '#ff9e66',
  distortionShape: 'prism',
  size: 0.85,
  distortion: 0.15,
  shift: 0,
  shadows: 0.4,
  highlights: 0,
  blur: 0,
  edges: 0,
  marginLeft: 0,
  marginRight: 0.1,
  marginTop: 0.1,
  marginBottom: 0.5,
};

const shapes = ['prism', 'lens', 'contour', 'cascade', 'flat'];

const dials = [
  { name: 'size', min: 0, max: 1, step: 0.01 },
  { name: 'distortion', min: 0, max: 1, step: 0.01 },
  { name: 'shift', min: -1, max: 1, step: 0.01 },
];

export default function Example(props) {
  // The buttons and sliders in the text drive the shader, so the HTML both shows the effect and controls it
  const { distortionShape, size, distortion, shift } = params;
  const [glass, setGlass] = useState({ distortionShape, size, distortion, shift });
  const follow = (name) => (v) => setGlass((g) => ({ ...g, [name]: v })); // docs-only
  useFollowPanel(props.distortionShape, follow('distortionShape')); // docs-only
  useFollowPanel(props.size, follow('size')); // docs-only
  useFollowPanel(props.distortion, follow('distortion')); // docs-only
  useFollowPanel(props.shift, follow('shift')); // docs-only

  return (
    <FlutedGlass {...params} style={{ height: '100vh' }} {...props} {...glass}>
      <div className="scrollable">
        <div className="page">
          <img className="backdrop" src="/images/image-filters/pumpkins.webp" crossOrigin="anonymous" alt="" />
          <article>
            <h1>Fluted glass</h1>
            <p>Live HTML, bent by a shader.</p>
            <p>Pick a flute shape:</p>
            <div className="shapes">
              {shapes.map((shape) => (
                <button
                  key={shape}
                  aria-pressed={shape === glass.distortionShape}
                  onClick={() => setGlass({ ...glass, distortionShape: shape })}
                >
                  {shape}
                </button>
              ))}
            </div>
            <p>Tune the glass:</p>
            <div className="dials">
              {dials.map(({ name, min, max, step }) => (
                <label key={name}>
                  {name}
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={glass[name]}
                    onChange={(event) => setGlass({ ...glass, [name]: event.currentTarget.valueAsNumber })}
                  />
                  <output>{glass[name].toFixed(2)}</output>
                </label>
              ))}
            </div>
            <p>
              Still real text: <kbd>⌘+F</kbd> finds it, dragging selects it.
            </p>
          </article>
          <div className="hint">
            scroll down <span>↓</span>
          </div>
        </div>
      </div>
    </FlutedGlass>
  );
}

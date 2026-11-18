'use client';

import { useState } from 'react';
import { FlutedGlass } from '@paper-design/shaders-react';
import { useFollowPanel } from '@/helpers/html-in-canvas-page'; // docs-only
import './example.css';

export const params = {
  originX: 0,
  originY: 0,
  colorShadow: '#bdfbff',
  distortionShape: 'prism',
  size: 0.8,
  distortion: 0.15,
  shift: 0,
  shadows: 0.3,
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
          <img className="backdrop" src="/images/image-filters/0020.webp" crossOrigin="anonymous" alt="" />
          <article>
            <h1>Live HTML behind glass</h1>
            <p>Everything here is actual HTML, seen through the FlutedGlass shader.</p>
            <p>Click a real button to change the flutes:</p>
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
            <p>Drag real sliders to tune them:</p>
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
              Select this text, or find it with ⌘+F.
            </p>
          </article>
          <div className="hint" aria-label="Scroll down">
            <span>↓</span>
          </div>
        </div>
      </div>
    </FlutedGlass>
  );
}

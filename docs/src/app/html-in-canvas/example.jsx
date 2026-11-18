'use client';

import { useState } from 'react';
import { LensDistortion } from '@paper-design/shaders-react';

const layouts = ['row', 'column', 'row-reverse'];

const css = `
  .flexbox ::selection { background: #222; color: #f2c14e }
  .flexbox h2::selection { background: #f2c14e; color: #222 }
`;

const block = {
  display: 'grid',
  placeItems: 'center',
  minHeight: 180,
  padding: 16,
  borderRadius: 12,
  color: '#222',
  fontSize: 30,
  fontWeight: 700,
  lineHeight: 1,
  textAlign: 'center',
};

const heading = {
  margin: 0,
  padding: '16px 20px',
  borderRadius: 12,
  background: '#222',
  color: '#f2c14e',
  fontSize: 56,
  fontWeight: 800,
  lineHeight: 0.95,
};

const tab = {
  height: 56,
  border: 0,
  borderRadius: 12,
  background: '#8fb3ea',
  color: '#222',
  font: 'inherit',
  fontSize: 22,
  fontWeight: 700,
  cursor: 'pointer',
};
const activeTab = { ...tab, background: '#222', color: '#f0efe4' };

const textBlock = {
  ...block,
  border: '3px dashed #222',
  outline: 'none',
  fontFamily: 'ui-monospace, monospace',
  fontWeight: 400,
};

const resizableBlock = { ...block, position: 'relative', overflow: 'hidden', background: '#ffc81a' };

const resizeGrip = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: 24,
  height: 24,
  background: 'linear-gradient(135deg, transparent 50%, #222 50%)',
  cursor: 'nwse-resize',
  touchAction: 'none',
};

const imageBlock = { ...block, position: 'relative', overflow: 'hidden' };
const image = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };

export default function Example() {
  const [layout, setLayout] = useState('row');
  const [size, setSize] = useState({ width: 200, height: 200 });
  const isColumn = layout === 'column';
  const minHeight = isColumn ? 100 : 180;

  const selectLayout = (name) => {
    setLayout(name);
    if ((name === 'column') !== isColumn) setSize({ ...size, height: name === 'column' ? 100 : 200 });
  };

  const startResize = (event) => {
    event.preventDefault();
    const grip = event.currentTarget;
    const { offsetWidth: width, offsetHeight: height } = grip.parentElement;
    const { clientX: startX, clientY: startY } = event;
    const move = ({ clientX, clientY }) =>
      setSize({ width: width + clientX - startX, height: height + clientY - startY });
    grip.setPointerCapture(event.pointerId);
    grip.addEventListener('pointermove', move);
    grip.addEventListener('lostpointercapture', () => grip.removeEventListener('pointermove', move), { once: true });
  };

  return (
    <LensDistortion
      spread={0.08}
      bias={0.3}
      angle={28}
      perspective={1}
      count={50}
      focusCenter={0}
      focusEdges={0.5}
      swirl={0}
      noise={0}
      lensBulge={0.1}
      dispersionColor={0.75}
      sizeToContent="both"
      className="flexbox"
      style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 480, padding: 12, background: '#f0efe4' }}
    >
      <style>{css}</style>
      <h2 style={heading}>
        we support
        <br />
        flexbox
      </h2>
      <div style={{ display: 'flex', gap: 12 }}>
        {layouts.map((name) => (
          <button
            key={name}
            onClick={() => selectLayout(name)}
            style={{ ...(name === layout ? activeTab : tab), flex: 1 }}
          >
            {name}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: layout, gap: 12 }}>
        <div
          contentEditable
          suppressContentEditableWarning
          style={{ ...textBlock, flex: 1, minWidth: 0, minHeight, overflow: 'hidden' }}
        >
          type here
        </div>
        <div
          style={{
            ...resizableBlock,
            ...size,
            flex: 'none',
            minWidth: 100,
            minHeight: 100,
            maxWidth: isColumn ? '100%' : '80%',
          }}
        >
          resize this
          <div onPointerDown={startResize} style={resizeGrip} />
        </div>
        <div style={{ ...imageBlock, flex: 1, minWidth: 0, minHeight }}>
          <img
            src="https://shaders.paper.design/images/image-filters/0018.webp"
            crossOrigin="anonymous"
            alt=""
            style={image}
          />
          <span style={{ position: 'relative' }}>this image fits</span>
        </div>
      </div>
    </LensDistortion>
  );
}

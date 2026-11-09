'use client';

import { useState } from 'react';
import { LensDistortion } from '@paper-design/shaders-react';

const layouts = ['row', 'column', 'row-reverse'];

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

export default function Example() {
  const [layout, setLayout] = useState('row');

  return (
    <LensDistortion
      spread={0.025}
      bias={0}
      angle={28}
      perspective={1}
      count={50}
      focusCenter={0.5}
      focusEdges={0}
      swirl={0}
      noise={0}
      lensBulge={0.1}
      dispersionColor={0.75}
      style={{ maxWidth: 640 }}
      sizeToContent="height"
      layoutProps={{
        className: 'flexbox',
        style: { display: 'flex', flexDirection: 'column', gap: 12, padding: 12, background: '#f0efe4' },
      }}
    >
      <style>{`
        .flexbox ::selection { background: #222; color: #f2c14e }
        .flexbox h2::selection { background: #f2c14e; color: #222 }
        .flexbox ::-webkit-resizer { background: linear-gradient(135deg, transparent 50%, #222 50%) }
      `}</style>

      <h2
        style={{
          margin: 0,
          padding: '20px 24px',
          borderRadius: 12,
          background: '#222',
          color: '#f2c14e',
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 0.95,
        }}
      >
        we support flexbox
      </h2>

      <div style={{ display: 'flex', gap: 12 }}>
        {layouts.map((name) => (
          <button
            key={name}
            onClick={() => setLayout(name)}
            style={{
              flex: 1,
              height: 56,
              border: 0,
              borderRadius: 12,
              background: name === layout ? '#222' : '#8fb3ea',
              color: name === layout ? '#f0efe4' : '#222',
              font: 'inherit',
              fontSize: 22,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: layout, gap: 12 }}>
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            ...block,
            flex: 1,
            border: '3px dashed #222',
            outline: 'none',
            fontFamily: 'ui-monospace, monospace',
            fontWeight: 400,
          }}
        >
          type here
        </div>

        <div
          style={{
            ...block,
            flex: 'none',
            width: 200,
            height: 200,
            minWidth: 140,
            minHeight: 140,
            maxWidth: '60%',
            overflow: 'hidden',
            resize: 'both',
            background: '#f08a5d',
          }}
        >
          resize this
        </div>

        <div style={{ ...block, flex: 1, position: 'relative', overflow: 'hidden' }}>
          <img
            src="https://shaders.paper.design/images/image-filters/0018.webp"
            crossOrigin="anonymous"
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <span style={{ position: 'relative' }}>this image fits</span>
        </div>
      </div>
    </LensDistortion>
  );
}

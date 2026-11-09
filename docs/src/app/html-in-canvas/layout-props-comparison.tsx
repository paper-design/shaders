
'use client';

import { ImageDithering } from '@paper-design/shaders-react';
import type { ReactNode } from 'react';
import { CodeBlock } from './code-block';

const dithering = {
  colorBack: '#222222',
  colorFront: '#8fb3ea',
  colorHighlight: '#f0efe4',
  originX: 0,
  originY: 0,
  type: '8x8',
  size: 2,
  colorSteps: 2,
} as const;

const height = { height: 140 };
const layout = { display: 'flex', gap: 8, padding: 12 };

const card = {
  flex: 1,
  padding: 12,
  border: '4px solid #8fb3ea',
  boxSizing: 'border-box',
  borderRadius: 8,
  background: '#f0efe4',
  color: '#222',
  fontSize: 16,
  fontWeight: 700,
  textAlign: 'center',
} as const;

const cards = [1, 2, 3].map((name) => (
  <div key={name} style={card}>
    {name}
  </div>
));

const options: { title: string; text: string; code: string; result: ReactNode }[] = [
  {
    title: 'Normal way: apply the layout to an inner wrapper',
    text: 'Wrap the content in your own element. It sits inside the shader, so its styles reach the cards.',
    code: `<ImageDithering style={{ height: 140 }}>
  <div style={{ display: 'flex', gap: 8, padding: 12, height: '100%' }}>
    {cards}
  </div>
</ImageDithering>`,
    result: (
      <ImageDithering {...dithering} style={height}>
        <div style={{ ...layout, height: '100%' }}>{cards}</div>
      </ImageDithering>
    ),
  },
  {
    title: "Doesn't work! Layout in the shader's style",
    text: 'The styles land on the outer div, which only holds the canvas, so they never reach the cards.',
    code: `<ImageDithering style={{ height: 140, display: 'flex', gap: 8, padding: 12 }}>
  {cards}
</ImageDithering>`,
    result: (
      <ImageDithering {...dithering} style={{ ...height, ...layout }}>
        {cards}
      </ImageDithering>
    ),
  },
  {
    title: "Can't add a wrapper? Use layoutProps",
    text: 'The styles land on the inner div, which holds the cards directly, with no extra element.',
    code: `<ImageDithering
  style={{ height: 140 }}
  layoutProps={{ style: { display: 'flex', gap: 8, padding: 12 } }}
>
  {cards}
</ImageDithering>`,
    result: (
      <ImageDithering {...dithering} style={height} layoutProps={{ style: layout }}>
        {cards}
      </ImageDithering>
    ),
  },
];

export function LayoutPropsComparison() {
  return (
    <div className="flex flex-col gap-32">
      {options.map(({ title, text, code, result }) => (
        <div key={title} className="flex flex-col gap-8">
          <h3 className="text-lg font-medium">{title}</h3>
          <p>{text}</p>
          <div className="grid items-start gap-16 lg:grid-cols-[minmax(0,1fr)_320px] [&_pre]:max-w-none!">
            <CodeBlock code={code} />
            <div className="w-full max-w-320">{result}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

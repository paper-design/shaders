'use client';

import { useState } from 'react';
import { Water } from '@paper-design/shaders-react';

/**
 * React counterpart of packages/shaders/examples/html-in-canvas.html: the children are the shader's input.
 * Browsers without HTML in canvas support show the children on top of the shader instead.
 */
export default function HtmlInCanvasTestPage() {
  const [greeting, setGreeting] = useState('');

  return (
    <>
      <style>{`
        .card { display: grid; grid-template-columns: 1fr auto; gap: 28px 16px; width: 680px; padding: 72px; border-radius: 28px; background: #fff; color: #111; font: 24px/1.4 system-ui }
        .card h1, .card p, .card output { grid-column: 1 / -1; margin: 0 }
        .card h1 { font-size: 64px; line-height: 1.1 }
        .card input { min-width: 0; padding: 16px 24px; border: 2px solid #111; border-radius: 999px; font: inherit }
        .card output:empty { display: none }
        .card button { padding: 18px 32px; border: 0; border-radius: 999px; background: #111; color: #fff; font: inherit; cursor: pointer }
      `}</style>
      <Water
        style={{ height: '100dvh' }}
        colorBack="#0d2b45"
        colorHighlight="#ffffff"
        highlights={0.2}
        waves={0.1}
        caustic={0.05}
        size={1}
      >
        <form
          className="card"
          onSubmit={(event) => {
            event.preventDefault();
            const name = new FormData(event.currentTarget).get('name');
            setGreeting(`Hi, ${name || 'stranger'}!`);
          }}
        >
          <h1>Hello from HTML</h1>
          <p>This form is live HTML under the water: select the text, type your name, press the button.</p>
          <input name="name" placeholder="your name" autoComplete="off" />
          <button>Say hi</button>
          <output>{greeting}</output>
        </form>
        <img
          src="/flowers.webp"
          alt=""
          style={{ display: 'block', width: 150, borderRadius: 28 }}
        />
      </Water>
    </>
  );
}

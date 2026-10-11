'use client';

import { Water } from '@paper-design/shaders-react';

/**
 * HTML input in React: the children of a shader that accepts HTML are its input.
 * The HTML is drawn at its own size where it's laid out, so its own CSS decides how it fills the shader.
 * Browsers without HTML in canvas support show the children on top of the shader instead.
 */
export default function HtmlInCanvasReactExample() {
  return (
    <>
      <style>{`
        .shader { width: 100%; height: 100dvh }
        .demo { display: grid; place-items: center; width: 100%; height: 100% }
        .card { display: grid; gap: 16px; width: 360px; padding: 40px; border-radius: 16px; background: #fff; color: #111; font: 16px/1.4 system-ui }
        .card h1 { margin: 0; font-size: 28px; line-height: 1.2 }
        .card p { margin: 0 }
        .card button { justify-self: start; padding: 10px 18px; border: 0; border-radius: 999px; background: #111; color: #fff; font: inherit; cursor: pointer }
      `}</style>
      <Water
        className="shader"
        colorBack="#0d2b45"
        colorHighlight="#ffffff"
        highlights={0.2}
        waves={0.1}
        caustic={0.05}
        size={1}
      >
        <div className="demo">
          <div className="card">
            <h1>Hello from HTML</h1>
            <p>This card is live HTML under the water: select the text, press the button.</p>
            <button type="button" onClick={() => alert('Pressed')}>
              Press me
            </button>
          </div>
        </div>
      </Water>
    </>
  );
}

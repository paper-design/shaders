'use client';

import { Water } from '@paper-design/shaders-react';

/**
 * React counterpart of packages/shaders/examples/html-in-canvas.html: the children are the shader's input.
 * A lone `<img>` child is wrapped and drawn as HTML, not passed to the shader as a static image.
 * Browsers without HTML in canvas support show the children on top of the shader instead.
 */
export default function HtmlInCanvasTestPage() {
  return (
    <Water
      style={{ height: '100dvh' }}
      colorBack="#0d2b45"
      colorHighlight="#ffffff"
      highlights={0.2}
      waves={0.1}
      caustic={0.05}
      size={1}
    >
      <img
        src="/flowers.webp"
        alt=""
        style={{ display: 'block', width: 640, margin: '120px auto', borderRadius: 28 }}
      />
    </Water>
  );
}

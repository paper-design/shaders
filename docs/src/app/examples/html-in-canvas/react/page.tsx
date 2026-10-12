'use client';

import { Water } from '@paper-design/shaders-react';

/**
 * HTML input in React: the children of a shader that accepts HTML are its input.
 * The HTML is drawn at its own size where it's laid out, so its own CSS decides how it fills the shader.
 * Browsers without HTML in canvas support show the children on top of the shader instead.
 *
 * Test case: a lone `<img>` child is wrapped in a drawable `<div>` and drawn as HTML,
 * not passed to the shader as a static image.
 */
export default function HtmlInCanvasReactExample() {
  return (
    <>
      <style>{`
        .shader { width: 100%; height: 100dvh }
        .photo { display: block; width: 640px; margin: 120px auto; border-radius: 28px }
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
        <img className="photo" src="/flowers.webp" alt="" />
      </Water>
    </>
  );
}

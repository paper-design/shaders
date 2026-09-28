/**
 * Experimental HTML-in-canvas support (https://github.com/WICG/html-in-canvas).
 *
 * Children of a `<canvas content="drawable">` are laid out, hit-tested and exposed to accessibility like regular DOM,
 * but only become visible when drawn into the canvas. Paper Shaders uses them as live texture sources.
 *
 * Available in Chromium behind `chrome://flags/#canvas-draw-element` or the "HTMLInCanvas" origin trial.
 */

/** A canvas with the HTML-in-canvas additions */
export interface PaintableCanvas extends HTMLCanvasElement {
  requestPaint(): void;
  /** Reports where an element is drawn, which WebGL must do for hit testing and accessibility */
  updateElementGeometry(element: Element, options?: { canvasTransform?: DOMMatrixInit }): void;
}

/** A WebGL2 context with the HTML-in-canvas additions */
export interface ElementTextureContext extends WebGL2RenderingContext {
  /** Draws into storage that the caller allocated, like texSubImage2D */
  texElementSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    element: Element,
    config?: { width?: number; height?: number; sx?: number; sy?: number; swidth?: number; sheight?: number }
  ): void;
}

/** Any element except `<img>` (which is uploaded as a static image) can be used as a live HTML texture */
export function isHtmlTextureElement(value: unknown): value is HTMLElement {
  // nodeType check instead of `instanceof` to work across document boundaries (iframes, PiP windows)
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Node).nodeType === 1 &&
    (value as Element).tagName !== 'IMG'
  );
}

/** Whether the canvas lays out its children via `content="drawable"` */
export function hasDrawableContent(canvas: Element): boolean {
  return canvas.getAttribute('content') === 'drawable';
}

/** Makes the canvas lay out its children */
export function setDrawableContent(canvas: Element, enabled: boolean): void {
  if (enabled) {
    canvas.setAttribute('content', 'drawable');
  } else {
    canvas.removeAttribute('content');
  }
}

/** Returns the `<canvas content="drawable">` that the element is an immediate child of */
export function getDrawableContentCanvas(element: Element): PaintableCanvas | null {
  const parent = element.parentElement;
  if (parent?.tagName === 'CANVAS' && hasDrawableContent(parent)) {
    return parent as PaintableCanvas;
  }
  return null;
}

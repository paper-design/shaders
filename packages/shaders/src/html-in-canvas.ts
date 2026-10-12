/**
 * Experimental HTML-in-canvas support (https://github.com/WICG/html-in-canvas),
 * available in Chromium behind `chrome://flags/#canvas-draw-element`.
 *
 * An HTML element passed as a texture uniform is moved into the shader canvas and drawn 1:1 where it's laid out:
 *
 * <div data-paper-shader>
 *   <canvas content="drawable">
 *     <div drawable>…</div>
 *   </canvas>
 * </div>
 *
 * React renders this markup itself, since it can't let its nodes be moved, and the shader adopts that canvas.
 */

export interface DrawableCanvasElement extends HTMLCanvasElement {
  requestPaint(): void;
  updateElementGeometry(element: Element, options?: { canvasTransform?: DOMMatrixInit }): void;
}

interface DrawableCanvasWebGL2Context extends WebGL2RenderingContext {
  texElementSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    element: Element,
    config?: { width?: number; height?: number; sx?: number; sy?: number; swidth?: number; sheight?: number }
  ): void;
}

export function isHtmlInCanvasSupported(): boolean {
  return (
    typeof HTMLCanvasElement !== 'undefined' &&
    'requestPaint' in HTMLCanvasElement.prototype &&
    typeof WebGL2RenderingContext !== 'undefined' &&
    'texElementSubImage2D' in WebGL2RenderingContext.prototype
  );
}

/** `<img>` stays a static image uniform. nodeType instead of `instanceof` works across iframes */
export function isHtmlUniform(value: unknown): value is HTMLElement {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Node).nodeType === 1 &&
    (value as Element).tagName !== 'IMG'
  );
}

export function findReactCanvas(values: unknown[], parentElement: Element): DrawableCanvasElement | null {
  for (const value of values) {
    const canvas = isHtmlUniform(value) ? value.parentElement : null;
    if (canvas?.tagName === 'CANVAS' && canvas.parentElement === parentElement) {
      return canvas as DrawableCanvasElement;
    }
  }
  return null;
}

/** Moves the element into the canvas, returns a function that puts it back */
export function attachHtml(canvas: DrawableCanvasElement, element: HTMLElement): () => void {
  if (element.parentElement === canvas) {
    return () => {};
  }

  const parent = element.parentNode;
  const nextSibling = element.nextSibling;
  canvas.setAttribute('content', 'drawable');
  element.setAttribute('drawable', '');
  canvas.append(element);

  return () => {
    element.removeAttribute('drawable');
    if (parent) {
      parent.insertBefore(element, nextSibling?.parentNode === parent ? nextSibling : null);
    } else {
      element.remove();
    }
  };
}

/** Draws the element into the bound texture, sized to the canvas drawing buffer */
export function drawHtml(gl: WebGL2RenderingContext, canvas: DrawableCanvasElement, element: HTMLElement): void {
  const width = Math.max(1, canvas.width);
  const height = Math.max(1, canvas.height);
  const scaleX = width / Math.max(1, canvas.clientWidth);
  const scaleY = height / Math.max(1, canvas.clientHeight);

  const left = element.offsetLeft;
  const top = element.offsetTop;
  const visibleLeft = Math.max(0, left);
  const visibleTop = Math.max(0, top);
  const visibleRight = Math.min(canvas.clientWidth, left + element.offsetWidth);
  const visibleBottom = Math.min(canvas.clientHeight, top + element.offsetHeight);
  const x0 = Math.round(visibleLeft * scaleX);
  const y0 = Math.round(visibleTop * scaleY);
  const x1 = Math.min(width, Math.round(visibleRight * scaleX));
  const y1 = Math.min(height, Math.round(visibleBottom * scaleY));

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  if (x1 > x0 && y1 > y0) {
    (gl as DrawableCanvasWebGL2Context).texElementSubImage2D(gl.TEXTURE_2D, 0, x0, y0, element, {
      sx: visibleLeft - left,
      sy: visibleTop - top,
      swidth: visibleRight - visibleLeft,
      sheight: visibleBottom - visibleTop,
      width: x1 - x0,
      height: y1 - y0,
    });
  }
}

/**
 * Experimental HTML-in-canvas support (https://github.com/WICG/html-in-canvas),
 * available in Chromium behind `chrome://flags/#canvas-draw-element`. Older Chromium versions opt the canvas in with
 * `layoutsubtree` instead of `content="drawable"`, so the canvas gets both.
 *
 * An HTML element passed as a texture uniform is drawn 1:1 where it's laid out. It has to be in this markup already,
 * and the shader adopts that canvas:
 *
 * <div data-paper-shader>
 *   <canvas content="drawable" layoutsubtree>
 *     <div drawable>…</div>
 *   </canvas>
 * </div>
 *
 * The HTML texture always matches the canvas size, so shaders sample it like any canvas-sized texture: a resize
 * captures the HTML again right away instead of waiting for the next paint.
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
  return (value as Node | null | undefined)?.nodeType === 1 && (value as Element).tagName !== 'IMG';
}

export function findDrawableCanvas(values: unknown[], parentElement: Element): DrawableCanvasElement | null {
  for (const value of values) {
    const canvas = isHtmlUniform(value) ? value.parentElement : null;
    if (canvas?.tagName === 'CANVAS' && canvas.parentElement === parentElement) {
      return canvas as DrawableCanvasElement;
    }
  }
  return null;
}

/**
 * Captures the element into the bound texture, sized to the canvas drawing buffer. The texture is only reallocated
 * (and so cleared) when its size or the drawn area changes; returns that layout to pass back in next time
 */
export function drawHtml(
  gl: WebGL2RenderingContext,
  canvas: DrawableCanvasElement,
  element: HTMLElement,
  lastLayout?: string
): string {
  const width = Math.max(1, canvas.width);
  const height = Math.max(1, canvas.height);

  // Computed sizes, since offset and client sizes are rounded and bounding rects include ancestor transforms
  const canvasStyle = getComputedStyle(canvas);
  const elementStyle = getComputedStyle(element);
  const canvasCssWidth = parseFloat(canvasStyle.width) || canvas.clientWidth;
  const canvasCssHeight = parseFloat(canvasStyle.height) || canvas.clientHeight;
  const elementCssWidth = parseFloat(elementStyle.width) || element.offsetWidth;
  const elementCssHeight = parseFloat(elementStyle.height) || element.offsetHeight;
  const scaleX = width / Math.max(1, canvasCssWidth);
  const scaleY = height / Math.max(1, canvasCssHeight);

  const left = element.offsetLeft;
  const top = element.offsetTop;
  const visibleLeft = Math.max(0, left);
  const visibleTop = Math.max(0, top);
  const visibleRight = Math.min(canvasCssWidth, left + elementCssWidth);
  const visibleBottom = Math.min(canvasCssHeight, top + elementCssHeight);
  const x0 = Math.round(visibleLeft * scaleX);
  const y0 = Math.round(visibleTop * scaleY);
  const x1 = Math.min(width, Math.round(visibleRight * scaleX));
  const y1 = Math.min(height, Math.round(visibleBottom * scaleY));

  const layout = `${width}x${height} ${x0},${y0},${x1},${y1}`;
  if (layout !== lastLayout) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }

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

  return layout;
}

/**
 * https://github.com/WICG/html-in-canvas
 *
 * An HTML uniform has to be in this markup already, `layoutsubtree` is for older Chromium:
 *
 * <div data-paper-shader>
 *   <canvas content="drawable" layoutsubtree>
 *     <div drawable>…</div>
 *   </canvas>
 * </div>
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

/** nodeType, since `instanceof` fails across iframes */
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

/** Captures the element into the bound texture, returns the layout to pass back in next time */
export function drawHtml(
  gl: WebGL2RenderingContext,
  canvas: DrawableCanvasElement,
  element: HTMLElement,
  lastLayout?: string
): string {
  const width = Math.max(1, canvas.width);
  const height = Math.max(1, canvas.height);

  // Offset and client sizes are rounded, bounding rects include ancestor transforms
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

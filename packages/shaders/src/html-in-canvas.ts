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
}

interface DrawableCanvasRenderingContext2D extends CanvasRenderingContext2D {
  drawElementImage(element: Element, dx: number, dy: number, dwidth: number, dheight: number): DOMMatrix;
}

export function isHtmlInCanvasSupported(): boolean {
  return (
    typeof HTMLCanvasElement !== 'undefined' &&
    'requestPaint' in HTMLCanvasElement.prototype &&
    typeof CanvasRenderingContext2D !== 'undefined' &&
    'drawElementImage' in CanvasRenderingContext2D.prototype
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

/**
 * Draws the element into its canvas where it's laid out, scaled to the canvas resolution.
 * Only in the canvas `paint` event, as that's when the browser has the element's paint record
 */
export function drawHtml(context: CanvasRenderingContext2D, element: HTMLElement): void {
  const canvas = context.canvas as HTMLCanvasElement;

  // Offset and client sizes are rounded, bounding rects include ancestor transforms
  const canvasStyle = getComputedStyle(canvas);
  const elementStyle = getComputedStyle(element);
  const canvasCssWidth = parseFloat(canvasStyle.width) || canvas.clientWidth;
  const canvasCssHeight = parseFloat(canvasStyle.height) || canvas.clientHeight;
  const elementCssWidth = parseFloat(elementStyle.width) || element.offsetWidth;
  const elementCssHeight = parseFloat(elementStyle.height) || element.offsetHeight;
  const scaleX = canvas.width / Math.max(1, canvasCssWidth);
  const scaleY = canvas.height / Math.max(1, canvasCssHeight);

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.globalCompositeOperation = 'source-over';
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Also places the element for hit testing and accessibility where it's drawn, which is where it's laid out
  (context as DrawableCanvasRenderingContext2D).drawElementImage(
    element,
    element.offsetLeft * scaleX,
    element.offsetTop * scaleY,
    elementCssWidth * scaleX,
    elementCssHeight * scaleY
  );
}

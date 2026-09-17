/**
 * Experimental HTML-in-canvas support (https://github.com/WICG/html-in-canvas).
 *
 * Children of a `<canvas layoutsubtree>` are laid out, hit-tested and exposed to accessibility like regular DOM,
 * but only become visible when drawn into the canvas. Paper Shaders uses them as live texture sources.
 *
 * Available in Chromium behind `chrome://flags/#canvas-draw-element` or the "HTMLInCanvas" origin trial.
 */

/** A canvas with the HTML-in-canvas additions */
export interface PaintableCanvas extends HTMLCanvasElement {
  requestPaint(): void;
  /** Reports where an element is drawn, which 3D contexts must do for hit testing and accessibility */
  updateElementGeometry?(element: Element, options?: { canvasTransform?: DOMMatrixInit }): void;
}

/** A 2D context with the HTML-in-canvas additions */
export interface ElementImageContext extends CanvasRenderingContext2D {
  drawElementImage(element: Element, dx: number, dy: number): void;
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

/** Canvas pixels per CSS pixel for one-off snapshots */
const SNAPSHOT_SCALE = 2;

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

/** Returns the `<canvas layoutsubtree>` that the element is an immediate child of */
export function getLayoutSubtreeCanvas(element: Element): PaintableCanvas | null {
  const parent = element.parentElement;
  if (parent?.tagName === 'CANVAS' && parent.hasAttribute('layoutsubtree')) {
    return parent as PaintableCanvas;
  }
  return null;
}

/**
 * Takes a one-off PNG snapshot of an element that is an immediate child of a `<canvas layoutsubtree>`,
 * cropped to the layout bounds of its painted content.
 * Used by shaders that pre-process their image into a shape (Liquid Metal, Heatmap, Gem Smoke).
 */
export function captureHtmlImage(element: HTMLElement): Promise<Blob> {
  const canvas = getLayoutSubtreeCanvas(element);
  const context = canvas?.getContext('2d') as ElementImageContext | null;

  if (!canvas || !context) {
    return Promise.reject(new Error('Paper Shaders: HTML snapshots need an element inside <canvas layoutsubtree>'));
  }

  return new Promise((resolve, reject) => {
    const handlePaint = () => {
      canvas.removeEventListener('paint', handlePaint);

      try {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawElementImage(element, 0, 0);

        const bounds = getContentBounds(element, canvas);
        const output = element.ownerDocument.createElement('canvas');
        output.width = bounds.width;
        output.height = bounds.height;
        output
          .getContext('2d')
          ?.drawImage(canvas, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);

        // The snapshot canvas is only a capture surface, keep it from showing the undistorted HTML
        context.clearRect(0, 0, canvas.width, canvas.height);

        output.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Paper Shaders: failed to encode the HTML snapshot'));
          }
        }, 'image/png');
      } catch (error) {
        reject(error);
      }
    };

    canvas.width = Math.max(1, Math.round(canvas.clientWidth * SNAPSHOT_SCALE));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * SNAPSHOT_SCALE));
    canvas.addEventListener('paint', handlePaint);
    canvas.requestPaint();
  });
}

/** Elements that paint their whole box regardless of their styles */
const REPLACED_ELEMENTS = new Set(['IMG', 'SVG', 'CANVAS', 'VIDEO', 'IFRAME', 'INPUT', 'TEXTAREA', 'SELECT']);

/**
 * Bounds of the painted content in canvas pixels.
 * Measured from layout rather than pixels, so selection highlights and focus rings don't change the crop.
 */
function getContentBounds(element: HTMLElement, canvas: HTMLCanvasElement) {
  const view = element.ownerDocument.defaultView;
  const canvasRect = canvas.getBoundingClientRect();
  const range = element.ownerDocument.createRange();
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  const include = (rect: DOMRect) => {
    if (rect.width === 0 || rect.height === 0) return;
    left = Math.min(left, rect.left);
    top = Math.min(top, rect.top);
    right = Math.max(right, rect.right);
    bottom = Math.max(bottom, rect.bottom);
  };

  const paintsBox = (node: Element) => {
    if (REPLACED_ELEMENTS.has(node.tagName.toUpperCase())) return true;
    const style = view?.getComputedStyle(node);
    if (!style) return false;
    const hasBackgroundColor = !/^(transparent|rgba\(.*,\s*0\))$/.test(style.backgroundColor);
    const hasBorder = [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].some(
      (width) => parseFloat(width) > 0
    );
    return hasBackgroundColor || hasBorder || style.backgroundImage !== 'none';
  };

  const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  for (let node: Node | null = walker.currentNode; node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent?.trim()) {
        range.selectNodeContents(node);
        include(range.getBoundingClientRect());
      }
    } else if (paintsBox(node as Element)) {
      include((node as Element).getBoundingClientRect());
    }
  }

  if (left === Infinity || canvasRect.width === 0 || canvasRect.height === 0) {
    return { x: 0, y: 0, width: canvas.width, height: canvas.height };
  }

  const scaleX = canvas.width / canvasRect.width;
  const scaleY = canvas.height / canvasRect.height;
  const x = Math.max(0, Math.floor((left - canvasRect.left) * scaleX));
  const y = Math.max(0, Math.floor((top - canvasRect.top) * scaleY));
  const width = Math.min(canvas.width, Math.ceil((right - canvasRect.left) * scaleX)) - x;
  const height = Math.min(canvas.height, Math.ceil((bottom - canvasRect.top) * scaleY)) - y;

  return { x, y, width: Math.max(1, width), height: Math.max(1, height) };
}

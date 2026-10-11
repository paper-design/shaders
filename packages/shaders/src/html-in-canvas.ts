/**
 * Experimental HTML-in-canvas support (https://github.com/WICG/html-in-canvas).
 *
 * Children of a `<canvas content="drawable">` are laid out, hit-tested and exposed to accessibility like regular DOM,
 * but only become visible when drawn into the canvas. Paper Shaders uses them as live texture sources.
 * A canvas can only draw its own children, so an HTML element passed as a texture uniform is moved into the shader canvas,
 * and put back when the uniform changes or the shader is disposed:
 *
 * <div>                              <- the shader's parent element
 *   <canvas content="drawable">      <- the shader canvas
 *     <div drawable>…</div>          <- the HTML uniform, drawn at its own size where it's laid out
 *   </canvas>
 * </div>
 *
 * When the parent element already holds this markup (as React renders it), that canvas is adopted instead of creating one.
 *
 * Available in Chromium behind `chrome://flags/#canvas-draw-element` or the "HTMLInCanvas" origin trial.
 */

/** A `<canvas>` with the HTML-in-canvas additions */
export interface DrawableCanvasElement extends HTMLCanvasElement {
  requestPaint(): void;
  /** Reports where an element is drawn, which WebGL must do for hit testing and accessibility */
  updateElementGeometry(element: Element, options?: { canvasTransform?: DOMMatrixInit }): void;
}

/** A WebGL2 context with the HTML-in-canvas additions */
export interface DrawableCanvasWebGL2Context extends WebGL2RenderingContext {
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

/**
 * Whether the browser can draw HTML into WebGL textures.
 * Where it can't, children of a `<canvas content="drawable">` are hidden fallback content, so the HTML should be shown some other way.
 */
export function isHtmlInCanvasSupported(): boolean {
  return (
    typeof HTMLCanvasElement !== 'undefined' &&
    'requestPaint' in HTMLCanvasElement.prototype &&
    typeof WebGL2RenderingContext !== 'undefined' &&
    'texElementSubImage2D' in WebGL2RenderingContext.prototype
  );
}

/** Any element except `<img>` (which is uploaded as a static image) can be a drawable child */
export function isDrawableChildCandidate(value: unknown): value is HTMLElement {
  // nodeType check instead of `instanceof` to work across document boundaries (iframes, PiP windows)
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Node).nodeType === 1 &&
    (value as Element).tagName !== 'IMG'
  );
}

/** Returns the `<canvas content="drawable">` that the element is a drawable child of */
export function getDrawableCanvas(element: Element): DrawableCanvasElement | null {
  const parent = element.parentElement;
  const isDrawableChild =
    parent?.tagName === 'CANVAS' && parent.getAttribute('content') === 'drawable' && element.hasAttribute('drawable');
  return isDrawableChild ? (parent as DrawableCanvasElement) : null;
}

/** Returns the `<canvas content="drawable">` in the parent element that holds one of the values as a drawable child */
export function findDrawableCanvas(values: unknown[], parentElement: Element): DrawableCanvasElement | null {
  for (const value of values) {
    if (isDrawableChildCandidate(value)) {
      const canvas = getDrawableCanvas(value);
      if (canvas?.parentElement === parentElement) {
        return canvas;
      }
    }
  }
  return null;
}

/**
 * Makes the element a drawable child of the canvas: marks both and moves the element into the canvas.
 * Returns a function that undoes it, putting the element back where it was.
 */
export function attachDrawableChild(canvas: DrawableCanvasElement, element: HTMLElement): () => void {
  const addedContent = canvas.getAttribute('content') !== 'drawable';
  const addedDrawable = !element.hasAttribute('drawable');
  const originalParent = element.parentNode !== canvas ? element.parentNode : null;
  const originalNextSibling = originalParent ? element.nextSibling : null;

  if (addedContent) {
    canvas.setAttribute('content', 'drawable');
  }
  if (addedDrawable) {
    element.setAttribute('drawable', '');
  }
  if (originalParent) {
    canvas.append(element);
  }

  return () => {
    if (originalParent) {
      originalParent.insertBefore(element, originalNextSibling?.parentNode === originalParent ? originalNextSibling : null);
    }
    if (addedDrawable) {
      element.removeAttribute('drawable');
    }
    if (addedContent && !canvas.querySelector(':scope > [drawable]')) {
      canvas.removeAttribute('content');
    }
  };
}

/** A drawable child used as a texture, and what drawDrawableChild keeps between paints */
export interface DrawableChild {
  element: HTMLElement;
  /** Size of the texture, which follows the canvas drawing buffer */
  textureWidth: number;
  textureHeight: number;
  /** Whether hit testing and accessibility know where the element is drawn */
  hasGeometry: boolean;
}

/** Drawing fails on every paint when the browser lacks the API, so it's only reported once */
let hasWarnedAboutDrawing = false;

/**
 * Draws the latest snapshot of the child into the bound TEXTURE_2D, runs on the canvas paint event.
 * Returns false if the browser couldn't draw it.
 */
export function drawDrawableChild(
  gl: WebGL2RenderingContext,
  canvas: DrawableCanvasElement,
  child: DrawableChild
): boolean {
  const drawableGl = gl as DrawableCanvasWebGL2Context;

  try {
    // The texture covers the canvas at the drawing buffer size, so the HTML keeps full resolution on high density screens
    const width = Math.max(1, canvas.width);
    const height = Math.max(1, canvas.height);
    const scaleX = width / Math.max(1, canvas.clientWidth);
    const scaleY = height / Math.max(1, canvas.clientHeight);

    // The child keeps its own CSS size and is drawn 1:1 where it's laid out, the part outside the canvas is cut off.
    // Offsets ignore CSS transforms, which drawing ignores too
    const { element } = child;
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

    // texElementSubImage2D draws into storage we allocate. It's reallocated (and so cleared) on every paint,
    // so nothing drawn before is left behind when the child moves or shrinks
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    child.textureWidth = width;
    child.textureHeight = height;

    // HTML arrives with straight alpha like images, and is premultiplied on upload the same way (see the ShaderMount constructor).
    // That relies on Chrome applying UNPACK_PREMULTIPLY_ALPHA_WEBGL here, which the draft WebGL spec says is ignored
    if (x1 > x0 && y1 > y0) {
      drawableGl.texElementSubImage2D(gl.TEXTURE_2D, 0, x0, y0, element, {
        sx: visibleLeft - left,
        sy: visibleTop - top,
        swidth: visibleRight - visibleLeft,
        sheight: visibleBottom - visibleTop,
        width: x1 - x0,
        height: y1 - y0,
      });
    }

    // Unlike 2D canvas, WebGL doesn't keep the element's hit testing and accessibility in sync with where it's drawn.
    // Without sizing, that's where it's laid out. Geometry persists across paints, so it's only set after the first one.
    if (!child.hasGeometry) {
      canvas.updateElementGeometry(child.element, { canvasTransform: new DOMMatrix() });
      child.hasGeometry = true;
    }
    return true;
  } catch (error) {
    if (!hasWarnedAboutDrawing) {
      hasWarnedAboutDrawing = true;
      console.warn(
        'Paper Shaders: could not draw HTML into a texture. HTML in canvas needs a browser with texElementSubImage2D, which today means Chrome Canary with chrome://flags/#canvas-draw-element enabled.',
        error
      );
    }
    return false;
  }
}

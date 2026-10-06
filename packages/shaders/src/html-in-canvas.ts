/**
 * Experimental HTML-in-canvas support (https://github.com/WICG/html-in-canvas).
 *
 * Children of a `<canvas content="drawable">` are laid out, hit-tested and exposed to accessibility like regular DOM,
 * but only become visible when drawn into the canvas. Paper Shaders uses them as live texture sources.
 * A canvas can only draw its own children, so the shader adopts the drawable canvas as its WebGL canvas:
 *
 * <div>                              <- the shader's parent element
 *   <canvas content="drawable">      <- adopted as the shader canvas
 *     <div drawable>…</div>          <- the drawable child, passed as a texture uniform
 *   </canvas>
 * </div>
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

/** A drawable child used as a texture, and what drawDrawableChild keeps between paints */
export interface DrawableChild {
  element: HTMLElement;
  /** Size of the storage allocated for the texture, reallocated when the canvas resizes */
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
    // The child fills the canvas (see defaultStyle in shader-mount.ts), so it covers the whole texture, drawn at the drawing buffer size.
    // Its own size is in CSS pixels, which would lose resolution on high density screens.
    const width = Math.max(1, canvas.width);
    const height = Math.max(1, canvas.height);

    // texElementSubImage2D draws into storage we allocate, only reallocated when the canvas resizes
    if (child.textureWidth !== width || child.textureHeight !== height) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      child.textureWidth = width;
      child.textureHeight = height;
    }

    // HTML arrives with straight alpha like images, and is premultiplied on upload the same way (see the ShaderMount constructor).
    // That relies on Chrome applying UNPACK_PREMULTIPLY_ALPHA_WEBGL here, which the draft WebGL spec says is ignored
    drawableGl.texElementSubImage2D(gl.TEXTURE_2D, 0, 0, 0, child.element, { width, height });

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

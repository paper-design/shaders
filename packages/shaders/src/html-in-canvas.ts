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

/** Returns a `<canvas content="drawable">` in the parent element that holds one of the values as live HTML */
export function findDrawableContentCanvas(values: unknown[], parentElement: Element): PaintableCanvas | null {
  for (const value of values) {
    if (isHtmlTextureElement(value)) {
      const canvas = getDrawableContentCanvas(value);
      if (canvas?.parentElement === parentElement) {
        return canvas;
      }
    }
  }
  return null;
}

/** An element laid out inside a `<canvas content="drawable">`, and what's needed to put it back */
export interface DrawableElement {
  element: HTMLElement;
  addedDrawable: boolean;
  /** Where the element was before it was moved into the canvas, null if it wasn't moved */
  originalParent: Node | null;
  originalNextSibling: Node | null;
}

/** Moves the element into the canvas and marks it drawable, since only drawable elements can be drawn */
export function attachToCanvas(canvas: PaintableCanvas, element: HTMLElement): DrawableElement {
  setDrawableContent(canvas, true);

  const isMoved = element.parentNode !== canvas;
  const drawable: DrawableElement = {
    element,
    addedDrawable: !element.hasAttribute('drawable'),
    originalParent: isMoved ? element.parentNode : null,
    originalNextSibling: isMoved ? element.nextSibling : null,
  };

  if (isMoved) {
    canvas.append(element);
  }
  if (drawable.addedDrawable) {
    element.setAttribute('drawable', '');
  }
  return drawable;
}

/** Undoes attachToCanvas, putting the element back where it was */
export function detachFromCanvas({ element, addedDrawable, originalParent, originalNextSibling }: DrawableElement): void {
  if (addedDrawable) {
    element.removeAttribute('drawable');
  }
  if (originalParent) {
    originalParent.insertBefore(element, originalNextSibling?.parentNode === originalParent ? originalNextSibling : null);
  }
}

/** What drawElementToTexture keeps between paints */
export interface ElementTextureState {
  /** Size of the storage allocated for the texture, reallocated when the canvas resizes */
  textureWidth: number;
  textureHeight: number;
  /** Whether hit testing and accessibility know where the element is drawn */
  hasGeometry: boolean;
}

/** Drawing fails on every paint when the browser lacks the API, so it's only reported once */
let hasWarnedAboutDrawing = false;

/**
 * Draws the latest snapshot of the element into the bound TEXTURE_2D, runs on the canvas paint event.
 * Returns false if the browser couldn't draw it.
 */
export function drawElementToTexture(
  gl: WebGL2RenderingContext,
  canvas: PaintableCanvas,
  target: { element: HTMLElement } & ElementTextureState
): boolean {
  const elementGl = gl as ElementTextureContext;

  try {
    // The element fills the canvas (see defaultStyle in shader-mount.ts), so it covers the whole texture, drawn at the drawing buffer size.
    // Its own size is in CSS pixels, which would lose resolution on high density screens.
    const width = Math.max(1, canvas.width);
    const height = Math.max(1, canvas.height);

    // texElementSubImage2D draws into storage we allocate, only reallocated when the canvas resizes
    if (target.textureWidth !== width || target.textureHeight !== height) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      target.textureWidth = width;
      target.textureHeight = height;
    }

    // HTML arrives with straight alpha like images, and is premultiplied on upload the same way (see the ShaderMount constructor).
    // That relies on Chrome applying UNPACK_PREMULTIPLY_ALPHA_WEBGL here, which the draft WebGL spec says is ignored
    elementGl.texElementSubImage2D(gl.TEXTURE_2D, 0, 0, 0, target.element, { width, height });

    // Unlike 2D canvas, WebGL doesn't keep the element's hit testing and accessibility in sync with where it's drawn.
    // Without sizing, that's where it's laid out. Geometry persists across paints, so it's only set after the first one.
    if (!target.hasGeometry) {
      canvas.updateElementGeometry(target.element, { canvasTransform: new DOMMatrix() });
      target.hasGeometry = true;
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

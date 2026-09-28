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
  /** Reports where an element is drawn, which 3D contexts must do for hit testing and accessibility */
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

/** The sizing uniforms that place an image in the shader, as the vertex shader reads them */
export interface ImageSizing {
  fit: number;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  originX: number;
  originY: number;
}

/**
 * Maps the border box of an HTML texture element to where the shader draws it, in canvas CSS pixels.
 * Mirrors how the vertex shader computes v_imageUV for an element that covers the canvas,
 * so hit testing follows fit, scale, rotation and offset. Per-pixel distortion in fragment shaders isn't included.
 */
export function getHtmlTextureTransform(
  canvas: HTMLCanvasElement,
  { fit, scale, rotation, offsetX, offsetY, originX, originY }: ImageSizing
): DOMMatrix {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width === 0 || height === 0 || scale === 0) return new DOMMatrix();

  const aspectRatio = width / height;
  const resolutionX = Math.max(1, canvas.width);
  const resolutionY = Math.max(1, canvas.height);
  let imageBoxWidth: number;
  if (fit === 1) {
    imageBoxWidth = Math.min(resolutionX / aspectRatio, resolutionY) * aspectRatio;
  } else if (fit === 2) {
    imageBoxWidth = Math.max(resolutionX / aspectRatio, resolutionY) * aspectRatio;
  } else {
    imageBoxWidth = 10;
  }
  const imageBoxScaleX = resolutionX / imageBoxWidth;
  const imageBoxScaleY = resolutionY / (imageBoxWidth / aspectRatio);
  const boxOriginX = 0.5 - originX;
  const boxOriginY = originY - 0.5;
  const angle = (rotation * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // Canvas CSS pixels to element CSS pixels, step by step as in the vertex shader, then inverted
  const canvasToElement = new DOMMatrix([1 / width, 0, 0, -1 / height, -0.5, 0.5])
    .preMultiplySelf(new DOMMatrix([imageBoxScaleX, 0, 0, imageBoxScaleY, 0, 0]))
    .preMultiplySelf(
      new DOMMatrix([
        1,
        0,
        0,
        1,
        boxOriginX * (imageBoxScaleX - 1) - offsetX,
        boxOriginY * (imageBoxScaleY - 1) + offsetY,
      ])
    )
    .preMultiplySelf(new DOMMatrix([1 / scale, 0, 0, 1 / scale, 0, 0]))
    .preMultiplySelf(new DOMMatrix([aspectRatio, 0, 0, 1, 0, 0]))
    .preMultiplySelf(new DOMMatrix([cos, sin, -sin, cos, 0, 0]))
    .preMultiplySelf(new DOMMatrix([1 / aspectRatio, 0, 0, 1, 0, 0]))
    .preMultiplySelf(new DOMMatrix([width, 0, 0, -height, 0.5 * width, 0.5 * height]));

  return canvasToElement.inverse();
}

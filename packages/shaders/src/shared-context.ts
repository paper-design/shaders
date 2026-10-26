/**
 * One WebGL context for every shader on the page, so the browser's limit on live contexts (16 in Chrome) doesn't
 * apply and nested shaders don't add contexts.
 *
 * Each shader keeps its own 2D canvas in the page, so the browser still does all the layering (stacking, transforms,
 * clipping, filters). The shader is rendered into a corner of the shared canvas and copied onto the shader's canvas:
 *
 * shader canvas (2D) ── its HTML, drawn with drawElementImage ──► texture in the shared context
 * shared canvas (WebGL) ── the shader's output ──► shader canvas (2D), replacing the HTML drawing in the same task
 *
 * Only used in Chromium: there the copies stay on the GPU and off the main thread. In Firefox each copy reads the
 * pixels back on the main thread, which makes it several times slower than a context per shader.
 */

export interface SharedContextUser {
  /** Called with the new context after the shared one was lost, to recreate everything the shader had in it */
  restoreContext(gl: WebGL2RenderingContext): void;
}

let enabled: boolean | null = null;
let shared: WebGL2RenderingContext | null = null;
const users = new Set<SharedContextUser>();

export function isSharedContextEnabled(): boolean {
  enabled ??= typeof OffscreenCanvas !== 'undefined' && isChromium();
  return enabled;
}

/** Turns the shared context on or off for the shaders mounted from now on, mostly to compare against a context per shader */
export function setSharedContextEnabled(value: boolean): void {
  enabled = value;
}

function isChromium(): boolean {
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
  if (brands) {
    return brands.some(({ brand }) => brand === 'Chromium');
  }
  return /\bChrom(e|ium)\//.test(navigator.userAgent);
}

function createContext(): WebGL2RenderingContext | null {
  const canvas = new OffscreenCanvas(1, 1);
  const gl = canvas.getContext('webgl2', { antialias: false, depth: false, stencil: false });
  if (!gl) return null;

  // Premultiplied, so that filtering doesn't bleed the color of transparent pixels into the edges
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  // Each shader clears and draws only its own corner
  gl.enable(gl.SCISSOR_TEST);

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    if (shared !== gl) return;
    // The browser rarely restores a lost context, so a new one is made. The shader canvases keep showing their last
    // frame until then
    shared = null;
    setTimeout(() => {
      if (users.size === 0 || shared !== null) return;
      shared = createContext();
      if (shared) {
        users.forEach((user) => user.restoreContext(shared!));
      }
    });
  });

  return gl;
}

export function acquireSharedContext(user: SharedContextUser): WebGL2RenderingContext | null {
  shared ??= createContext();
  if (shared) {
    users.add(user);
  }
  return shared;
}

export function releaseSharedContext(user: SharedContextUser): void {
  users.delete(user);
  if (users.size === 0 && shared) {
    // Free the drawing buffer now instead of whenever GC collects the canvas
    shared.getExtension('WEBGL_lose_context')?.loseContext();
    shared = null;
  }
}

/** Makes the shared canvas large enough for a shader of this size and limits drawing to its corner */
export function prepareSharedCorner(gl: WebGL2RenderingContext, width: number, height: number): void {
  const canvas = gl.canvas;
  // Only grows, since resizing reallocates the drawing buffer
  if (canvas.width < width) canvas.width = width;
  if (canvas.height < height) canvas.height = height;
  gl.viewport(0, 0, width, height);
  gl.scissor(0, 0, width, height);
}

/** Copies the shader's corner of the shared canvas onto the shader's own canvas. Must run in the task that rendered it */
export function copySharedCorner(gl: WebGL2RenderingContext, output: CanvasRenderingContext2D): void {
  const { width, height } = output.canvas;
  const source = gl.canvas;
  output.globalCompositeOperation = 'copy';
  // The corner is the bottom left one in WebGL coordinates, which is the bottom left one in the image too
  output.drawImage(source, 0, source.height - height, width, height, 0, 0, width, height);
  output.globalCompositeOperation = 'source-over';
}

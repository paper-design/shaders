/**
 * Shared WebGL contexts for every shader on the page, so the browser's limit on live contexts (16 in Chrome) doesn't
 * apply and nested shaders don't add contexts.
 *
 * Each shader keeps its own 2D canvas in the page, so the browser still does all the layering (stacking, transforms,
 * clipping, filters). The shader is rendered into a shared canvas and copied onto the shader's canvas:
 *
 * shader canvas (2D) ── its HTML, drawn with drawElementImage ──► texture in the shared context
 * shared canvas (WebGL) ── the shader's output ──► shader canvas (2D)
 *
 * Copying waits for the GPU to finish what was drawn, so there are two contexts:
 * - the atlas, for animated shaders without HTML: once a frame, all of them are drawn into their own tiles of one
 *   canvas, which is handed over in one piece and copied from, so the whole frame waits only once
 * - the direct one, for everything else: a shader is drawn into the corner of a canvas the size of the largest such
 *   shader and copied right away, in the same task. Shaders with HTML have to, since they render in their canvas'
 *   paint event. It's kept apart from the atlas because each copy costs more the larger the canvas is
 *
 * Only used in Chromium: there the copies stay on the GPU and off the main thread. In Firefox each copy reads the
 * pixels back on the main thread, which makes it several times slower than a context per shader.
 */

export interface SharedContextUser {
  /** Called with the new context after the shared one was lost, to recreate everything the shader had in it */
  restoreContext(gl: WebGL2RenderingContext): void;
}

/** A shader drawn in the atlas */
export interface AtlasUser extends SharedContextUser {
  /** The size of the next frame, or null to skip it */
  getAtlasTileSize(): { width: number; height: number } | null;
  /** Draws the next frame with its bottom left corner at x, y in WebGL coordinates */
  drawAtlasTile(x: number, y: number, time: number): void;
  /** Copies the frame from the atlas image, where its top left corner is at x, y */
  copyAtlasTile(image: ImageBitmap, x: number, y: number): void;
}

let enabled: boolean | null = null;

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

class SharedContext<User extends SharedContextUser> {
  gl: WebGL2RenderingContext | null = null;
  readonly users = new Set<User>();

  acquire(user: User): WebGL2RenderingContext | null {
    this.gl ??= this.create();
    if (this.gl) {
      this.users.add(user);
    }
    return this.gl;
  }

  release(user: User): void {
    this.users.delete(user);
    if (this.users.size === 0 && this.gl) {
      // Free the drawing buffer now instead of whenever GC collects the canvas
      this.gl.getExtension('WEBGL_lose_context')?.loseContext();
      this.gl = null;
    }
  }

  private create(): WebGL2RenderingContext | null {
    const canvas = new OffscreenCanvas(1, 1);
    const gl = canvas.getContext('webgl2', { antialias: false, depth: false, stencil: false });
    if (!gl) return null;

    // Premultiplied, so that filtering doesn't bleed the color of transparent pixels into the edges
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    // Each shader clears and draws only its own area
    gl.enable(gl.SCISSOR_TEST);

    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      if (this.gl !== gl) return;
      // The browser rarely restores a lost context, so a new one is made. The shader canvases keep showing their last
      // frame until then
      this.gl = null;
      setTimeout(() => {
        if (this.users.size === 0 || this.gl !== null) return;
        this.gl = this.create();
        const restored = this.gl;
        if (restored) {
          this.users.forEach((user) => user.restoreContext(restored));
        }
      });
    });

    return gl;
  }
}

const direct = new SharedContext<SharedContextUser>();
const atlas = new SharedContext<AtlasUser>();

export function acquireSharedContext(user: SharedContextUser): WebGL2RenderingContext | null {
  return direct.acquire(user);
}

export function releaseSharedContext(user: SharedContextUser): void {
  direct.release(user);
}

/** Makes the direct canvas large enough for a shader of this size and limits drawing to its corner */
export function prepareSharedCorner(gl: WebGL2RenderingContext, width: number, height: number): void {
  const canvas = gl.canvas;
  // Only grows, since resizing reallocates the drawing buffer
  if (canvas.width < width) canvas.width = width;
  if (canvas.height < height) canvas.height = height;
  gl.viewport(0, 0, width, height);
  gl.scissor(0, 0, width, height);
}

/** Copies the shader's corner of the direct canvas onto the shader's own canvas. Must run in the task that rendered it */
export function copySharedCorner(gl: WebGL2RenderingContext, output: CanvasRenderingContext2D): void {
  const { width, height } = output.canvas;
  const source = gl.canvas;
  output.globalCompositeOperation = 'copy';
  // The corner is the bottom left one in WebGL coordinates, which is the bottom left one in the image too
  output.drawImage(source, 0, source.height - height, width, height, 0, 0, width, height);
  output.globalCompositeOperation = 'source-over';
}

export function acquireAtlasContext(user: AtlasUser): WebGL2RenderingContext | null {
  return atlas.acquire(user);
}

export function releaseAtlasContext(user: AtlasUser): void {
  queued.delete(user);
  drawnNow.delete(user);
  atlas.release(user);
}

const queued = new Set<AtlasUser>();
let frameId: number | null = null;

/** Draws the shader in the atlas on the next animation frame */
export function queueAtlasTile(user: AtlasUser): void {
  queued.add(user);
  frameId ??= requestAnimationFrame(drawAtlas);
}

const drawnNow = new Set<AtlasUser>();
let isBatching = false;

/**
 * Draws the shader in the atlas right away, for a resize: the canvas was just cleared and has to be filled before the
 * browser paints. Inside batchAtlasTiles, it's drawn when the batch ends, together with the others
 */
export function drawAtlasTileNow(user: AtlasUser): void {
  drawnNow.add(user);
  if (!isBatching) {
    drawDrawnNow();
  }
}

/** Collects the shaders drawn with drawAtlasTileNow during the callback, so that they wait for the GPU only once */
export function batchAtlasTiles(callback: () => void): void {
  isBatching = true;
  try {
    callback();
  } finally {
    isBatching = false;
  }
  drawDrawnNow();
}

function drawDrawnNow(): void {
  if (drawnNow.size === 0) return;
  const users = [...drawnNow];
  drawnNow.clear();
  drawTiles(users, performance.now());
}

function drawAtlas(time: number): void {
  frameId = null;
  const users = [...queued];
  queued.clear();
  drawTiles(users, time);
}

interface Tile {
  user: AtlasUser;
  width: number;
  height: number;
  x: number;
  top: number;
}

/**
 * Packs the shaders into rows of tiles, tallest first. A tile that doesn't fit in the largest canvas the context
 * allows starts a new page, which is drawn and copied on its own
 */
function drawTiles(users: AtlasUser[], time: number): void {
  const gl = atlas.gl;
  // Lost: restoring the context queues its shaders again
  if (!gl) return;

  const tiles: Tile[] = [];
  users.forEach((user) => {
    const size = user.getAtlasTileSize();
    if (size && size.width > 0 && size.height > 0) {
      tiles.push({ user, ...size, x: 0, top: 0 });
    }
  });
  if (tiles.length === 0) return;
  tiles.sort((a, b) => b.height - a.height);

  const maxSize = Math.min(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE), ...gl.getParameter(gl.MAX_VIEWPORT_DIMS));
  const widest = Math.max(...tiles.map((tile) => tile.width));
  const area = tiles.reduce((sum, tile) => sum + tile.width * tile.height, 0);
  // Roughly square, so that neither side runs into the size limit first
  const rowWidth = Math.min(maxSize, Math.max(widest, Math.ceil(Math.sqrt(area))));

  let page: Tile[] = [];
  let pageWidth = 0;
  let rowTop = 0;
  let rowHeight = 0;
  let x = 0;
  for (const tile of tiles) {
    if (x > 0 && x + tile.width > rowWidth) {
      rowTop += rowHeight;
      rowHeight = 0;
      x = 0;
    }
    if (page.length > 0 && rowTop + tile.height > maxSize) {
      drawAtlasPage(gl, page, pageWidth, rowTop + rowHeight, time);
      page = [];
      pageWidth = 0;
      rowTop = 0;
      rowHeight = 0;
      x = 0;
    }
    tile.x = x;
    tile.top = rowTop;
    x += tile.width;
    rowHeight = Math.max(rowHeight, tile.height);
    pageWidth = Math.max(pageWidth, x);
    page.push(tile);
  }
  drawAtlasPage(gl, page, pageWidth, rowTop + rowHeight, time);
}

function drawAtlasPage(gl: WebGL2RenderingContext, tiles: Tile[], width: number, height: number, time: number): void {
  const canvas = gl.canvas as OffscreenCanvas;
  // Usually the same every frame, and resizing reallocates the drawing buffer
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  tiles.forEach((tile) => tile.user.drawAtlasTile(tile.x, height - tile.top - tile.height, time));
  // Handed over instead of copied, and the canvas starts the next page empty
  const image = canvas.transferToImageBitmap();
  tiles.forEach((tile) => tile.user.copyAtlasTile(image, tile.x, tile.top));
  image.close();
}

/**
 * Browsers allow a page around 16 WebGL contexts and drop the oldest ones past that.
 * Every shader in a document draws with one shared context, then copies its frame into its own 2D canvas.
 *
 * Copying from a WebGL canvas makes the browser snapshot it, which costs about the same however small the copy is.
 * So each animation frame draws all the shaders that need it side by side first, then copies them all from one snapshot.
 */

const DEFAULT_CONTEXT_ATTRIBUTES: WebGLContextAttributes = {
  antialias: false,
  depth: false,
  stencil: false,
};

/** Shaders are laid out in rows up to this size, a larger shader gets the area to itself */
const MAX_ATLAS_SIZE = 4096;

/** A shader drawing with a shared context */
export interface SharedContextUser {
  /** The 2D canvas the frame is copied into */
  readonly canvasElement: HTMLCanvasElement;
  readonly context2d: CanvasRenderingContext2D;
  /** The size to draw at, the canvas is resized to it only when the frame is copied so it never shows blank */
  readonly frameWidth: number;
  readonly frameHeight: number;
  /** Draws the frame into the current viewport */
  drawFrame(time: number): void;
}

interface Slot {
  user: SharedContextUser;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class SharedContext {
  public readonly gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private users = new Set<SharedContextUser>();
  private onEmpty: () => void;
  private scheduledUsers = new Set<SharedContextUser>();
  private rafId: number | null = null;
  /** Each shader draws here first, then it's copied into its area of the canvas */
  private frameFramebuffer: WebGLFramebuffer | null = null;
  private frameTexture: WebGLTexture | null = null;
  private frameTextureWidth = 0;
  private frameTextureHeight = 0;

  constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, onEmpty: () => void) {
    this.canvas = canvas;
    this.gl = gl;
    this.onEmpty = onEmpty;

    // Grows to the largest area drawn
    this.canvas.width = 1;
    this.canvas.height = 1;

    this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    // Clears only the area of the shader being drawn
    this.gl.enable(this.gl.SCISSOR_TEST);
  }

  public get isLost(): boolean {
    return this.gl.isContextLost();
  }

  public addUser = (user: SharedContextUser): void => {
    this.users.add(user);
  };

  public removeUser = (user: SharedContextUser): void => {
    this.users.delete(user);
    this.scheduledUsers.delete(user);
    if (this.users.size > 0) return;

    this.stop();
    // Free the drawing buffer now instead of whenever GC collects the canvas
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  };

  /** Draws the user's frame in the next animation frame, together with the other scheduled shaders */
  public scheduleFrame = (user: SharedContextUser): void => {
    this.scheduledUsers.add(user);
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.renderScheduledFrames);
    }
  };

  public cancelFrame = (user: SharedContextUser): void => {
    this.scheduledUsers.delete(user);
  };

  /** Draws the user's frame right away, e.g. so a resized canvas isn't blank until the next frame */
  public drawNow = (user: SharedContextUser, time: number): void => {
    this.scheduledUsers.delete(user);
    this.drawAndCopy([user], time);
  };

  private renderScheduledFrames = (time: number): void => {
    this.rafId = null;

    // Users that keep animating schedule their next frame while drawing this one
    const users = [...this.scheduledUsers];
    this.scheduledUsers.clear();

    this.drawAndCopy(users, time);
  };

  private drawAndCopy = (users: SharedContextUser[], time: number): void => {
    if (this.isLost) return;

    let slots: Slot[] = [];
    let x = 0;
    let y = 0;
    let rowHeight = 0;

    for (const user of users) {
      const width = user.frameWidth;
      const height = user.frameHeight;

      // Nothing to draw, the canvas is emptied to match
      if (width === 0 || height === 0) {
        user.canvasElement.width = width;
        user.canvasElement.height = height;
        continue;
      }

      // Next row
      if (x > 0 && x + width > MAX_ATLAS_SIZE) {
        x = 0;
        y += rowHeight;
        rowHeight = 0;
      }

      // Out of room, draws and copies the shaders laid out so far and starts over
      if (y > 0 && y + height > MAX_ATLAS_SIZE) {
        this.drawAndCopySlots(slots, time);
        slots = [];
        x = 0;
        y = 0;
        rowHeight = 0;
      }

      slots.push({ user, x, y, width, height });

      x += width;
      rowHeight = Math.max(rowHeight, height);
    }

    this.drawAndCopySlots(slots, time);
  };

  private drawAndCopySlots = (slots: Slot[], time: number): void => {
    // Grows before drawing, as resizing clears the canvas. Never shrinks, which would reallocate its buffer
    for (const slot of slots) {
      const right = slot.x + slot.width;
      const bottom = slot.y + slot.height;
      if (this.canvas.width < right || this.canvas.height < bottom) {
        this.canvas.width = Math.max(this.canvas.width, right);
        this.canvas.height = Math.max(this.canvas.height, bottom);
      }
    }

    for (const slot of slots) {
      this.drawSlot(slot, time);
    }

    this.copySlots(slots);
  };

  private drawSlot = (slot: Slot, time: number): void => {
    const { x, y, width, height } = slot;

    // Shaders draw at the origin, as `gl_FragCoord` counts from the corner of what is drawn into
    this.bindFrameTarget(width, height);
    this.gl.viewport(0, 0, width, height);
    this.gl.scissor(0, 0, width, height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    slot.user.drawFrame(time);

    // Slots are positioned from the top, WebGL counts from the bottom
    const glY = this.canvas.height - y - height;
    this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, null);
    this.gl.scissor(x, glY, width, height);
    this.gl.blitFramebuffer(
      0,
      0,
      width,
      height,
      x,
      glY,
      x + width,
      glY + height,
      this.gl.COLOR_BUFFER_BIT,
      this.gl.NEAREST
    );
  };

  /** Binds a framebuffer of at least this size to draw a shader into, it only grows */
  private bindFrameTarget = (width: number, height: number): void => {
    if (!this.frameFramebuffer || !this.frameTexture) {
      this.frameTexture = this.gl.createTexture();
      this.frameFramebuffer = this.gl.createFramebuffer();
    }

    const needsResize = this.frameTextureWidth < width || this.frameTextureHeight < height;
    if (needsResize) {
      this.frameTextureWidth = Math.max(this.frameTextureWidth, width);
      this.frameTextureHeight = Math.max(this.frameTextureHeight, height);

      // Shaders bind their textures again before drawing
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.frameTexture);
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA8,
        this.frameTextureWidth,
        this.frameTextureHeight,
        0,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        null
      );
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameFramebuffer);
      this.gl.framebufferTexture2D(
        this.gl.FRAMEBUFFER,
        this.gl.COLOR_ATTACHMENT0,
        this.gl.TEXTURE_2D,
        this.frameTexture,
        0
      );
      // A sampler left on unit 0 would read the texture being drawn into
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameFramebuffer);
  };

  private copySlots = (slots: Slot[]): void => {
    for (const { user, x, y, width, height } of slots) {
      // Resized in the same task as the copy, so the browser never paints it cleared
      if (user.canvasElement.width !== width || user.canvasElement.height !== height) {
        user.canvasElement.width = width;
        user.canvasElement.height = height;
      }

      // Resizing the target canvas resets its state, so it's set every time
      user.context2d.globalCompositeOperation = 'copy';
      user.context2d.drawImage(this.canvas, x, y, width, height, 0, 0, width, height);
    }
  };

  private stop = (): void => {
    this.onEmpty();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.scheduledUsers.clear();
  };
}

const sharedContexts = new WeakMap<Document, Map<string, SharedContext>>();

/** The shared context of the document for these attributes, or null if WebGL isn't available */
export function getSharedContext(
  ownerDocument: Document,
  attributes: WebGLContextAttributes | undefined,
  user: SharedContextUser
): SharedContext | null {
  const contextAttributes = getContextAttributes(attributes);
  const key = JSON.stringify(contextAttributes);

  let documentContexts = sharedContexts.get(ownerDocument);
  if (!documentContexts) {
    documentContexts = new Map();
    sharedContexts.set(ownerDocument, documentContexts);
  }

  let context = documentContexts.get(key);
  if (!context) {
    const canvas = ownerDocument.createElement('canvas');
    const gl = canvas.getContext('webgl2', contextAttributes);
    if (!gl) return null;

    const contexts = documentContexts;
    context = new SharedContext(canvas, gl, () => {
      if (contexts.get(key) === context) {
        contexts.delete(key);
      }
    });
    documentContexts.set(key, context);
  }

  context.addUser(user);
  return context;
}

function getContextAttributes(attributes: WebGLContextAttributes | undefined): WebGLContextAttributes {
  const contextAttributes = { ...DEFAULT_CONTEXT_ATTRIBUTES, ...attributes };

  // Each shader keeps its pixels in its 2D canvas, so reading them never needs the drawing buffer preserved
  delete contextAttributes.preserveDrawingBuffer;

  return contextAttributes;
}

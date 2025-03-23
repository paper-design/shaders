/** Uniform types that we support to be auto-mapped into the fragment shader */
export type ShaderMountUniforms = Record<string, number | number[] | HTMLImageElement>;

/** A canvas element that has a ShaderMount available on it */
export interface PaperShaderCanvasElement extends HTMLCanvasElement {
  paperShaderMount: ShaderMount | undefined;
}
/** Check if a canvas element is a ShaderCanvas */
export function isPaperShaderCanvas(canvas: HTMLCanvasElement): canvas is PaperShaderCanvasElement {
  return 'paperShaderMount' in canvas;
}

export class ShaderMount {
  private canvas: PaperShaderCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private uniformLocations: Record<string, WebGLUniformLocation | null> = {};
  /** The fragment shader that we are using */
  private fragmentShader: string;
  /** Stores the RAF for the render loop */
  private rafId: number | null = null;
  /** Time of the last rendered frame */
  private lastRenderTime = 0;
  /** Total time that we have played any animation, passed as a uniform to the shader for time-based VFX */
  private totalFrameTime = 0;
  /** The current speed that we progress through animation time (multiplies by delta time every update). Allows negatives to play in reverse. If set to 0, rAF will stop entirely so static shaders have no recurring performance costs */
  private speed = 1;
  /** Uniforms that are provided by the user for the specific shader being mounted (not including uniforms that this Mount adds, like time and resolution) */
  private providedUniforms: ShaderMountUniforms;
  /** Just a sanity check to make sure frames don't run after we're disposed */
  private hasBeenDisposed = false;
  /** If the resolution of the canvas has changed since the last render */
  private resolutionChanged = true;
  /** Store textures that are provided by the user */
  private textures: Map<string, WebGLTexture> = new Map();

  constructor(
    canvas: HTMLCanvasElement,
    fragmentShader: string,
    uniforms: ShaderMountUniforms = {},
    webGlContextAttributes?: WebGLContextAttributes,
    /** The speed of the animation, or 0 to stop it. Supports negative values to play in reverse. */
    speed = 1,
    /** Pass a frame to offset the starting u_time value and give deterministic results*/
    frame = 0
  ) {
    this.canvas = canvas as PaperShaderCanvasElement;
    this.fragmentShader = fragmentShader;
    this.providedUniforms = uniforms;
    // Base our starting animation time on the provided frame value
    this.totalFrameTime = frame;

    const gl = canvas.getContext('webgl2', webGlContextAttributes);
    if (!gl) {
      throw new Error('WebGL not supported');
    }
    this.gl = gl;

    this.initProgram();
    this.setupPositionAttribute();
    // Grab the locations of the uniforms in the fragment shader
    this.setupUniforms();
    // Put the user provided values into the uniforms
    this.setUniformValues(this.providedUniforms);
    // Set up the resize observer to handle window resizing and set u_resolution
    this.setupResizeObserver();

    // Set the animation speed after everything is ready to go
    this.setSpeed(speed);

    // Mark canvas as paper shader mount
    this.canvas.setAttribute('data-paper-shaders', 'true');

    // Add the shaderMount instance to the canvas element to make it easily accessible
    this.canvas.paperShaderMount = this;
  }

  private initProgram = () => {
    const program = createProgram(this.gl, vertexShaderSource, this.fragmentShader);
    if (!program) return;
    this.program = program;
  };

  private setupPositionAttribute = () => {
    const positionAttributeLocation = this.gl.getAttribLocation(this.program!, 'a_position');
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(positionAttributeLocation);
    this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
  };

  private setupUniforms = () => {
    // Create a map to store all uniform locations
    const uniformLocations: Record<string, WebGLUniformLocation | null> = {
      u_time: this.gl.getUniformLocation(this.program!, 'u_time'),
      u_pixelRatio: this.gl.getUniformLocation(this.program!, 'u_pixelRatio'),
      u_resolution: this.gl.getUniformLocation(this.program!, 'u_resolution'),
    };

    // Add locations for all provided uniforms
    Object.entries(this.providedUniforms).forEach(([key, value]) => {
      uniformLocations[key] = this.gl.getUniformLocation(this.program!, key);

      // For texture uniforms, also look for the aspect ratio uniform
      if (value instanceof HTMLImageElement) {
        const aspectRatioUniformName = `${key}_aspect_ratio`;
        uniformLocations[aspectRatioUniformName] = this.gl.getUniformLocation(this.program!, aspectRatioUniformName);
      }
    });

    this.uniformLocations = uniformLocations;
  };

  private resizeObserver: ResizeObserver | null = null;
  private setupResizeObserver = () => {
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.canvas);
    this.handleResize();
  };

  private handleResize = () => {
    const clientWidth = this.canvas.clientWidth;
    const clientHeight = this.canvas.clientHeight;
    const pixelRatio = window.devicePixelRatio;

    const maxRes = 1920;
    // const maxRes = 1920 * pixelRatio;

    let newWidth = clientWidth * pixelRatio;
    let newHeight = clientHeight * pixelRatio;
    const scale = Math.min(1, maxRes / Math.max(newWidth, newHeight));
    newWidth = Math.floor(newWidth * scale);
    newHeight = Math.floor(newHeight * scale);

    if (this.canvas.width !== newWidth || this.canvas.height !== newHeight) {
      this.canvas.width = newWidth;
      this.canvas.height = newHeight;

      // If pixelRatio is not 1, we need the user to set a CSS size or changing the canvas.width/height will
      // actually resize the element, triggering a resize loop and making the result still 1x dpi, just bigger
      if (pixelRatio !== 1) {
        const cssWidth = window.getComputedStyle(this.canvas).width;
        const cssHeight = window.getComputedStyle(this.canvas).height;
        // CSS width should not equal newWidth, because newWidth is scaled with dpi
        if (parseFloat(cssWidth) === newWidth && parseFloat(cssHeight) === newHeight) {
          // It appears that CSS sizing was unset, so we just caused the entire canvas to resize and will trigger a resize loop
          // Set an explicit inline CSS size to avoid the loop and preserve 2x rendering
          this.canvas.style.width = `${clientWidth}px`;
          this.canvas.style.height = `${clientHeight}px`;
        }
      }

      this.resolutionChanged = true;
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
      this.render(performance.now()); // this is necessary to avoid flashes while resizing (the next scheduled render will set uniforms)
    }
  };

  private render = (currentTime: number) => {
    if (this.hasBeenDisposed) return;

    if (this.program === null) {
      console.warn('Tried to render before program or gl was initialized');
      return;
    }

    // Calculate the delta time
    const dt = currentTime - this.lastRenderTime;
    this.lastRenderTime = currentTime;
    // Increase the total animation time by dt * animationSpeed
    if (this.speed !== 0) {
      this.totalFrameTime += dt * this.speed;
    }

    // Clear the canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Update uniforms
    this.gl.useProgram(this.program);

    // Update the time uniform
    this.gl.uniform1f(this.uniformLocations.u_time!, this.totalFrameTime * 0.001);

    // If the resolution has changed, we need to update the uniform
    if (this.resolutionChanged) {
      this.gl.uniform2f(this.uniformLocations.u_resolution!, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.uniform1f(this.uniformLocations.u_pixelRatio!, window.devicePixelRatio);
      this.resolutionChanged = false;
    }

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Loop if we're animating
    if (this.speed !== 0) {
      this.requestRender();
    } else {
      this.rafId = null;
    }
  };

  private requestRender = () => {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = requestAnimationFrame(this.render);
  };

  /** Creates a texture from an image and sets it into a uniform value */
  private setTextureUniform = (uniformName: string, image: HTMLImageElement): void => {
    if (!image.complete || image.naturalWidth === 0) {
      throw new Error(`Image for uniform ${uniformName} must be fully loaded`);
    }

    // Clean up existing texture if present
    const existingTexture = this.textures.get(uniformName);
    if (existingTexture) {
      this.gl.deleteTexture(existingTexture);
    }

    // Create and set up the new texture
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    // Set texture parameters
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    // Upload image to texture
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
    const error = this.gl.getError();
    if (error !== this.gl.NO_ERROR || texture === null) {
      console.error('WebGL error when uploading texture:', error);
      return;
    }

    // Store the texture
    this.textures.set(uniformName, texture);

    // Set up texture unit and uniform
    const location = this.uniformLocations[uniformName];
    if (location) {
      // Use texture unit based on the order textures were added
      const textureUnit = this.textures.size - 1;
      this.gl.useProgram(this.program);
      this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.uniform1i(location, textureUnit);

      // Calculate and set the aspect ratio uniform
      const aspectRatioUniformName = `${uniformName}_aspect_ratio`;
      const aspectRatioLocation = this.uniformLocations[aspectRatioUniformName];
      if (aspectRatioLocation) {
        const aspectRatio = image.naturalWidth / image.naturalHeight;
        this.gl.uniform1f(aspectRatioLocation, aspectRatio);
      }
    }
  };

  /** Sets the provided uniform values into the WebGL program, can be a partial list of uniforms that have changed */
  private setUniformValues = (updatedUniforms: ShaderMountUniforms) => {
    this.gl.useProgram(this.program);
    Object.entries(updatedUniforms).forEach(([key, value]) => {
      const location = this.uniformLocations[key];
      if (!location) {
        console.warn(`Uniform location for ${key} not found`);
        return;
      }

      if (value instanceof HTMLImageElement) {
        // Texture case, requires a good amount of code so it gets its own function:
        this.setTextureUniform(key, value);
      } else if (Array.isArray(value)) {
        // Array case, supports 2, 3, 4, 9, 16 length arrays
        switch (value.length) {
          case 2:
            this.gl.uniform2fv(location, value);
            break;
          case 3:
            this.gl.uniform3fv(location, value);
            break;
          case 4:
            this.gl.uniform4fv(location, value);
            break;
          default:
            if (value.length === 9) {
              this.gl.uniformMatrix3fv(location, false, value);
            } else if (value.length === 16) {
              this.gl.uniformMatrix4fv(location, false, value);
            } else {
              console.warn(`Unsupported uniform array length: ${value.length}`);
            }
        }
      } else if (typeof value === 'number') {
        // Number case, supports floats and ints
        this.gl.uniform1f(location, value);
      } else if (typeof value === 'boolean') {
        // Boolean case, supports true and false
        this.gl.uniform1i(location, value ? 1 : 0);
      } else {
        console.warn(`Unsupported uniform type for ${key}: ${typeof value}`);
      }
    });
  };

  /** Gets the current total animation time from 0ms */
  public getCurrentFrameTime = (): number => {
    return this.totalFrameTime;
  };

  /** Set a frame to get a deterministic result, frames are literally just milliseconds from zero since the animation started */
  public setFrame = (newFrame: number): void => {
    this.totalFrameTime = newFrame;
    this.lastRenderTime = performance.now();
    this.render(performance.now());
  };

  /** Set an animation speed (or 0 to stop animation) */
  public setSpeed = (newSpeed: number = 1): void => {
    // Set the new animation speed
    this.speed = newSpeed;

    if (this.rafId === null && newSpeed !== 0) {
      // Moving from 0 to animating, kick off a new rAF loop
      this.lastRenderTime = performance.now();
      this.rafId = requestAnimationFrame(this.render);
    }

    if (this.rafId !== null && newSpeed === 0) {
      // Moving from animating to not animating, cancel the rAF loop
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  /** Update the uniforms that are provided by the outside shader, can be a partial set with only the uniforms that have changed */
  public setUniforms = (newUniforms: ShaderMountUniforms): void => {
    this.providedUniforms = { ...this.providedUniforms, ...newUniforms };

    // If we need to allow users to add uniforms after the shader has been created, we can do that here
    // But right now we're expecting the uniform list to be predictable and static
    // this.setupUniforms();

    this.setUniformValues(newUniforms);
    this.render(performance.now());
  };

  /** Dispose of the shader mount, cleaning up all of the WebGL resources */
  public dispose = (): void => {
    // Immediately mark as disposed to prevent future renders from leaking in
    this.hasBeenDisposed = true;

    // Cancel the rAF loop
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.gl && this.program) {
      // Clean up all textures
      this.textures.forEach((texture) => {
        this.gl.deleteTexture(texture);
      });
      this.textures.clear();

      this.gl.deleteProgram(this.program);
      this.program = null;

      // Reset the WebGL context
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
      this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

      // Clear any errors
      this.gl.getError();
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.uniformLocations = {};

    // Remove the shader mount from the canvas element to avoid any GC issues
    this.canvas.paperShaderMount = undefined;
  };
}

/** Vertex shader for the shader mount */
const vertexShaderSource = `#version 300 es
layout(location = 0) in vec4 a_position;

void main() {
  gl_Position = a_position;
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
): WebGLProgram | null {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  // Clean up shaders after successful linking
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

import { vertexShaderSource } from './vertex-shader.js';

const DEFAULT_MAX_PIXEL_COUNT: number = 1920 * 1080 * 4;

// Type definition for the WebGL timer query extension
interface EXT_disjoint_timer_query_webgl2 {
  readonly TIME_ELAPSED_EXT: 0x88bf;
  readonly GPU_DISJOINT_EXT: 0x8fbb;
}

// Interface for performance statistics
interface PerformanceStats {
  avgFrameTime: number;
  avgGPUTime: number;
  fps: number;
  resolution: { width: number; height: number };
  renderScale: number;
  pixelCount: number;
  supportsTimerQueries: boolean;
}

export class ShaderMount {
  public parentElement: PaperShaderElement;
  public canvasElement: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private uniformLocations: Record<string, WebGLUniformLocation | null> = {};
  /** The fragment shader that we are using */
  private fragmentShader: string;
  /** Stores the RAF for the render loop */
  private rafId: number | null = null;
  /** Time of the last rendered frame */
  private lastRenderTime = 0;
  /** Total time that we have played any animation, passed as a uniform to the shader for time-based VFX */
  private currentFrame = 0;
  /** The current speed that we progress through animation time (multiplies by delta time every update). Allows negatives to play in reverse. If set to 0, rAF will stop entirely so static shaders have no recurring performance costs */
  private speed = 0;
  /** Uniforms that are provided by the user for the specific shader being mounted (not including uniforms that this Mount adds, like time and resolution) */
  private providedUniforms: ShaderMountUniforms;
  /** Just a sanity check to make sure frames don't run after we're disposed */
  private hasBeenDisposed = false;
  /** If the resolution of the canvas has changed since the last render */
  private resolutionChanged = true;
  /** Store textures that are provided by the user */
  private textures: Map<string, WebGLTexture> = new Map();
  private minPixelRatio;
  private maxPixelCount;
  private isSafari = isSafari();
  private uniformCache: Record<string, unknown> = {};

  // Performance measurement properties
  private timerExt: EXT_disjoint_timer_query_webgl2 | null = null;
  private performanceQueries: WebGLQuery[] = [];
  private performanceResults: number[] = [];
  private frameTimeHistory: number[] = [];
  private lastPerformanceLog = 0;
  private performanceLoggingEnabled = true;

  constructor(
    /** The div you'd like to mount the shader to. The shader will match its size. */
    parentElement: HTMLElement,
    fragmentShader: string,
    uniforms: ShaderMountUniforms,
    webGlContextAttributes?: WebGLContextAttributes,
    /** The speed of the animation, or 0 to stop it. Supports negative values to play in reverse. */
    speed = 0,
    /** Pass a frame to offset the starting u_time value and give deterministic results*/
    frame = 0,
    /**
     * The minimum pixel ratio to render at, defaults to 2.
     * May be reduced to improve performance or increased together with `maxPixelCount` to improve antialiasing.
     */
    minPixelRatio = 2,
    /**
     * The maximum amount of physical device pixels to render for the shader,
     * by default it's 1920 * 1080 * 2x dpi (per each side) = 8,294,400 pixels of a 4K screen.
     * Actual DOM size of the canvas can be larger, it will just lose quality after this.
     *
     * May be reduced to improve performance or increased to improve quality on high-resolution screens.
     */
    maxPixelCount: number = DEFAULT_MAX_PIXEL_COUNT
  ) {
    if (parentElement instanceof HTMLElement) {
      this.parentElement = parentElement as PaperShaderElement;
    } else {
      throw new Error('Paper Shaders: parent element must be an HTMLElement');
    }

    if (!document.querySelector('style[data-paper-shader]')) {
      const styleElement = document.createElement('style');
      styleElement.innerHTML = defaultStyle;
      styleElement.setAttribute('data-paper-shader', '');
      document.head.prepend(styleElement);
    }

    // Create the canvas element and mount it into the provided element
    const canvasElement = document.createElement('canvas');
    this.canvasElement = canvasElement;
    this.parentElement.prepend(canvasElement);
    this.fragmentShader = fragmentShader;
    this.providedUniforms = uniforms;
    // Base our starting animation time on the provided frame value
    this.currentFrame = frame;
    this.minPixelRatio = minPixelRatio;
    this.maxPixelCount = maxPixelCount;

    const gl = canvasElement.getContext('webgl2', webGlContextAttributes);
    if (!gl) {
      throw new Error('Paper Shaders: WebGL is not supported in this browser');
    }
    this.gl = gl;

    // Initialize performance measurement
    this.initPerformanceMeasurement();

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

    // Mark parent element as paper shader mount
    this.parentElement.setAttribute('data-paper-shader', '');

    // Add the shaderMount instance to the div mount element to make it easily accessible
    this.parentElement.paperShaderMount = this;
  }

  private initPerformanceMeasurement = (): void => {
    // Try to get timer query extension
    this.timerExt = this.gl.getExtension('EXT_disjoint_timer_query_webgl2');

    if (!this.timerExt) {
      console.warn('Timer queries not supported - using frame timing fallback');
    } else {
      console.log('✓ GPU timer queries supported');
    }
  };

  // Enable/disable performance logging
  public enablePerformanceLogging = (enabled: boolean = true): void => {
    this.performanceLoggingEnabled = enabled;
    if (enabled) {
      console.log('🎮 Performance logging enabled');
    }
  };

  private measureGPUTime = (): WebGLQuery | null => {
    if (!this.timerExt) {
      return null;
    }

    const query = this.gl.createQuery();
    if (!query) return null;

    this.gl.beginQuery(this.timerExt.TIME_ELAPSED_EXT, query);
    return query;
  };

  private endGPUMeasurement = (query: WebGLQuery | null) => {
    if (!query || !this.timerExt) return;

    this.gl.endQuery(this.timerExt.TIME_ELAPSED_EXT);
    this.performanceQueries.push(query);
  };

  private checkPerformanceResults = () => {
    if (!this.timerExt || this.performanceQueries.length === 0) return;

    // Check completed queries
    const completedQueries: WebGLQuery[] = [];

    this.performanceQueries.forEach((query) => {
      const available = this.gl.getQueryParameter(query, this.gl.QUERY_RESULT_AVAILABLE);
      const disjoint = this.gl.getParameter(this.timerExt!.GPU_DISJOINT_EXT);

      if (available && !disjoint) {
        const timeElapsed = this.gl.getQueryParameter(query, this.gl.QUERY_RESULT);
        const timeInMs = timeElapsed / 1000000; // Convert to milliseconds

        this.performanceResults.push(timeInMs);
        completedQueries.push(query);

        // Keep only last 100 results
        if (this.performanceResults.length > 100) {
          this.performanceResults.shift();
        }
      }
    });

    // Remove completed queries
    completedQueries.forEach((completedQuery) => {
      const index = this.performanceQueries.indexOf(completedQuery);
      if (index > -1) {
        this.performanceQueries.splice(index, 1);
      }
      this.gl.deleteQuery(completedQuery);
    });
  };

  private logPerformanceStats = (frameTime: number) => {
    if (!this.performanceLoggingEnabled) return;

    const now = performance.now();
    if (now - this.lastPerformanceLog < 2000) return; // Log every 2 seconds

    this.lastPerformanceLog = now;

    // Frame time stats
    const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
    const maxFrameTime = Math.max(...this.frameTimeHistory);
    const minFrameTime = Math.min(...this.frameTimeHistory);

    console.group('🎮 Shader Performance Stats');
    console.log(`📊 Frame Time: ${frameTime.toFixed(2)}ms (avg: ${avgFrameTime.toFixed(2)}ms)`);
    console.log(
      `⚡ FPS: ${(1000 / avgFrameTime).toFixed(1)} (range: ${(1000 / maxFrameTime).toFixed(1)}-${(1000 / minFrameTime).toFixed(1)})`
    );
    console.log(
      `🖥️  Resolution: ${this.gl.canvas.width}x${this.gl.canvas.height} (${((this.gl.canvas.width * this.gl.canvas.height) / 1000000).toFixed(1)}MP)`
    );
    console.log(`📏 Render Scale: ${this.renderScale.toFixed(2)}x`);

    // GPU timing stats (if available)
    if (this.performanceResults.length > 0) {
      const avgGPUTime = this.performanceResults.reduce((a, b) => a + b, 0) / this.performanceResults.length;
      const maxGPUTime = Math.max(...this.performanceResults);
      const minGPUTime = Math.min(...this.performanceResults);

      console.log(
        `🎯 GPU Time: ${avgGPUTime.toFixed(2)}ms (range: ${minGPUTime.toFixed(2)}-${maxGPUTime.toFixed(2)}ms)`
      );
      console.log(`⚙️  GPU Usage: ${((avgGPUTime / avgFrameTime) * 100).toFixed(1)}% of frame time`);
    } else {
      console.log('⚠️  GPU timing not available (timer queries not supported)');
    }
    console.groupEnd();
  };

  // Public method to get current performance stats
  public getPerformanceStats = (): PerformanceStats => {
    const avgFrameTime =
      this.frameTimeHistory.length > 0
        ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length
        : 0;

    const avgGPUTime =
      this.performanceResults.length > 0
        ? this.performanceResults.reduce((a, b) => a + b, 0) / this.performanceResults.length
        : 0;

    return {
      avgFrameTime,
      avgGPUTime,
      fps: avgFrameTime > 0 ? 1000 / avgFrameTime : 0,
      resolution: { width: this.gl.canvas.width, height: this.gl.canvas.height },
      renderScale: this.renderScale,
      pixelCount: this.gl.canvas.width * this.gl.canvas.height,
      supportsTimerQueries: !!this.timerExt,
    };
  };

  // Method to stress test with multiple passes
  public stressTest = (passes: number = 10): void => {
    if (!this.program) return;

    console.log(`🔥 Starting stress test with ${passes} passes...`);

    const gpuQuery = this.measureGPUTime();
    const startTime = performance.now();

    for (let i = 0; i < passes; i++) {
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    this.endGPUMeasurement(gpuQuery);

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    console.log(
      `⏱️  Stress test completed: ${totalTime.toFixed(2)}ms total, ${(totalTime / passes).toFixed(2)}ms per pass`
    );
  };

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

  /**
   * The scale that we should render at.
   * - Used to target 2x rendering even on 1x screens for better antialiasing
   * - Prevents the virtual resolution from going beyond the maximum resolution
   * - Accounts for the page zoom level so we render in physical device pixels rather than CSS pixels
   */
  private renderScale = 1;
  private parentWidth = 0;
  private parentHeight = 0;

  private resizeObserver: ResizeObserver | null = null;
  private setupResizeObserver = () => {
    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (entry?.borderBoxSize[0]) {
        this.parentWidth = entry.borderBoxSize[0].inlineSize;
        this.parentHeight = entry.borderBoxSize[0].blockSize;
      }

      this.handleResize();
    });

    this.resizeObserver.observe(this.parentElement);
    visualViewport?.addEventListener('resize', this.handleVisualViewportChange);

    const rect = this.parentElement.getBoundingClientRect();
    this.parentWidth = rect.width;
    this.parentHeight = rect.height;
    this.handleResize();
  };

  // Visual viewport resize handler, mainly used to react to browser zoom changes.
  // Wait 2 frames to align with when the resize observer callback is done (in case it might follow):
  // - Frame 1: a paint after the visual viewport resize
  // - Frame 2: a paint after the resize observer has been handled, if it was ever triggered
  //
  // Both resize observer and visual viewport will react to classic browser zoom changes,
  // so we dedupe the callbacks, but pinch zoom only triggers the visual viewport handler.
  private resizeRafId: number | null = null;
  private handleVisualViewportChange = () => {
    if (this.resizeRafId !== null) {
      cancelAnimationFrame(this.resizeRafId);
    }

    this.resizeRafId = requestAnimationFrame(() => {
      this.resizeRafId = requestAnimationFrame(() => {
        this.handleResize();
      });
    });
  };

  /** Resize handler for when the container div changes size or the max pixel count changes and we want to resize our canvas to match */
  private handleResize = () => {
    // Cancel any scheduled resize handlers
    if (this.resizeRafId !== null) {
      cancelAnimationFrame(this.resizeRafId);
    }

    const pinchZoom = visualViewport?.scale ?? 1;

    // Zoom level can be calculated comparing the browser's outerWidth and the viewport width.
    // Note: avoid innerWidth, use visualViewport.width instead.
    // - innerWidth is affected by pinch zoom in Safari, but not other browsers.
    //   visualViewport.width works consistently in all browsers.
    // - innerWidth is rounded to integer, but not visualViewport.width.
    // - visualViewport.width is affected by hard scrollbars, so they need to be added manually
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const innerWidth = visualViewport
      ? visualViewport.scale * visualViewport.width + scrollbarWidth
      : window.innerWidth;

    // Slight rounding here helps the <canvas> maintain a consistent computed size as the zoom level changes
    const classicZoom = Math.round((10000 * window.outerWidth) / innerWidth) / 10000;

    // As of 2025, Safari reports physical devicePixelRatio, but other browsers add the current zoom level
    // https://bugs.webkit.org/show_bug.cgi?id=124862
    const realPixelRatio = this.isSafari ? devicePixelRatio : devicePixelRatio / classicZoom;
    const targetPixelRatio = Math.max(realPixelRatio, this.minPixelRatio);
    const targetRenderScale = targetPixelRatio * classicZoom * pinchZoom;
    const targetPixelWidth = this.parentWidth * targetRenderScale;
    const targetPixelHeight = this.parentHeight * targetRenderScale;

    // Prevent the total rendered pixel count from exceeding maxPixelCount
    const maxPixelCountHeadroom = Math.sqrt(this.maxPixelCount) / Math.sqrt(targetPixelWidth * targetPixelHeight);

    const newRenderScale = targetRenderScale * Math.min(1, maxPixelCountHeadroom);
    const newWidth = Math.round(this.parentWidth * newRenderScale);
    const newHeight = Math.round(this.parentHeight * newRenderScale);

    if (
      this.canvasElement.width !== newWidth ||
      this.canvasElement.height !== newHeight ||
      this.renderScale !== newRenderScale // Usually, only render scale change when the user zooms in/out
    ) {
      this.renderScale = newRenderScale;
      this.canvasElement.width = newWidth;
      this.canvasElement.height = newHeight;
      this.resolutionChanged = true;
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

      // this is necessary to avoid flashes while resizing (the next scheduled render will set uniforms)
      this.render(performance.now());
    }
  };

  private render = (currentTime: number) => {
    if (this.hasBeenDisposed) return;

    if (this.program === null) {
      console.warn('Tried to render before program or gl was initialized');
      return;
    }

    // Calculate frame timing
    const frameTime = currentTime - this.lastRenderTime;
    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift(); // Keep last 60 frames
    }

    // Calculate the delta time
    const dt = currentTime - this.lastRenderTime;
    this.lastRenderTime = currentTime;
    // Increase the total animation time by dt * animationSpeed
    if (this.speed !== 0) {
      this.currentFrame += dt * this.speed;
    }

    // Clear the canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Update uniforms
    this.gl.useProgram(this.program);

    // Update the time uniform
    this.gl.uniform1f(this.uniformLocations.u_time!, this.currentFrame * 0.001);

    // If the resolution has changed, we need to update the uniform
    if (this.resolutionChanged) {
      this.gl.uniform2f(this.uniformLocations.u_resolution!, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.uniform1f(this.uniformLocations.u_pixelRatio!, this.renderScale);
      this.resolutionChanged = false;
    }

    // === PERFORMANCE MEASUREMENT START ===
    const gpuQuery = this.measureGPUTime();

    // Your main draw call - this is what we're measuring
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    this.endGPUMeasurement(gpuQuery);
    this.checkPerformanceResults();
    this.logPerformanceStats(frameTime);
    // === PERFORMANCE MEASUREMENT END ===

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
      throw new Error(`Paper Shaders: image for uniform ${uniformName} must be fully loaded`);
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
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    // Upload image to texture
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
    const error = this.gl.getError();
    if (error !== this.gl.NO_ERROR || texture === null) {
      console.error('Paper Shaders: WebGL error when uploading texture:', error);
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

  /** Utility: recursive equality test for all the uniforms */
  private areUniformValuesEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
      return a.every((val, i) => this.areUniformValuesEqual(val, (b as any)[i]));
    }
    return false;
  };

  /** Sets the provided uniform values into the WebGL program, can be a partial list of uniforms that have changed */
  private setUniformValues = (updatedUniforms: ShaderMountUniforms) => {
    this.gl.useProgram(this.program);
    Object.entries(updatedUniforms).forEach(([key, value]) => {
      // Grab the value to use in the uniform cache
      let cacheValue: ShaderMountUniforms[keyof ShaderMountUniforms] | string = value;
      if (value instanceof HTMLImageElement) {
        // Images use their src for the cache value to save memory
        cacheValue = `${value.src.slice(0, 200)}|${value.naturalWidth}x${value.naturalHeight}`;
      }

      // Check if the uniform value has changed and, if not, bail early to avoid extra work
      if (this.areUniformValuesEqual(this.uniformCache[key], cacheValue)) return;
      // Update the uniform cache if we are still here
      this.uniformCache[key] = cacheValue;

      const location = this.uniformLocations[key];
      if (!location) {
        console.warn(`Uniform location for ${key} not found`);
        return;
      }

      if (value instanceof HTMLImageElement) {
        // Texture case, requires a good amount of code so it gets its own function:
        this.setTextureUniform(key, value);
      } else if (Array.isArray(value)) {
        // Array case
        let flatArray: number[] | null = null;
        let valueLength: number | null = null;

        // If it's an array of same-sized arrays, flatten it down so we can set the uniform
        if (value[0] !== undefined && Array.isArray(value[0])) {
          const firstChildLength = value[0].length;
          if (value.every((arr) => (arr as number[]).length === firstChildLength)) {
            // Array of same-sized arrays case, flattens the array sets it
            flatArray = value.flat();
            valueLength = firstChildLength;
          } else {
            console.warn(`All child arrays must be the same length for ${key}`);
            return;
          }
        } else {
          // Array of primitive values case, supports 2, 3, 4, 9, 16 length arrays
          flatArray = value as number[];
          valueLength = flatArray.length;
        }

        // Set the uniform based on array length... supports 2, 3, 4, 9, 16 length arrays of primitive values
        // or arbitrary length arrays of arrays
        switch (valueLength) {
          case 2:
            this.gl.uniform2fv(location, flatArray);
            break;
          case 3:
            this.gl.uniform3fv(location, flatArray);
            break;
          case 4:
            this.gl.uniform4fv(location, flatArray);
            break;
          case 9:
            this.gl.uniformMatrix3fv(location, false, flatArray);
            break;
          case 16:
            this.gl.uniformMatrix4fv(location, false, flatArray);
            break;
          default:
            console.warn(`Unsupported uniform array length: ${valueLength}`);
        }
      } else if (typeof value === 'number') {
        // Number case, supports floats and ints
        this.gl.uniform1f(location, value);
      } else if (typeof value === 'boolean') {
        // Boolean case, supports true and false
        this.gl.uniform1i(location, value ? 1 : 0);
      } else {
        // May happen on the server for SSR when undefined images are passed in
        console.warn(`Unsupported uniform type for ${key}: ${typeof value}`);
      }
    });
  };

  /** Gets the current total animation time from 0ms */
  public getCurrentFrame = (): number => {
    return this.currentFrame;
  };

  /** Set a frame to get a deterministic result, frames are literally just milliseconds from zero since the animation started */
  public setFrame = (newFrame: number): void => {
    this.currentFrame = newFrame;
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

  /** Set the maximum pixel count for the shader, this will limit the number of pixels that will be rendered */
  public setMaxPixelCount = (newMaxPixelCount: number = DEFAULT_MAX_PIXEL_COUNT): void => {
    this.maxPixelCount = newMaxPixelCount;

    this.handleResize();
  };

  /** Set the minimum pixel ratio for the shader */
  public setMinPixelRatio = (newMinPixelRatio: number = 2): void => {
    this.minPixelRatio = newMinPixelRatio;

    this.handleResize();
  };

  /** Update the uniforms that are provided by the outside shader, can be a partial set with only the uniforms that have changed */
  public setUniforms = (newUniforms: ShaderMountUniforms): void => {
    this.setUniformValues(newUniforms);
    this.providedUniforms = { ...this.providedUniforms, ...newUniforms };

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

    // Clean up performance queries
    this.performanceQueries.forEach((query) => {
      this.gl.deleteQuery(query);
    });
    this.performanceQueries = [];

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

    visualViewport?.removeEventListener('resize', this.handleVisualViewportChange);

    this.uniformLocations = {};

    // Remove the shader mount from the div wrapper element to avoid any GC issues
    this.parentElement.paperShaderMount = undefined;
  };
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
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
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
): WebGLProgram | null {
  const format = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
  const precision = format ? format.precision : null;
  // MEDIUM_FLOAT precision can be 10, 16 or 23 bits depending on device;
  // Shaders fail on 10 bit (and 16 bit is hard to test) => we force 23-bit by switching to highp
  if (precision && precision < 23) {
    vertexShaderSource = vertexShaderSource.replace(/precision\s+(lowp|mediump)\s+float;/g, 'precision highp float;');
    fragmentShaderSource = fragmentShaderSource.replace(
      /precision\s+(lowp|mediump)\s+float;/g,
      'precision highp float;'
    );
  }

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

const defaultStyle = `@layer paper-shaders {
  :where([data-paper-shader]) {
    isolation: isolate;
    position: relative;

    & canvas {
      contain: strict;
      display: block;
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      border-radius: inherit;
    }
  }
}`;

/** The parent `<div>` element that has a ShaderMount available on it */
export interface PaperShaderElement extends HTMLElement {
  paperShaderMount: ShaderMount | undefined;
}

/** Check if an element is a Paper shader element */
export function isPaperShaderElement(element: HTMLElement): element is PaperShaderElement {
  return 'paperShaderMount' in element;
}

/**
 * Uniform types that we support to be auto-mapped into the fragment shader
 *
 * We accept undefined as a convenience for server rendering, when some things may be undefined
 * We just skip setting the uniform if it's undefined. This allows the shader mount to still take up space during server rendering
 */
export interface ShaderMountUniforms {
  [key: string]: boolean | number | number[] | number[][] | HTMLImageElement | undefined;
}

export interface ShaderMotionParams {
  speed?: number;
  frame?: number;
}

export type ShaderPreset<T> = {
  name: string;
  params: Required<T>;
};

function isSafari() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android');
}

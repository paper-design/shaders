import { vertexShaderSource } from './vertex-shader.js';

const DEFAULT_MAX_PIXEL_COUNT: number = 1920 * 1080 * 4;

export class ShaderMount {
  public parentElement: PaperShaderElement;
  public canvasElement: HTMLCanvasElement;

  // WebGPU state
  private device: GPUDevice | null = null;
  private context: GPUCanvasContext | null = null;
  private pipeline: GPURenderPipeline | null = null;
  private vertexBuffer: GPUBuffer | null = null;
  private uniformBuffer: GPUBuffer | null = null;
  private uniformData: ArrayBuffer | null = null;
  private uniformDataView: DataView | null = null;
  private uniformLayout: Map<string, UniformFieldInfo> = new Map();
  private uniformBufferSize: number = 0;
  private bindGroup: GPUBindGroup | null = null;
  private bindGroupLayout: GPUBindGroupLayout | null = null;
  private textureBindGroup: GPUBindGroup | null = null;
  private textureBindGroupLayout: GPUBindGroupLayout | null = null;
  private presentationFormat: GPUTextureFormat = 'bgra8unorm';

  // Texture state
  private textures: Map<string, GPUTexture> = new Map();
  private gpuSamplers: Map<string, GPUSampler> = new Map();
  private textureUnitMap: Map<string, number> = new Map();

  /** The fragment shader that we are using */
  private fragmentShader: string;
  /** Stores the RAF for the render loop */
  private rafId: number | null = null;
  /** Time of the last rendered frame */
  private lastRenderTime = 0;
  /** Total time that we have played any animation, passed as a uniform to the shader for time-based VFX */
  private currentFrame = 0;
  /** The speed that we progress through animation time (multiplies by delta time every update). Allows negatives to play in reverse. If set to 0, rAF will stop entirely so static shaders have no recurring performance costs */
  private speed = 0;
  /** Actual speed used that accounts for document visibility (we pause the shader if the tab is hidden) */
  private currentSpeed = 0;
  /** Uniforms that are provided by the user for the specific shader being mounted (not including uniforms that this Mount adds, like time and resolution) */
  private providedUniforms: ShaderMountUniforms;
  /** Names of the uniforms that should have mipmaps generated for them */
  private mipmaps: string[] = [];
  /** Just a sanity check to make sure frames don't run after we're disposed */
  private hasBeenDisposed = false;
  /** If the resolution of the canvas has changed since the last render */
  private resolutionChanged = true;
  private minPixelRatio;
  private maxPixelCount;
  private isSafari = isSafari();
  private uniformCache: Record<string, unknown> = {};
  private ownerDocument: Document;
  private isReady = false;

  constructor(
    /** The div you'd like to mount the shader to. The shader will match its size. */
    parentElement: HTMLElement,
    fragmentShader: string,
    uniforms: ShaderMountUniforms,
    /** @deprecated WebGL context attributes param is ignored in the WebGPU renderer. Kept for API compatibility. */
    _contextAttributes?: WebGLContextAttributes,
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
    maxPixelCount: number = DEFAULT_MAX_PIXEL_COUNT,
    /** Names of the uniforms that should have mipmaps generated for them */
    mipmaps: string[] = []
  ) {
    // nodeType check instead of `instanceof` to work across document boundaries (iframes, PiP windows)
    if (parentElement?.nodeType === 1) {
      this.parentElement = parentElement as PaperShaderElement;
    } else {
      throw new Error('Paper Shaders: parent element must be an HTMLElement');
    }

    this.ownerDocument = parentElement.ownerDocument;

    if (!this.ownerDocument.querySelector('style[data-paper-shader]')) {
      const styleElement = this.ownerDocument.createElement('style');
      styleElement.innerHTML = defaultStyle;
      styleElement.setAttribute('data-paper-shader', '');
      this.ownerDocument.head.prepend(styleElement);
    }

    // Create the canvas element and mount it into the provided element
    const canvasElement = this.ownerDocument.createElement('canvas');
    this.canvasElement = canvasElement;
    this.parentElement.prepend(canvasElement);
    this.fragmentShader = fragmentShader;
    this.providedUniforms = uniforms;
    this.mipmaps = mipmaps;
    // Base our starting animation time on the provided frame value
    this.currentFrame = frame;
    this.minPixelRatio = minPixelRatio;
    this.maxPixelCount = maxPixelCount;

    if (typeof navigator === 'undefined' || !navigator.gpu) {
      throw new Error('Paper Shaders: WebGPU is not supported in this browser');
    }

    // Parse uniform layout synchronously so writeUniform works before GPU init completes
    const layoutResult = parseUniformLayout(this.fragmentShader);
    this.uniformLayout = layoutResult.fields;
    this.uniformBufferSize = Math.max(layoutResult.totalSize, 16);
    this.uniformData = new ArrayBuffer(this.uniformBufferSize);
    this.uniformDataView = new DataView(this.uniformData);

    this.initGPU().catch((err) => {
      console.error('Paper Shaders: Failed to initialize WebGPU:', err);
    });
  }

  private async initGPU() {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error('Paper Shaders: Failed to get GPU adapter');
    }

    this.device = await adapter.requestDevice();
    this.device.lost.then((info) => {
      console.error(`Paper Shaders: WebGPU device lost - ${info.message}`);
      this.isReady = false;
    });

    this.context = this.canvasElement.getContext('webgpu') as GPUCanvasContext;
    if (!this.context) {
      throw new Error('Paper Shaders: Failed to get WebGPU context');
    }

    this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: this.presentationFormat,
      alphaMode: 'premultiplied',
    });

    this.uniformBuffer = this.device.createBuffer({
      size: this.uniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.createVertexBuffer();

    const shaderCode = this.fragmentShader + '\n' + vertexShaderSource;
    const module = this.device.createShaderModule({ code: shaderCode });

    const compilationInfo = await module.getCompilationInfo();
    for (const message of compilationInfo.messages) {
      if (message.type === 'error') {
        console.error(`Paper Shaders: Shader compilation error: ${message.message} at line ${message.lineNum}`);
      }
    }

    this.createPipeline(module);
    this.createBindGroups();
    // Clear cache so all values are re-applied to the GPU buffer
    this.uniformCache = {};
    // Put the user provided values into the uniforms
    this.setUniformValues(this.providedUniforms);

    this.isReady = true;

    // Set up the resize observer to handle window resizing and set u_resolution
    this.setupResizeObserver();
    // Set up the visual viewport change listener to handle zoom changes (pinch zoom and classic browser zoom)
    visualViewport?.addEventListener('resize', this.handleVisualViewportChange);
    // Listen for document visibility changes to pause the shader when the tab is hidden
    this.ownerDocument.addEventListener('visibilitychange', this.handleDocumentVisibilityChange);

    // Set the animation speed after everything is ready to go
    this.setSpeed(this.speed);

    // Mark parent element as paper shader mount
    this.parentElement.setAttribute('data-paper-shader', '');
    // Add the shaderMount instance to the div mount element to make it easily accessible
    this.parentElement.paperShaderMount = this;
  }

  private createVertexBuffer() {
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    this.vertexBuffer = this.device!.createBuffer({
      size: positions.byteLength,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });
    new Float32Array(this.vertexBuffer.getMappedRange()).set(positions);
    this.vertexBuffer.unmap();
  }

  private createPipeline(module: GPUShaderModule) {
    // Group 0: Uniform buffer
    const uniformEntries: GPUBindGroupLayoutEntry[] = [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform' as const },
      },
    ];
    this.bindGroupLayout = this.device!.createBindGroupLayout({ entries: uniformEntries });

    // Group 1: Textures (dynamic based on shader)
    const textureEntries = this.parseTextureBindings();
    const bindGroupLayouts: GPUBindGroupLayout[] = [this.bindGroupLayout];

    if (textureEntries.length > 0) {
      this.textureBindGroupLayout = this.device!.createBindGroupLayout({ entries: textureEntries });
      bindGroupLayouts.push(this.textureBindGroupLayout);
    }

    const pipelineLayout = this.device!.createPipelineLayout({ bindGroupLayouts });

    this.pipeline = this.device!.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module,
        entryPoint: 'vs_main',
        buffers: [
          {
            arrayStride: 8,
            attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' as const }],
          },
        ],
      },
      fragment: {
        module,
        entryPoint: 'fs_main',
        targets: [{ format: this.presentationFormat }],
      },
      primitive: { topology: 'triangle-list' as const },
    });
  }

  private parseTextureBindings(): GPUBindGroupLayoutEntry[] {
    const entries: GPUBindGroupLayoutEntry[] = [];
    const regex = /@group\(1\)\s*@binding\((\d+)\)\s*var\s+(\w+)\s*:\s*(texture_2d<f32>|sampler)/g;
    let match;
    while ((match = regex.exec(this.fragmentShader)) !== null) {
      const binding = parseInt(match[1]!);
      const type = match[3]!;
      if (type === 'texture_2d<f32>') {
        entries.push({
          binding,
          visibility: GPUShaderStage.FRAGMENT,
          texture: { sampleType: 'float' as const },
        });
      } else if (type === 'sampler') {
        entries.push({
          binding,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: { type: 'filtering' as const },
        });
      }
    }
    return entries;
  }

  private createBindGroups() {
    this.bindGroup = this.device!.createBindGroup({
      layout: this.bindGroupLayout!,
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer! } }],
    });
  }

  private rebuildTextureBindGroup() {
    if (!this.textureBindGroupLayout || !this.device) return;

    const entries: GPUBindGroupEntry[] = [];
    const regex = /@group\(1\)\s*@binding\((\d+)\)\s*var\s+(\w+)\s*:\s*(texture_2d<f32>|sampler)/g;
    let match;
    while ((match = regex.exec(this.fragmentShader)) !== null) {
      const binding = parseInt(match[1]!);
      const varName = match[2]!;
      const type = match[3]!;

      if (type === 'texture_2d<f32>') {
        const uniformName = varName.replace('_tex', '');
        const texture = this.textures.get(uniformName);
        if (texture) {
          entries.push({ binding, resource: texture.createView() });
        }
      } else if (type === 'sampler') {
        const uniformName = varName.replace('_samp', '');
        const sampler = this.gpuSamplers.get(uniformName);
        if (sampler) {
          entries.push({ binding, resource: sampler });
        }
      }
    }

    if (entries.length > 0 && entries.length === this.parseTextureBindings().length) {
      this.textureBindGroup = this.device.createBindGroup({
        layout: this.textureBindGroupLayout,
        entries,
      });
    }
  }

  /**
   * The scale that we should render at.
   * - Used to target 2x rendering even on 1x screens for better antialiasing
   * - Prevents the virtual resolution from going beyond the maximum resolution
   * - Accounts for the page zoom level so we render in physical device pixels rather than CSS pixels
   */
  private renderScale = 1;
  private parentWidth = 0;
  private parentHeight = 0;
  private parentDevicePixelWidth = 0;
  private parentDevicePixelHeight = 0;
  private devicePixelsSupported = false;

  private resizeObserver: ResizeObserver | null = null;
  private setupResizeObserver = () => {
    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (entry?.borderBoxSize[0]) {
        const physicalPixelSize = entry.devicePixelContentBoxSize?.[0];

        if (physicalPixelSize !== undefined) {
          this.devicePixelsSupported = true;
          this.parentDevicePixelWidth = physicalPixelSize.inlineSize;
          this.parentDevicePixelHeight = physicalPixelSize.blockSize;
        }

        this.parentWidth = entry.borderBoxSize[0].inlineSize;
        this.parentHeight = entry.borderBoxSize[0].blockSize;
      }

      this.handleResize();
    });

    this.resizeObserver.observe(this.parentElement);
  };

  // Visual viewport resize handler, mainly used to react to browser zoom changes.
  // Resize observer by itself does not react to pinch zoom, and although it usually
  // reacts to classic browser zoom, it's not guaranteed in edge cases.
  // Since timing between visual viewport changes and resize observer is complex
  // and because we'd like to know the device pixel sizes of elements, we just restart
  // the observer to get a guaranteed fresh callback regardless if it would have triggered or not.
  private handleVisualViewportChange = () => {
    this.resizeObserver?.disconnect();
    this.setupResizeObserver();

    // In case of debugging timing, from here on:
    // - animation frame 1: a paint after the visual viewport resize
    // - animation frame 2: a paint after the resize observer has been handled, if it was ever triggered
  };

  /** Resize handler for when the container div changes size or the max pixel count changes and we want to resize our canvas to match */
  private handleResize = () => {
    // Aim to render at least as many pixels as physically displayed
    // This will overshoot when the user zooms out, but that's acceptable

    let targetPixelWidth = 0;
    let targetPixelHeight = 0;

    // If window.devicePixelRatio is below 1, it's safe to say the browser is just zoomed out
    // We can use 1 as the minimum value not to upscale it needlessly to meet the min pixel ratio param
    const dpr = Math.max(1, window.devicePixelRatio);
    const pinchZoom = visualViewport?.scale ?? 1;

    if (this.devicePixelsSupported) {
      // Use the real pixel size if we know it, plus meet the min pixel ratio requirement and add in pinch zoom
      const scaleToMeetMinPixelRatio = Math.max(1, this.minPixelRatio / dpr);
      targetPixelWidth = this.parentDevicePixelWidth * scaleToMeetMinPixelRatio * pinchZoom;
      targetPixelHeight = this.parentDevicePixelHeight * scaleToMeetMinPixelRatio * pinchZoom;
    } else {
      // Otherwise try to approximate the element size in device pixels using devicePixelRatio.
      // (devicePixelRatio is imprecise and element's width/height may be fractional CSS sizes, not real pixels).
      let targetRenderScale = Math.max(dpr, this.minPixelRatio) * pinchZoom;

      if (this.isSafari) {
        // As of 2025, Safari reports physical devicePixelRatio, but other browsers add the current zoom level:
        // https://bugs.webkit.org/show_bug.cgi?id=124862
        //
        // In Safari we need to factor in the zoom level manually in order to set the target resolution.
        // To avoid sidebars upscaling the target resolution, set a minimum zoom level of 1.
        // This will render at higher resolution when zoomed out, but that's fine.
        // (We mostly care about maintaining good quality when zoomed in).
        const zoomLevel = bestGuessBrowserZoom(this.ownerDocument);
        targetRenderScale *= Math.max(1, zoomLevel);
      }

      // Rounding the client width/height since they may be fractional in CSS layout values
      targetPixelWidth = Math.round(this.parentWidth) * targetRenderScale;
      targetPixelHeight = Math.round(this.parentHeight) * targetRenderScale;
    }

    // Prevent the total rendered pixel count from exceeding maxPixelCount
    const maxPixelCountHeadroom = Math.sqrt(this.maxPixelCount) / Math.sqrt(targetPixelWidth * targetPixelHeight);
    const scaleToMeetMaxPixelCount = Math.min(1, maxPixelCountHeadroom);
    const newWidth = Math.round(targetPixelWidth * scaleToMeetMaxPixelCount);
    const newHeight = Math.round(targetPixelHeight * scaleToMeetMaxPixelCount);
    const newRenderScale = newWidth / Math.round(this.parentWidth);

    if (
      this.canvasElement.width !== newWidth ||
      this.canvasElement.height !== newHeight ||
      this.renderScale !== newRenderScale // Usually, only render scale changes when the user zooms in/out
    ) {
      this.renderScale = newRenderScale;
      this.canvasElement.width = newWidth;
      this.canvasElement.height = newHeight;
      this.resolutionChanged = true;

      // this is necessary to avoid flashes while resizing (the next scheduled render will set uniforms)
      this.render(performance.now());
    }
  };

  private render = (currentTime: number) => {
    if (this.hasBeenDisposed || !this.isReady) return;

    if (!this.pipeline || !this.device || !this.context) {
      console.warn('Paper Shaders: Tried to render before GPU was initialized');
      return;
    }

    if (this.canvasElement.width === 0 || this.canvasElement.height === 0) return;

    // Calculate the delta time
    const dt = currentTime - this.lastRenderTime;
    this.lastRenderTime = currentTime;
    // Increase the total animation time by dt * animationSpeed
    if (this.currentSpeed !== 0) {
      this.currentFrame += dt * this.currentSpeed;
    }

    this.writeUniform('u_time', this.currentFrame * 0.001);

    // If the resolution has changed, we need to update the uniform
    if (this.resolutionChanged) {
      this.writeUniform('u_resolution', [this.canvasElement.width, this.canvasElement.height]);
      this.writeUniform('u_pixelRatio', this.renderScale);
      this.resolutionChanged = false;
    }

    this.device.queue.writeBuffer(this.uniformBuffer!, 0, this.uniformData!);

    let textureView: GPUTextureView;
    try {
      textureView = this.context.getCurrentTexture().createView();
    } catch {
      return;
    }

    const commandEncoder = this.device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: 'clear' as const,
          storeOp: 'store' as const,
        },
      ],
    });

    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.bindGroup!);
    if (this.textureBindGroup) {
      renderPass.setBindGroup(1, this.textureBindGroup);
    }
    renderPass.setVertexBuffer(0, this.vertexBuffer!);
    renderPass.draw(6);
    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);

    // Loop if we're animating
    if (this.currentSpeed !== 0) {
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

  private writeUniform(name: string, value: number | number[] | number[][]) {
    const field = this.uniformLayout.get(name);
    if (!field || !this.uniformDataView) return;

    if (typeof value === 'number') {
      this.uniformDataView.setFloat32(field.offset, value, true);
    } else if (Array.isArray(value)) {
      if (Array.isArray(value[0])) {
        const flat = (value as number[][]).flat();
        for (let i = 0; i < flat.length; i++) {
          this.uniformDataView.setFloat32(field.offset + i * 4, flat[i]!, true);
        }
      } else {
        const arr = value as number[];
        for (let i = 0; i < arr.length; i++) {
          this.uniformDataView.setFloat32(field.offset + i * 4, arr[i]!, true);
        }
      }
    }
  }

  /** Creates a texture from an image and sets it into a uniform value */
  private setTextureUniform = (uniformName: string, image: HTMLImageElement): void => {
    if (!image.complete || image.naturalWidth === 0) {
      throw new Error(`Paper Shaders: image for uniform ${uniformName} must be fully loaded`);
    }
    if (!this.device) return;
    if (image.naturalWidth === 0 || image.naturalHeight === 0) return;

    // Clean up existing texture
    const existingTexture = this.textures.get(uniformName);
    if (existingTexture) {
      existingTexture.destroy();
    }

    const texture = this.device.createTexture({
      size: [image.naturalWidth, image.naturalHeight, 1],
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this.device.queue.copyExternalImageToTexture({ source: image }, { texture }, [
      image.naturalWidth,
      image.naturalHeight,
    ]);

    // Store the texture
    this.textures.set(uniformName, texture);

    if (!this.gpuSamplers.has(uniformName)) {
      const useMipmaps = this.mipmaps.includes(uniformName);
      this.gpuSamplers.set(
        uniformName,
        this.device.createSampler({
          magFilter: 'linear',
          minFilter: 'linear',
          mipmapFilter: useMipmaps ? 'linear' : undefined,
          addressModeU: 'clamp-to-edge',
          addressModeV: 'clamp-to-edge',
        })
      );
    }

    // Write aspect ratio uniform
    const aspectRatioUniformName = `${uniformName}AspectRatio`;
    if (this.uniformLayout.has(aspectRatioUniformName)) {
      this.writeUniform(aspectRatioUniformName, image.naturalWidth / image.naturalHeight);
    }

    this.rebuildTextureBindGroup();
  };

  /** Utility: recursive equality test for all the uniforms */
  private areUniformValuesEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
      return a.every((val: any, i: number) => this.areUniformValuesEqual(val, (b as any)[i]));
    }
    return false;
  };

  /** Sets the provided uniform values into the GPU uniform buffer, can be a partial list of uniforms that have changed */
  private setUniformValues = (updatedUniforms: ShaderMountUniforms) => {
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

      if (value instanceof HTMLImageElement) {
        // Texture case, requires a good amount of code so it gets its own function:
        this.setTextureUniform(key, value);
      } else if (Array.isArray(value)) {
        // Array case
        let flatArray: number[] | null = null;

        // If it's an array of same-sized arrays, flatten it down so we can set the uniform
        if (value[0] !== undefined && Array.isArray(value[0])) {
          const firstChildLength = value[0].length;
          if (value.every((arr) => (arr as number[]).length === firstChildLength)) {
            // Array of same-sized arrays case, flattens the array and sets it
            flatArray = value.flat();
          } else {
            console.warn(`Paper Shaders: All child arrays must be the same length for ${key}`);
            return;
          }
        } else {
          // Array of primitive values case
          flatArray = value as number[];
        }

        if (flatArray) {
          this.writeUniform(key, flatArray);
        }
      } else if (typeof value === 'number') {
        // Number case
        this.writeUniform(key, value);
      } else if (typeof value === 'boolean') {
        // Boolean case
        this.writeUniform(key, value ? 1 : 0);
      } else if (value !== undefined) {
        // May happen on the server for SSR when undefined images are passed in
        console.warn(`Paper Shaders: Unsupported uniform type for ${key}: ${typeof value}`);
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
  public setSpeed = (newSpeed = 1): void => {
    // Set the new animation speed
    this.speed = newSpeed;
    this.setCurrentSpeed(this.ownerDocument.hidden ? 0 : newSpeed);
  };

  private setCurrentSpeed = (newSpeed: number): void => {
    this.currentSpeed = newSpeed;

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

  private handleDocumentVisibilityChange = () => {
    this.setCurrentSpeed(this.ownerDocument.hidden ? 0 : this.speed);
  };

  /** Dispose of the shader mount, cleaning up all of the GPU resources */
  public dispose = (): void => {
    // Immediately mark as disposed to prevent future renders from leaking in
    this.hasBeenDisposed = true;

    // Cancel the rAF loop
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Clean up all textures
    this.textures.forEach((texture) => {
      texture.destroy();
    });
    this.textures.clear();

    this.vertexBuffer?.destroy();
    this.uniformBuffer?.destroy();
    this.pipeline = null;
    this.device = null;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    visualViewport?.removeEventListener('resize', this.handleVisualViewportChange);
    this.ownerDocument.removeEventListener('visibilitychange', this.handleDocumentVisibilityChange);

    this.uniformLayout.clear();

    // Remove the shader from the div wrapper element
    this.canvasElement.remove();
    // Free up the reference to self to enable garbage collection
    delete this.parentElement.paperShaderMount;
  };
}

// --- Uniform buffer layout parser ---

interface UniformFieldInfo {
  offset: number;
  size: number;
  type: string;
  arrayCount?: number;
  arrayStride?: number;
}

function parseUniformLayout(wgslSource: string): {
  fields: Map<string, UniformFieldInfo>;
  totalSize: number;
} {
  const fields = new Map<string, UniformFieldInfo>();
  const structMatch = wgslSource.match(/struct\s+Uniforms\s*\{([\s\S]*?)\}/);
  if (!structMatch) return { fields, totalSize: 0 };

  const body = structMatch[1]!;
  const memberRegex = /(\w+)\s*:\s*(?:array\s*<\s*(\w+)\s*,\s*(\d+)\s*>|(\w+))/g;
  let offset = 0;
  let match;

  while ((match = memberRegex.exec(body)) !== null) {
    const name = match[1]!;
    const isArray = match[2] !== undefined;
    const elemType = (isArray ? match[2] : match[4])!;
    const arrayCount = isArray ? parseInt(match[3]!) : undefined;
    const typeInfo = getWgslTypeInfo(elemType);

    if (isArray && arrayCount !== undefined) {
      const arrayStride = Math.max(typeInfo.size, 16);
      const arrayAlign = Math.max(typeInfo.align, 16);
      offset = alignTo(offset, arrayAlign);
      fields.set(name, { offset, size: arrayStride * arrayCount, type: elemType, arrayCount, arrayStride });
      offset += arrayStride * arrayCount;
    } else {
      offset = alignTo(offset, typeInfo.align);
      fields.set(name, { offset, size: typeInfo.size, type: elemType });
      offset += typeInfo.size;
    }
  }

  return { fields, totalSize: alignTo(offset, 16) };
}

function alignTo(offset: number, alignment: number): number {
  return Math.ceil(offset / alignment) * alignment;
}

function getWgslTypeInfo(type: string): { size: number; align: number } {
  switch (type) {
    case 'f32':
    case 'i32':
    case 'u32':
      return { size: 4, align: 4 };
    case 'vec2f':
    case 'vec2i':
    case 'vec2u':
      return { size: 8, align: 8 };
    case 'vec3f':
    case 'vec3i':
    case 'vec3u':
      return { size: 12, align: 16 };
    case 'vec4f':
    case 'vec4i':
    case 'vec4u':
      return { size: 16, align: 16 };
    case 'mat2x2f':
      return { size: 16, align: 8 };
    case 'mat3x3f':
      return { size: 48, align: 16 };
    case 'mat4x4f':
      return { size: 64, align: 16 };
    default:
      return { size: 4, align: 4 };
  }
}

// --- Style and types (unchanged) ---

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
      corner-shape: inherit;
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

export type ImageShaderPreset<T> = {
  name: string;
  /**
   * Params for the shader excluding the image.
   * Image is excluded as it isn't considered a preset,
   * e.g. when switching between presets it shouldn't switch the image.
   *
   * While we exclude images from presets they should still be set with a default prop value so the code-first usage of shaders remains great.
   */
  params: Required<Omit<T, 'image'>>;
};

function isSafari() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android');
}

// Zoom level can be estimated comparing the browser's outerWidth and the viewport width.
// It's nowhere near perfect because it's affected by the presence of browser sidebars,
// like a vertical web inspector or Arc's sidebar. Also, both outerWidth and innerWidth
// are integers, which would almost never give us a perfect ratio at face values.
//
// Still, this is pretty accurate in the vast majority of cases.
//
// Note 1:
// Avoid innerWidth, use visualViewport.width instead.
// - innerWidth is affected by pinch zoom in Safari, but not other browsers.
//   visualViewport.width works consistently in all browsers.
// - innerWidth is rounded to integer, but not visualViewport.width.
// - visualViewport.width is affected by hard scrollbars, so they need to be added manually
//
// Note 2:
// Opening a sidebar in Safari like web inspector or bookmarks will throw off the zoom
// level detection and result in a larger target resolution. Not a concern in real-world usage
// with Safari, but we'd rather not try to detect zoom levels with other browsers
// (e.g. Arc always has a sidebar, which affects outerWidth vs visualViewport.width).
function bestGuessBrowserZoom(doc: Document) {
  const viewportScale = visualViewport?.scale ?? 1;
  const viewportWidth = visualViewport?.width ?? window.innerWidth;
  const scrollbarWidth = window.innerWidth - doc.documentElement.clientWidth;
  const innerWidth = viewportScale * viewportWidth + scrollbarWidth;

  // outerWidth and innerWidth are always integers so we won't often get the original zoom ratio
  // E.g. given a 125% zoom, outerWidth = 1657, innerWidth = 1325, 1657 / 1325 = 1.2505660377
  // We check for common zoom levels and return the closest one if found.

  const ratio = outerWidth / innerWidth;
  const zoomPercentageRounded = Math.round(100 * ratio);

  // All zoom levels divisible by 5%
  if (zoomPercentageRounded % 5 === 0) {
    return zoomPercentageRounded / 100;
  }
  // 33% zoom
  if (zoomPercentageRounded === 33) {
    return 1 / 3;
  }
  // 67% zoom
  if (zoomPercentageRounded === 67) {
    return 2 / 3;
  }
  // 133% zoom
  if (zoomPercentageRounded === 133) {
    return 4 / 3;
  }

  return ratio;
}

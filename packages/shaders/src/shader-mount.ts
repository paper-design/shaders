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

  private fragmentShader: string;
  private rafId: number | null = null;
  private lastRenderTime = 0;
  private currentFrame = 0;
  private speed = 0;
  private currentSpeed = 0;
  private providedUniforms: ShaderMountUniforms;
  private mipmaps: string[] = [];
  private hasBeenDisposed = false;
  private resolutionChanged = true;
  private minPixelRatio;
  private maxPixelCount;
  private isSafari = isSafari();
  private uniformCache: Record<string, unknown> = {};
  private ownerDocument: Document;
  private isReady = false;

  constructor(
    parentElement: HTMLElement,
    fragmentShader: string,
    uniforms: ShaderMountUniforms,
    /** @deprecated WebGL context attributes param is ignored in the WebGPU renderer. Kept for API compatibility. */
    _contextAttributes?: WebGLContextAttributes,
    speed = 0,
    frame = 0,
    minPixelRatio = 2,
    maxPixelCount: number = DEFAULT_MAX_PIXEL_COUNT,
    mipmaps: string[] = []
  ) {
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

    const canvasElement = this.ownerDocument.createElement('canvas');
    this.canvasElement = canvasElement;
    this.parentElement.prepend(canvasElement);
    this.fragmentShader = fragmentShader;
    this.providedUniforms = uniforms;
    this.mipmaps = mipmaps;
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
    this.setUniformValues(this.providedUniforms);

    this.isReady = true;

    this.setupResizeObserver();
    visualViewport?.addEventListener('resize', this.handleVisualViewportChange);
    this.ownerDocument.addEventListener('visibilitychange', this.handleDocumentVisibilityChange);

    this.setSpeed(this.speed);

    this.parentElement.setAttribute('data-paper-shader', '');
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

  private handleVisualViewportChange = () => {
    this.resizeObserver?.disconnect();
    this.setupResizeObserver();
  };

  private handleResize = () => {
    let targetPixelWidth = 0;
    let targetPixelHeight = 0;

    const dpr = Math.max(1, window.devicePixelRatio);
    const pinchZoom = visualViewport?.scale ?? 1;

    if (this.devicePixelsSupported) {
      const scaleToMeetMinPixelRatio = Math.max(1, this.minPixelRatio / dpr);
      targetPixelWidth = this.parentDevicePixelWidth * scaleToMeetMinPixelRatio * pinchZoom;
      targetPixelHeight = this.parentDevicePixelHeight * scaleToMeetMinPixelRatio * pinchZoom;
    } else {
      let targetRenderScale = Math.max(dpr, this.minPixelRatio) * pinchZoom;

      if (this.isSafari) {
        const zoomLevel = bestGuessBrowserZoom(this.ownerDocument);
        targetRenderScale *= Math.max(1, zoomLevel);
      }

      targetPixelWidth = Math.round(this.parentWidth) * targetRenderScale;
      targetPixelHeight = Math.round(this.parentHeight) * targetRenderScale;
    }

    const maxPixelCountHeadroom = Math.sqrt(this.maxPixelCount) / Math.sqrt(targetPixelWidth * targetPixelHeight);
    const scaleToMeetMaxPixelCount = Math.min(1, maxPixelCountHeadroom);
    const newWidth = Math.round(targetPixelWidth * scaleToMeetMaxPixelCount);
    const newHeight = Math.round(targetPixelHeight * scaleToMeetMaxPixelCount);
    const newRenderScale = newWidth / Math.round(this.parentWidth);

    if (
      this.canvasElement.width !== newWidth ||
      this.canvasElement.height !== newHeight ||
      this.renderScale !== newRenderScale
    ) {
      this.renderScale = newRenderScale;
      this.canvasElement.width = newWidth;
      this.canvasElement.height = newHeight;
      this.resolutionChanged = true;

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

    const dt = currentTime - this.lastRenderTime;
    this.lastRenderTime = currentTime;
    if (this.currentSpeed !== 0) {
      this.currentFrame += dt * this.currentSpeed;
    }

    this.writeUniform('u_time', this.currentFrame * 0.001);

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

  private areUniformValuesEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
      return a.every((val: any, i: number) => this.areUniformValuesEqual(val, (b as any)[i]));
    }
    return false;
  };

  private setUniformValues = (updatedUniforms: ShaderMountUniforms) => {
    Object.entries(updatedUniforms).forEach(([key, value]) => {
      let cacheValue: ShaderMountUniforms[keyof ShaderMountUniforms] | string = value;
      if (value instanceof HTMLImageElement) {
        cacheValue = `${value.src.slice(0, 200)}|${value.naturalWidth}x${value.naturalHeight}`;
      }

      if (this.areUniformValuesEqual(this.uniformCache[key], cacheValue)) return;
      this.uniformCache[key] = cacheValue;

      if (value instanceof HTMLImageElement) {
        this.setTextureUniform(key, value);
      } else if (Array.isArray(value)) {
        let flatArray: number[] | null = null;

        if (value[0] !== undefined && Array.isArray(value[0])) {
          const firstChildLength = value[0].length;
          if (value.every((arr) => (arr as number[]).length === firstChildLength)) {
            flatArray = value.flat();
          } else {
            console.warn(`Paper Shaders: All child arrays must be the same length for ${key}`);
            return;
          }
        } else {
          flatArray = value as number[];
        }

        if (flatArray) {
          this.writeUniform(key, flatArray);
        }
      } else if (typeof value === 'number') {
        this.writeUniform(key, value);
      } else if (typeof value === 'boolean') {
        this.writeUniform(key, value ? 1 : 0);
      } else if (value !== undefined) {
        console.warn(`Paper Shaders: Unsupported uniform type for ${key}: ${typeof value}`);
      }
    });
  };

  public getCurrentFrame = (): number => {
    return this.currentFrame;
  };

  public setFrame = (newFrame: number): void => {
    this.currentFrame = newFrame;
    this.lastRenderTime = performance.now();
    this.render(performance.now());
  };

  public setSpeed = (newSpeed = 1): void => {
    this.speed = newSpeed;
    this.setCurrentSpeed(this.ownerDocument.hidden ? 0 : newSpeed);
  };

  private setCurrentSpeed = (newSpeed: number): void => {
    this.currentSpeed = newSpeed;

    if (this.rafId === null && newSpeed !== 0) {
      this.lastRenderTime = performance.now();
      this.rafId = requestAnimationFrame(this.render);
    }

    if (this.rafId !== null && newSpeed === 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  public setMaxPixelCount = (newMaxPixelCount: number = DEFAULT_MAX_PIXEL_COUNT): void => {
    this.maxPixelCount = newMaxPixelCount;
    this.handleResize();
  };

  public setMinPixelRatio = (newMinPixelRatio: number = 2): void => {
    this.minPixelRatio = newMinPixelRatio;
    this.handleResize();
  };

  public setUniforms = (newUniforms: ShaderMountUniforms): void => {
    this.setUniformValues(newUniforms);
    this.providedUniforms = { ...this.providedUniforms, ...newUniforms };
    this.render(performance.now());
  };

  private handleDocumentVisibilityChange = () => {
    this.setCurrentSpeed(this.ownerDocument.hidden ? 0 : this.speed);
  };

  public dispose = (): void => {
    this.hasBeenDisposed = true;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

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

    this.canvasElement.remove();
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

export interface PaperShaderElement extends HTMLElement {
  paperShaderMount: ShaderMount | undefined;
}

export function isPaperShaderElement(element: HTMLElement): element is PaperShaderElement {
  return 'paperShaderMount' in element;
}

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
  params: Required<Omit<T, 'image'>>;
};

function isSafari() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android');
}

function bestGuessBrowserZoom(doc: Document) {
  const viewportScale = visualViewport?.scale ?? 1;
  const viewportWidth = visualViewport?.width ?? window.innerWidth;
  const scrollbarWidth = window.innerWidth - doc.documentElement.clientWidth;
  const innerWidth = viewportScale * viewportWidth + scrollbarWidth;

  const ratio = outerWidth / innerWidth;
  const zoomPercentageRounded = Math.round(100 * ratio);

  if (zoomPercentageRounded % 5 === 0) {
    return zoomPercentageRounded / 100;
  }
  if (zoomPercentageRounded === 33) {
    return 1 / 3;
  }
  if (zoomPercentageRounded === 67) {
    return 2 / 3;
  }
  if (zoomPercentageRounded === 133) {
    return 4 / 3;
  }

  return ratio;
}

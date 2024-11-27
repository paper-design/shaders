export class ShaderMount {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private uniformLocations: Record<string, WebGLUniformLocation | null> = {};
  /** The fragment shader that we are using */
  private fragmentShader: string;
  /** Stores the RAF for the render loop */
  private rafId: number | null = null;
  /** Time of the last rendered frame */
  private lastFrameTime = 0;
  /** Total time that we have played any animation, passed as a uniform to the shader for time-based VFX */
  private totalAnimationTime = 0;
  /** Whether we RAF the render or not */
  private isAnimated: boolean;
  /** Uniforms that are provided by the user for the specific shader being mounted (not including uniforms that this Mount adds, like time and resolution) */
  private providedUniforms: Record<string, number | number[]>;
  /** Just a sanity check to make sure frames don't run after we're disposed */
  private hasBeenDisposed = false;
  /** If the resolution of the canvas has changed since the last render */
  private resolutionChanged = true;

  constructor(
    canvas: HTMLCanvasElement,
    fragmentShader: string,
    uniforms: Record<string, number | number[]> = {},
    webGlContextAttributes?: WebGLContextAttributes,
    animated = true
  ) {
    this.canvas = canvas;
    this.fragmentShader = fragmentShader;
    this.providedUniforms = uniforms;
    this.isAnimated = animated;

    const gl = canvas.getContext('webgl', webGlContextAttributes);
    if (!gl) {
      throw new Error('WebGL not supported');
    }
    this.gl = gl;

    this.initWebGL();
    this.setupResizeObserver();
    if (this.isAnimated) {
      this.startAnimating();
    } else {
      this.render(performance.now());
    }
  }

  private initWebGL = () => {
    const program = createProgram(this.gl, vertexShaderSource, this.fragmentShader);
    if (!program) return;
    this.program = program;

    this.setupPositionAttribute();
    this.setupUniforms();
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
    this.uniformLocations = {
      u_time: this.gl.getUniformLocation(this.program!, 'u_time'),
      u_resolution: this.gl.getUniformLocation(this.program!, 'u_resolution'),
      ...Object.fromEntries(
        Object.keys(this.providedUniforms).map((key) => [key, this.gl.getUniformLocation(this.program!, key)])
      ),
    };
  };

  private resizeObserver: ResizeObserver | null = null;
  private setupResizeObserver = () => {
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.canvas);
    this.handleResize();
  };

  private handleResize = () => {
    const newWidth = this.canvas.clientWidth;
    const newHeight = this.canvas.clientHeight;
    if (this.canvas.width !== newWidth || this.canvas.height !== newHeight) {
      this.canvas.width = newWidth;
      this.canvas.height = newHeight;
      this.resolutionChanged = true;
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
      this.render(performance.now());
    }
  };

  private render = (currentTime: number) => {
    if (this.hasBeenDisposed) return;

    const dt = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    if (this.isAnimated) {
      this.totalAnimationTime += dt;
    }

    this.gl.useProgram(this.program);

    // Update the time uniform
    this.gl.uniform1f(this.uniformLocations.u_time!, this.totalAnimationTime * 0.001);
    // If the resolution has changed, we need to update the uniform
    if (this.resolutionChanged) {
      this.gl.uniform2f(this.uniformLocations.u_resolution!, this.gl.canvas.width, this.gl.canvas.height);
      this.resolutionChanged = false;
    }

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Loop if we're animating

    if (this.isAnimated) {
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

  private updateProvidedUniforms = () => {
    this.gl.useProgram(this.program);
    Object.entries(this.providedUniforms).forEach(([key, value]) => {
      const location = this.uniformLocations[key];
      if (location) {
        if (Array.isArray(value)) {
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
          this.gl.uniform1f(location, value);
        } else if (typeof value === 'boolean') {
          this.gl.uniform1i(location, value ? 1 : 0);
        } else {
          console.warn(`Unsupported uniform type for ${key}: ${typeof value}`);
        }
      }
    });
  };

  /** Start the animation loop, can be called during instantiation or later by an outside source */
  public startAnimating = (): void => {
    this.isAnimated = true;
    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame(this.render);
  };

  /** Stop the animation loop */
  public stopAnimating = (): void => {
    this.isAnimated = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  /** Update the uniforms that are provided by the outside shader */
  public setUniforms = (newUniforms: Record<string, number | number[]>): void => {
    this.providedUniforms = { ...this.providedUniforms, ...newUniforms };

    // If we need to allow users to add uniforms after the shader has been created, we can do that here
    // But right now we're expecting the uniform list to be predictable and static
    // this.setupUniforms();

    this.updateProvidedUniforms();
    this.render(performance.now());
  };

  /** Dispose of the shader mount, cleaning up all of the WebGL resources */
  public dispose = (): void => {
    this.hasBeenDisposed = true;
    this.stopAnimating();
    if (this.gl && this.program) {
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
  };
}

/** Vertex shader for the shader mount */
const vertexShaderSource = `
  attribute vec4 a_position;
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

/**  Convert color string from HSL, RGB, or hex to 0-to-1-range-RGB array */
export function getShaderColorFromString(
  colorString: string | [number, number, number] | undefined,
  fallback: string | [number, number, number] = [0, 0, 0]
): [number, number, number] {
  // If the color string is already an array of 3 numbers, return it
  // Allowing this pass-through is useful for creating default objects in TypeScript with either syntax
  if (Array.isArray(colorString) && colorString.length === 3) {
    return colorString;
  }

  // If the color string is not a string, return the fallback
  if (typeof colorString !== 'string') {
    // Return the fallback color, processed, with no additional fallback argument
    // It'll default to [0, 0, 0] if not parseable
    return getShaderColorFromString(fallback);
  }

  let r: number, g: number, b: number;
  if (colorString.startsWith('#')) {
    [r, g, b] = hexToRgb(colorString);
  } else if (colorString.startsWith('rgb')) {
    [r, g, b] = parseRgb(colorString);
  } else if (colorString.startsWith('hsl')) {
    [r, g, b] = hslToRgb(parseHsl(colorString));
  } else {
    console.error('Unsupported color format', colorString);
    // Return the fallback color, processed, with no additional fallback argument
    // It'll default to [0, 0, 0] if not parseable
    return getShaderColorFromString(fallback);
  }
  return [r, g, b];
}

/** Convert hex to RGB (0 to 1 range) */
function hexToRgb(hex: string): [number, number, number] {
  // Expand three-letter hex to six-letter
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  const bigint = parseInt(hex.slice(1), 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return [r, g, b];
}

/** Parse RGB string to RGB (0 to 1 range) */
function parseRgb(rgb: string): [number, number, number] {
  const match = rgb.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1] ?? '0') / 255, parseInt(match[2] ?? '0') / 255, parseInt(match[3] ?? '0') / 255];
}

/** Parse HSL string */
function parseHsl(hsl: string): [number, number, number] {
  const match = hsl.match(/^hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/i);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1] ?? '0'), parseInt(match[2] ?? '0'), parseInt(match[3] ?? '0')];
}

/** Convert HSL to RGB (0 to 1 range) */
function hslToRgb(hsl: [number, number, number]): [number, number, number] {
  const [h, s, l] = hsl;
  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const lDecimal = l / 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = lDecimal; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = lDecimal < 0.5 ? lDecimal * (1 + sDecimal) : lDecimal + sDecimal - lDecimal * sDecimal;
    const p = 2 * lDecimal - q;
    r = hue2rgb(p, q, hDecimal + 1 / 3);
    g = hue2rgb(p, q, hDecimal);
    b = hue2rgb(p, q, hDecimal - 1 / 3);
  }

  return [r, g, b];
}

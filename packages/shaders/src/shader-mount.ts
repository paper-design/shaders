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
  /** The current speed that we progress through animation time (multiplies by delta time every update). Allows negatives to play in reverse. If set to 0, rAF will stop entirely so static shaders have no recurring performance costs */
  private speed = 1;
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
    /** The speed of the animation, or 0 to stop it. Supports negative values to play in reverse. */
    speed = 1,
    /** Pass a seed to offset the starting u_time value and give deterministic results*/
    seed = 0
  ) {
    this.canvas = canvas;
    this.fragmentShader = fragmentShader;
    this.providedUniforms = uniforms;
    // Base our starting animation time on the provided seed value
    this.totalAnimationTime = seed;

    const gl = canvas.getContext('webgl2', webGlContextAttributes);
    if (!gl) {
      throw new Error('WebGL not supported');
    }
    this.gl = gl;

    this.initWebGL();
    this.setupResizeObserver();

    // Set the animation speed after everything is ready to go
    this.setSpeed(speed);

    // Mark canvas as paper shader mount
    this.canvas.setAttribute('data-paper-shaders', 'true');
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
    const pxRatio = Math.min(2, window.devicePixelRatio);
    const newWidth = this.canvas.clientWidth * pxRatio;
    const newHeight = this.canvas.clientHeight * pxRatio;
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

    // Calculate the delta time
    const dt = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    // Increase the total animation time by dt * animationSpeed
    if (this.speed !== 0) {
      this.totalAnimationTime += dt * this.speed;
    }

    // Update uniforms
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

  /** Set a seed to get a deterministic result */
  public setSeed = (newSeed: number): void => {
    this.totalAnimationTime = newSeed;
    this.render(performance.now());
  };

  /** Set an animation speed (or 0 to stop animation) */
  public setSpeed = (newSpeed: number = 1): void => {
    // Set the new animation speed
    this.speed = newSpeed;

    if (this.rafId === null && newSpeed !== 0) {
      // Moving from 0 to animating, kick off a new rAF loop
      this.lastFrameTime = performance.now();
      this.rafId = requestAnimationFrame(this.render);
    }

    if (this.rafId !== null && newSpeed === 0) {
      // Moving from animating to not animating, cancel the rAF loop
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
    // Immediately mark as disposed to prevent future renders from leaking in
    this.hasBeenDisposed = true;

    // Cancel the rAF loop
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

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
const vertexShaderSource = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

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

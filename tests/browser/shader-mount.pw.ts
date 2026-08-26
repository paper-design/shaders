import { expect, test } from '@playwright/test';

const fragmentShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_value;
uniform sampler2D u_image;

out vec4 fragColor;

void main() {
  vec4 imageColor = texture(u_image, vec2(.5));
  fragColor = vec4(u_value, imageColor.g, fract(u_time), 1.);
}`;

test('rebuilds resources and resumes retained state after context restoration', async ({ page }) => {
  await page.goto('/');

  const initialized = await page.evaluate(async (shader) => {
    const { ShaderMount } = await import('/packages/shaders/dist/index.js');
    const parent = document.querySelector<HTMLElement>('#mount')!;

    const createImage = async (color: string) => {
      const source = document.createElement('canvas');
      source.width = 1;
      source.height = 1;
      const context = source.getContext('2d')!;
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);

      const image = new Image();
      image.src = source.toDataURL();
      await image.decode();
      return image;
    };

    const image = await createImage('#0000ff');
    const mount = new ShaderMount(
      parent,
      shader,
      { u_value: 0.25, u_image: image },
      { preserveDrawingBuffer: true },
      1,
      100,
      1,
      1_000_000
    );
    const canvas = mount.canvasElement;
    const gl = canvas.getContext('webgl2')!;
    const loseContext = gl.getExtension('WEBGL_lose_context');

    if (!loseContext) throw new Error('WEBGL_lose_context is unavailable');

    Object.assign(window, {
      shaderLifecycleTest: { mount, canvas, gl, loseContext, createImage },
    });

    return { width: canvas.width, height: canvas.height };
  }, fragmentShader);

  expect(initialized.width).toBeGreaterThan(0);
  expect(initialized.height).toBeGreaterThan(0);
  await expect
    .poll(() => page.evaluate(() => (window as any).shaderLifecycleTest.mount.getCurrentFrame()))
    .toBeGreaterThan(100);
  await page.waitForFunction(() => (window as any).shaderLifecycleTest.canvas.width === 64);

  const lossState = await page.evaluate(async () => {
    const state = (window as any).shaderLifecycleTest;
    state.oldProgram = state.gl.getParameter(state.gl.CURRENT_PROGRAM);
    state.oldBuffer = state.gl.getParameter(state.gl.ARRAY_BUFFER_BINDING);
    state.oldTexture = state.gl.getParameter(state.gl.TEXTURE_BINDING_2D);

    const lost = new Promise<boolean>((resolve) => {
      state.canvas.addEventListener('webglcontextlost', (event: Event) => resolve(event.defaultPrevented), {
        once: true,
      });
    });

    state.loseContext.loseContext();
    const defaultPrevented = await lost;
    const frame = state.mount.getCurrentFrame();
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      defaultPrevented,
      isContextLost: state.gl.isContextLost(),
      frame,
      frameAfterWait: state.mount.getCurrentFrame(),
    };
  });

  expect(lossState.defaultPrevented).toBe(true);
  expect(lossState.isContextLost).toBe(true);
  expect(lossState.frameAfterWait).toBe(lossState.frame);

  await page.evaluate(async () => {
    const state = (window as any).shaderLifecycleTest;
    const image = await state.createImage('#00ff00');

    state.mount.setFrame(750);
    state.mount.setSpeed(0.75);
    state.mount.setUniforms({ u_value: 0.8, u_image: image });

    const parent = document.querySelector<HTMLElement>('#mount')!;
    parent.style.width = '96px';
    parent.style.height = '80px';
  });
  await page.waitForFunction(() => {
    const canvas = (window as any).shaderLifecycleTest.canvas;
    return canvas.width === 96 && canvas.height === 80;
  });

  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const parent = document.querySelector<HTMLElement>('#mount')!;
        const observer = new IntersectionObserver(([entry]) => {
          if (entry && !entry.isIntersecting) {
            observer.disconnect();
            resolve();
          }
        });
        observer.observe(parent);
        window.scrollTo(0, document.body.scrollHeight);
      })
  );

  const restoredState = await page.evaluate(async () => {
    const state = (window as any).shaderLifecycleTest;
    const restored = new Promise<void>((resolve) => {
      state.canvas.addEventListener('webglcontextrestored', () => resolve(), { once: true });
    });

    state.loseContext.restoreContext();
    await restored;
    await new Promise((resolve) => setTimeout(resolve, 100));

    const pixel = new Uint8Array(4);
    state.gl.readPixels(0, 0, 1, 1, state.gl.RGBA, state.gl.UNSIGNED_BYTE, pixel);

    return {
      isContextLost: state.gl.isContextLost(),
      frame: state.mount.getCurrentFrame(),
      pixel: Array.from(pixel),
      viewport: Array.from(state.gl.getParameter(state.gl.VIEWPORT) as Int32Array),
      programRecreated: state.gl.getParameter(state.gl.CURRENT_PROGRAM) !== state.oldProgram,
      bufferRecreated: state.gl.getParameter(state.gl.ARRAY_BUFFER_BINDING) !== state.oldBuffer,
      textureRecreated: state.gl.getParameter(state.gl.TEXTURE_BINDING_2D) !== state.oldTexture,
    };
  });

  expect(restoredState.isContextLost).toBe(false);
  expect(restoredState.frame).toBe(750);
  expect(restoredState.viewport).toEqual([0, 0, 96, 80]);
  expect(restoredState.programRecreated).toBe(true);
  expect(restoredState.bufferRecreated).toBe(true);
  expect(restoredState.textureRecreated).toBe(true);
  expect(restoredState.pixel[0]).toBeGreaterThanOrEqual(202);
  expect(restoredState.pixel[0]).toBeLessThanOrEqual(206);
  expect(restoredState.pixel[1]).toBeGreaterThanOrEqual(253);
  expect(restoredState.pixel[2]).toBeGreaterThanOrEqual(189);
  expect(restoredState.pixel[2]).toBeLessThanOrEqual(193);
  expect(restoredState.pixel[3]).toBe(255);

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect
    .poll(() => page.evaluate(() => (window as any).shaderLifecycleTest.mount.getCurrentFrame()))
    .toBeGreaterThan(750);
});

test('terminal disposal loses every remounted context without restoration or accumulation', async ({ page }) => {
  const contextWarnings: string[] = [];
  page.on('console', (message) => {
    if (message.text().includes('Too many active WebGL contexts')) contextWarnings.push(message.text());
  });

  await page.goto('/');

  const result = await page.evaluate(
    async ({ shader, mountCount }) => {
      const { ShaderMount } = await import('/packages/shaders/dist/index.js');
      const parent = document.querySelector<HTMLElement>('#mount')! as HTMLElement & {
        paperShaderMount?: InstanceType<typeof ShaderMount>;
      };
      const contexts: WebGL2RenderingContext[] = [];
      const restoredCounts: number[] = [];
      const lossDefaultPrevented: boolean[] = [];
      let previousMount: InstanceType<typeof ShaderMount> | null = null;

      const lostMount = new ShaderMount(parent, shader, { u_value: 0.5 }, { preserveDrawingBuffer: true }, 1);
      const lostCanvas = lostMount.canvasElement;
      const lostContext = lostCanvas.getContext('webgl2')!;
      const lostContextExtension = lostContext.getExtension('WEBGL_lose_context');
      if (!lostContextExtension) throw new Error('WEBGL_lose_context is unavailable');

      const initialLoss = new Promise<boolean>((resolve) => {
        lostCanvas.addEventListener('webglcontextlost', (event) => resolve(event.defaultPrevented), { once: true });
      });
      lostContextExtension.loseContext();
      const initialLossDefaultPrevented = await initialLoss;
      // restoreContext() is invalid until the context-lost event task has completed.
      await new Promise((resolve) => setTimeout(resolve, 0));

      const restoredAfterDispose = new Promise<void>((resolve) => {
        lostCanvas.addEventListener('webglcontextrestored', () => resolve(), { once: true });
      });
      const terminalLoss = new Promise<boolean>((resolve) => {
        lostCanvas.addEventListener('webglcontextlost', (event) => resolve(event.defaultPrevented), { once: true });
      });

      // Queue restoration first, then dispose before its event task runs.
      lostContextExtension.restoreContext();
      lostMount.dispose();
      await restoredAfterDispose;
      const terminalLossDefaultPrevented = await Promise.race([
        terminalLoss,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 500)),
      ]);

      for (let index = 0; index < mountCount; index += 1) {
        const mount = new ShaderMount(parent, shader, { u_value: 0.5 }, { preserveDrawingBuffer: true }, 1);
        const canvas = mount.canvasElement;
        const gl = canvas.getContext('webgl2')!;
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (!loseContext) throw new Error('WEBGL_lose_context is unavailable');

        // React effect cleanup may invoke an already-disposed instance after a remount.
        previousMount?.dispose();
        if (parent.paperShaderMount !== mount) throw new Error('A stale dispose removed the live remount reference');

        restoredCounts[index] = 0;
        canvas.addEventListener('webglcontextrestored', () => {
          restoredCounts[index] = (restoredCounts[index] ?? 0) + 1;
        });
        const lost = new Promise<boolean>((resolve) => {
          canvas.addEventListener('webglcontextlost', (event) => resolve(event.defaultPrevented), { once: true });
        });

        mount.dispose();
        lossDefaultPrevented.push(await lost);
        contexts.push(gl);

        if (canvas.isConnected) throw new Error('Disposed canvas is still connected');
        if (parent.querySelector('canvas')) throw new Error('Disposed canvas remains under the mount element');
        if (parent.paperShaderMount !== undefined) throw new Error('Disposed mount remains attached to its parent');

        previousMount = mount;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      const finalMount = new ShaderMount(parent, shader, { u_value: 0.5 }, { preserveDrawingBuffer: true }, 1, 10);
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const finalFrame = finalMount.getCurrentFrame();
      const finalContextLost = finalMount.canvasElement.getContext('webgl2')!.isContextLost();
      finalMount.dispose();

      return {
        initialLossDefaultPrevented,
        terminalLossDefaultPrevented,
        disposedDuringLossContextLost: lostContext.isContextLost(),
        allDisposedContextsLost: contexts.every((context) => context.isContextLost()),
        restoredCounts,
        lossDefaultPrevented,
        finalFrame,
        finalContextLost,
        remainingCanvases: parent.querySelectorAll('canvas').length,
      };
    },
    { shader: fragmentShader, mountCount: 24 }
  );

  expect(result.initialLossDefaultPrevented).toBe(true);
  expect(result.terminalLossDefaultPrevented).toBe(false);
  expect(result.disposedDuringLossContextLost).toBe(true);
  expect(result.allDisposedContextsLost).toBe(true);
  expect(result.restoredCounts).toEqual(Array(24).fill(0));
  expect(result.lossDefaultPrevented).toEqual(Array(24).fill(false));
  expect(result.finalFrame).toBeGreaterThan(10);
  expect(result.finalContextLost).toBe(false);
  expect(result.remainingCanvases).toBe(0);
  expect(contextWarnings).toEqual([]);
});

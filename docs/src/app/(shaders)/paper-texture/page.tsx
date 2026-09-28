'use client';

import { PaperTexture, paperTexturePresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, paperTextureMeta } from '@paper-design/shaders';
import { levaImageButton, levaDeleteImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { paperTextureDef } from '@/shader-defs/paper-texture-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { isHtmlInCanvasPath, useIsHtmlInCanvasPage } from '@/helpers/use-is-html-in-canvas-page';
import { withCode } from '@/helpers/jsx-to-code';
import { HtmlInCanvasShaderPage } from '@/components/html-in-canvas-shader-page';

const { worldWidth, worldHeight, ...presetDefaults } = paperTexturePresets[0].params;

/** The HTML-in-canvas page keeps the paper white and the texture pronounced, so the HTML stays readable through it */
const htmlInCanvasDefaults = {
  ...presetDefaults,
  colorBack: '#00000000',
  clip: true,
  colorPaper: '#ffffff',
  colorShadow: '#cccccc',
  distortion: 0.3,
  angle: 0,
  roughness: 0.2,
  roughnessRows: 0,
  fiber: 0.4,
  fiberSize: 0.72,
  folds: 0.5,
  foldSizeX: 0.52,
  foldOffsetY: 0.09,
  crumples: 1,
  crumpleCount: 15,
  wrinkles: 0.5,
  drops: 0.7,
  seed: 311,
};

const htmlStyle = `
  .demo { --ink: #222; --error: #d93025; --ease: cubic-bezier(0.685, 0.89, 0.315, 0.995); display: grid; place-items: center; height: 100%; color: var(--ink) }
  .demo form { display: grid; gap: 12px; width: 360px; padding: 48px; background: #fff; font: 16px 'Paper Mono', ui-monospace, monospace }
  .demo h2 { margin: 0 0 12px; font: 400 28px/1.2 Matter, system-ui; font-feature-settings: "ss01" }
  .demo .field { display: grid; gap: 6px }
  .demo input[type="text"], .demo input[type="email"] { height: 44px; padding: 0 14px; border: 1px solid var(--ink); border-radius: 2px; font: inherit; color: inherit; background: #fff; outline: none; transition: border-color 150ms var(--ease), box-shadow 150ms var(--ease) }
  .demo input::placeholder { color: var(--ink) }
  .demo ::selection { background: rgb(34 34 34 / 14%); color: var(--ink) }
  .demo input:focus-visible { box-shadow: 0 0 0 3px rgb(34 34 34 / 12%) }
  .demo .error { display: none; font-size: 13px; color: var(--error) }
  .demo input:user-invalid, .demo form.submitted input:invalid { border-color: var(--error); box-shadow: 0 0 0 3px rgb(217 48 37 / 12%) }
  .demo input:user-invalid + .error, .demo form.submitted input:invalid + .error { display: block; animation: error-in 200ms var(--ease) }
  .demo label { display: flex; align-items: center; gap: 10px }
  .demo input[type="checkbox"] { appearance: none; width: 18px; height: 18px; margin: 0; border: 1px solid var(--ink); border-radius: 2px; background: #fff }
  .demo input[type="checkbox"]:checked { background: var(--ink); box-shadow: inset 0 0 0 3px #fff }
  .demo button { height: 44px; margin-top: 4px; border: 1px solid var(--ink); border-radius: 2px; font: inherit; color: inherit; background: #fff; transition: background-color 150ms var(--ease), color 150ms var(--ease), border-color 150ms var(--ease) }
  .demo button:hover { background: var(--ink); color: #fff }
  .demo button:active { background: #000 }
  .demo form:invalid button { border-color: rgb(34 34 34 / 20%); color: rgb(34 34 34 / 40%); pointer-events: none }
  .demo .sent { display: none; margin: 0; font-size: 13px; text-align: center }
  .demo form.done .sent { display: block; animation: error-in 200ms var(--ease) }
  @keyframes error-in { from { opacity: 0; transform: translateY(-4px) } }
`;

// The handler runs from the function and prints from the string: the compiler rewrites function bodies
const handleSubmit = withCode(
  (event: { preventDefault: () => void; currentTarget: HTMLFormElement }) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.classList.add('submitted');
      form.querySelector<HTMLInputElement>(':invalid')?.focus();
      return;
    }
    form.reset();
    form.classList.remove('submitted');
    form.classList.add('done');
    setTimeout(() => form.classList.remove('done'), 3000);
  },
  `(event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.classList.add('submitted');
    form.querySelector(':invalid')?.focus();
    return;
  }
  form.reset();
  form.classList.remove('submitted');
  form.classList.add('done');
  setTimeout(() => form.classList.remove('done'), 3000);
}`
);
const html = (
  <div className="demo">
    <style>{htmlStyle}</style>
    <form noValidate onSubmit={handleSubmit}>
      <h2>Stay in touch</h2>
      <div className="field">
        <input type="text" name="name" placeholder="name" autoComplete="name" required />
        <span className="error">Please enter your name</span>
      </div>
      <div className="field">
        <input
          type="email"
          name="email"
          placeholder="email"
          autoComplete="email"
          pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
          required
        />
        <span className="error">Please enter a valid email</span>
      </div>
      <label>
        <input type="checkbox" name="subscribe" required />
        subscribe to updates
      </label>
      <button type="submit">send</button>
      <p className="sent">Thanks, you&apos;re on the list</p>
    </form>
  </div>
);

const imageFiles = [
  '001.webp',
  '002.webp',
  '003.webp',
  '004.webp',
  '005.webp',
  '006.webp',
  '007.webp',
  '008.webp',
  '009.webp',
  '0010.webp',
  '0011.webp',
  '0012.webp',
  '0013.webp',
  '0014.webp',
  '0015.webp',
  '0016.webp',
  '0017.webp',
  '0018.webp',
] as const;

const PaperTextureWithControls = () => {
  const isHtmlInCanvas = useIsHtmlInCanvasPage();
  const defaults = isHtmlInCanvas ? htmlInCanvasDefaults : presetDefaults;
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | string>('/images/image-filters/0018.webp');

  useEffect(() => {
    if (imageIdx >= 0) {
      const name = imageFiles[imageIdx];
      const img = new Image();
      img.src = `/images/image-filters/${name}`;
      img.onload = () => setImage(img);
    }
  }, [imageIdx]);

  const handleClick = useCallback(() => {
    setImageIdx((prev) => (prev + 1) % imageFiles.length);
  }, []);

  const setImageWithoutStatus = useCallback((img?: HTMLImageElement) => {
    setImage(img ?? '');
    setImageIdx(-1);
  }, []);

  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      paperTexturePresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorPaper: { value: toHsla(defaults.colorPaper), order: 101 },
      colorShadow: { value: toHsla(defaults.colorShadow), order: 102 },
      blending: { value: defaults.blending, min: 0, max: 1, order: 110 },
      distortion: { value: defaults.distortion, min: -1, max: 1, order: 111 },
      clip: { value: defaults.clip, order: 112 },
      angle: { value: defaults.angle, min: 0, max: 360, order: 120 },
      seed: { value: defaults.seed, min: 0, step: 1, max: 1000, order: 121 },
      roughness: { value: defaults.roughness, min: 0, max: 1, order: 200 },
      roughnessSize: { value: defaults.roughnessSize, min: 0, max: 1, order: 201 },
      roughnessRows: { value: defaults.roughnessRows, min: 0, max: 1, order: 202 },
      fiber: { value: defaults.fiber, min: 0, max: 1, order: 210 },
      fiberSize: { value: defaults.fiberSize, min: 0, max: 1, order: 211 },
      folds: { value: defaults.folds, min: 0, max: 1, order: 220 },
      foldSizeX: { value: defaults.foldSizeX, min: 0, max: 1, order: 221 },
      foldSizeY: { value: defaults.foldSizeY, min: 0, max: 1, order: 222 },
      foldOffsetX: { value: defaults.foldOffsetX, min: 0, max: 1, order: 223 },
      foldOffsetY: { value: defaults.foldOffsetY, min: 0, max: 1, order: 224 },
      wrinkles: { value: defaults.wrinkles, min: 0, max: 1, order: 230 },
      wrinkleSize: { value: defaults.wrinkleSize, min: 0, max: 1, order: 231 },
      crumples: { value: defaults.crumples, min: 0, max: 1, order: 240 },
      crumpleCount: {
        value: defaults.crumpleCount,
        min: 2,
        max: paperTextureMeta.maxCrumpleCount,
        step: 1,
        order: 241,
      },
      drops: { value: defaults.drops, min: 0, max: 1, order: 250 },
      scale: { value: defaults.scale, min: 0.5, max: 10, order: 400, render: () => !isHtmlInCanvasPath() },
      fit: {
        value: defaults.fit,
        options: ['contain', 'cover'] as ShaderFit[],
        order: 401,
        render: () => !isHtmlInCanvasPath(),
      },
      Image: folder(
        {
          'Upload image': levaImageButton(setImageWithoutStatus),
          ...(image && { 'Delete image': levaDeleteImageButton(() => setImage('')) }),
        },
        { order: 0, render: () => !isHtmlInCanvasPath() }
      ),
      Presets: folder(presets, { order: -1, render: () => !isHtmlInCanvasPath() }),
      Preset: folder(
        { Reset: button(() => setParamsSafe(params, setParams, defaults)) },
        { order: -1, render: () => isHtmlInCanvasPath() }
      ),
    };
  }, [image]);

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, paperTextureDef);
  usePresetHighlight(isHtmlInCanvas ? [{ name: 'Reset', params: defaults }] : paperTexturePresets, params);
  cleanUpLevaParams(params);

  if (isHtmlInCanvas) {
    return (
      // The code sample leaves out params matching the component defaults, which are the default preset's
      <HtmlInCanvasShaderPage
        shaderDef={paperTextureDef}
        currentParams={params}
        defaultParams={presetDefaults}
        html={html}
      >
        <PaperTexture {...params}>{html}</PaperTexture>
      </HtmlInCanvasShaderPage>
    );
  }

  return (
    <>
      <ShaderContainer shaderDef={paperTextureDef} currentParams={params}>
        <PaperTexture onClick={handleClick} {...params} image={image} />
      </ShaderContainer>
      <div onClick={handleClick} className="mx-auto mt-16 mb-48 w-fit text-base text-current/70 select-none">
        Click to change the sample image
      </div>
      <ShaderDetails shaderDef={paperTextureDef} currentParams={params} />
    </>
  );
};

export default PaperTextureWithControls;

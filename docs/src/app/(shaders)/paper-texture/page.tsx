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
  colorBack: '#ffffff',
  colorPaper: '#ffffff',
  colorShadow: '#bfbfbf',
  distortion: 0.21,
  angle: 360,
  roughness: 1,
  roughnessRows: 1,
  fiber: 1,
  fiberSize: 0.72,
  folds: 1,
  foldSizeX: 0.52,
  foldOffsetY: 1,
  crumpleCount: 2,
  drops: 0.3,
};

const htmlStyle = `
  .demo { display: grid; align-content: center; justify-items: start; gap: 48px; height: 100%; padding: 0 8%; color: #222 }
  .demo p { margin: 0; font: 300 120px/1.1 Matter, system-ui; font-feature-settings: "ss01"; word-spacing: 0.1em; text-transform: lowercase }
  .demo button { display: flex; align-items: center; height: 128px; padding: 0 40px; border: 3px solid rgb(0 0 0 / 20%); border-radius: 24px; font: 44px 'Paper Mono', ui-monospace, monospace; color: #222; background: #fff; transition: background-color 150ms cubic-bezier(0.685, 0.89, 0.315, 0.995) }
  .demo button:hover { background: #f0efe4 }
  .demo button:active { background: #e9e8e0 }
  .demo .logos { display: flex; align-items: center; gap: 40px }
  .demo .logos img { height: 80px; width: auto }
`;

// The counter runs from the function and prints from the string: the compiler rewrites function bodies
const handleClick = withCode(
  (event: { currentTarget: HTMLButtonElement }) => {
    const clicks = Number(event.currentTarget.dataset.clicks ?? 0) + 1;
    event.currentTarget.dataset.clicks = String(clicks);
    event.currentTarget.textContent = `clicked ${clicks} time${clicks === 1 ? '' : 's'}`;
  },
  `(event) => {
  const clicks = Number(event.currentTarget.dataset.clicks ?? 0) + 1;
  event.currentTarget.dataset.clicks = String(clicks);
  event.currentTarget.textContent = \`clicked \${clicks} time\${clicks === 1 ? '' : 's'}\`;
}`
);
const html = (
  <div className="demo">
    <style>{htmlStyle}</style>
    <p>Select this text</p>
    <div className="logos">
      <img src="/images/logos/paper-logo-only.svg" alt="Paper logo" />
      <img src="/apple-touch-icon.png" alt="Paper icon" />
    </div>
    <button onClick={handleClick}>hover and click me</button>
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
      scale: { value: defaults.scale, min: 0.5, max: 10, order: 400 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 401 },
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

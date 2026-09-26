'use client';

import { HalftoneDots, halftoneDotsPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import {
  HalftoneDotsType,
  HalftoneDotsTypes,
  HalftoneDotsGrid,
  HalftoneDotsGrids,
  ShaderFit,
} from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { halftoneDotsDef } from '@/shader-defs/halftone-dots-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { isHtmlInCanvasPath, useIsHtmlInCanvasPage } from '@/helpers/use-is-html-in-canvas-page';
import { HtmlInCanvasShaderPage } from '@/components/html-in-canvas-shader-page';
import { withCode } from '@/helpers/jsx-to-code';

const { worldWidth, worldHeight, ...presetDefaults } = halftoneDotsPresets[0].params;

/** The HTML-in-canvas page drops the grain distortion, so the text edges stay clean */
const htmlInCanvasDefaults = {
  ...presetDefaults,
  colorBack: '#fff6d6',
  grainMixer: 0,
  contrast: 0.3,
};

const htmlStyle = `
  .demo { --ease: cubic-bezier(0.22, 1, 0.36, 1); --ease-expand: cubic-bezier(0.16, 1, 0.3, 1); position: relative; height: 100%; container-type: inline-size; overflow: hidden; color: #222; background: #fff }
  .demo ul { display: grid; align-content: center; width: 50%; height: 100%; margin: 0; padding: 0 0 0 5cqw; box-sizing: border-box; list-style: none; transition: opacity 400ms var(--ease) 300ms }
  .demo[data-fullscreen] ul { opacity: 0; pointer-events: none; transition: opacity 250ms var(--ease) }
  .demo a { display: block; padding: 0.8cqw 0; font: 400 8cqw/1.1 Matter, system-ui; font-feature-settings: "ss01"; text-transform: lowercase; color: inherit; text-decoration: underline 0.5cqw transparent; text-underline-offset: 1.4cqw; cursor: pointer; transition: opacity 600ms var(--ease), text-decoration-color 600ms var(--ease) }
  .demo a:hover { text-decoration-color: currentColor }
  .demo ul:has(a.active) a:not(.active), .demo ul:has(a:hover) a:not(:hover) { opacity: 0.25 }
  .demo ul:has(a:hover) a:hover { opacity: 1 }
  .demo img { position: absolute; top: 0; right: 0; width: 50%; height: 100%; object-fit: cover; opacity: 0; pointer-events: none; transition: opacity 600ms var(--ease), width 700ms var(--ease-expand) }
  .demo img.active { opacity: 1 }
  .demo[data-fullscreen] img { width: 100% }
  .demo[data-fullscreen] img.active { pointer-events: auto; cursor: zoom-out }
  .demo button { position: absolute; top: 3cqw; right: 3cqw; display: grid; place-items: center; width: 7cqw; height: 7cqw; padding: 0; border: 0; border-radius: 50%; background: #fff; cursor: pointer; opacity: 0; pointer-events: none; transition: opacity 300ms var(--ease) }
  .demo button svg { width: 3cqw; height: 3cqw; stroke: #222; stroke-width: 3; stroke-linecap: round }
  .demo[data-fullscreen] button { opacity: 1; pointer-events: auto; transition-delay: 600ms }
`;

// The handlers run from the functions and print from the strings: the compiler rewrites function bodies
const showImage = withCode(
  (event: { currentTarget: HTMLAnchorElement }) => {
    const link = event.currentTarget;
    const demo = link.closest('.demo')!;
    demo
      .querySelectorAll('img')
      .forEach((image, index) => image.classList.toggle('active', index === Number(link.dataset.image)));
    demo.querySelectorAll('a').forEach((other) => other.classList.toggle('active', other === link));
  },
  `(event) => {
  const link = event.currentTarget;
  const demo = link.closest('.demo');
  demo.querySelectorAll('img').forEach((image, index) => image.classList.toggle('active', index === Number(link.dataset.image)));
  demo.querySelectorAll('a').forEach((other) => other.classList.toggle('active', other === link));
}`
);
const openImage = withCode(
  (event: { currentTarget: HTMLElement }) => {
    event.currentTarget.closest<HTMLElement>('.demo')!.dataset.fullscreen = '';
  },
  `(event) => {
  event.currentTarget.closest('.demo').dataset.fullscreen = '';
}`
);
const closeImage = withCode(
  (event: { currentTarget: HTMLElement }) => {
    delete event.currentTarget.closest<HTMLElement>('.demo')!.dataset.fullscreen;
  },
  `(event) => {
  delete event.currentTarget.closest('.demo').dataset.fullscreen;
}`
);

const html = (
  <div className="demo">
    <style>{htmlStyle}</style>
    <img className="active" src="/images/image-filters/0018.webp" alt="Flowers" onClick={closeImage} />
    <img src="/images/image-filters/002.webp" alt="Banana on blue" onClick={closeImage} />
    <img src="/images/image-filters/003.webp" alt="Astronaut on the Moon" onClick={closeImage} />
    <img src="/images/image-filters/004.webp" alt="Monstera leaves" onClick={closeImage} />
    <img src="/images/image-filters/005.webp" alt="Marble statue on red" onClick={closeImage} />
    <ul>
      <li>
        <a className="active" data-image="0" onPointerEnter={showImage} onClick={openImage}>
          Flowers
        </a>
      </li>
      <li>
        <a data-image="1" onPointerEnter={showImage} onClick={openImage}>
          Banana
        </a>
      </li>
      <li>
        <a data-image="2" onPointerEnter={showImage} onClick={openImage}>
          Astronaut
        </a>
      </li>
      <li>
        <a data-image="3" onPointerEnter={showImage} onClick={openImage}>
          Monstera
        </a>
      </li>
      <li>
        <a data-image="4" onPointerEnter={showImage} onClick={openImage}>
          Statue
        </a>
      </li>
    </ul>
    <button aria-label="Close" onClick={closeImage}>
      <svg viewBox="0 0 16 16">
        <path d="M3 3l10 10M13 3L3 13" />
      </svg>
    </button>
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

const HalftoneDotsWithControls = () => {
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
      halftoneDotsPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorFront: { value: toHsla(defaults.colorFront), order: 101 },
      originalColors: { value: defaults.originalColors, order: 102 },
      type: {
        value: defaults.type,
        options: Object.keys(HalftoneDotsTypes) as HalftoneDotsType[],
        order: 201,
      },
      grid: {
        value: defaults.grid,
        options: Object.keys(HalftoneDotsGrids) as HalftoneDotsGrid[],
        order: 202,
      },
      inverted: { value: defaults.inverted, order: 203 },
      size: { value: defaults.size, min: 0, max: 1, step: 0.001, order: 300 },
      radius: { value: defaults.radius, min: 0, max: 2, order: 301 },
      contrast: { value: defaults.contrast, min: 0, max: 1, order: 302 },
      grainMixer: { value: defaults.grainMixer, min: 0, max: 1, order: 350 },
      grainOverlay: { value: defaults.grainOverlay, min: 0, max: 1, order: 351 },
      grainSize: { value: defaults.grainSize, min: 0, max: 1, order: 352 },
      scale: { value: defaults.scale, min: 0.1, max: 4, order: 400 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 450 },
      Image: folder(
        {
          'Upload image': levaImageButton(setImageWithoutStatus),
        },
        { order: 0, render: () => !isHtmlInCanvasPath() }
      ),
      Presets: folder(presets, { order: -1, render: () => !isHtmlInCanvasPath() }),
      Preset: folder(
        { Reset: button(() => setParamsSafe(params, setParams, defaults)) },
        { order: -1, render: () => isHtmlInCanvasPath() }
      ),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, halftoneDotsDef);
  usePresetHighlight(isHtmlInCanvas ? [{ name: 'Reset', params: defaults }] : halftoneDotsPresets, params);
  cleanUpLevaParams(params);

  if (isHtmlInCanvas) {
    return (
      <HtmlInCanvasShaderPage
        shaderDef={halftoneDotsDef}
        currentParams={params}
        defaultParams={presetDefaults}
        html={html}
      >
        <HalftoneDots {...params}>{html}</HalftoneDots>
      </HtmlInCanvasShaderPage>
    );
  }

  return (
    <>
      <ShaderContainer shaderDef={halftoneDotsDef} currentParams={params}>
        <HalftoneDots onClick={handleClick} {...params} image={image} />
      </ShaderContainer>
      <div onClick={handleClick} className="mx-auto mt-16 mb-48 w-fit text-base text-current/70 select-none">
        Click to change the sample image
      </div>
      <ShaderDetails shaderDef={halftoneDotsDef} currentParams={params} />
    </>
  );
};

export default HalftoneDotsWithControls;

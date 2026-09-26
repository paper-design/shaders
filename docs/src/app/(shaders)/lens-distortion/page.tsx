'use client';

import { LensDistortion, lensDistortionPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, lensDistortionMeta } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { ShaderDetails } from '@/components/shader-details';
import { lensDistortionDef } from '@/shader-defs/lens-distortion-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { isHtmlInCanvasPath, useIsHtmlInCanvasPage } from '@/helpers/use-is-html-in-canvas-page';
import { withCode } from '@/helpers/jsx-to-code';
import { HtmlInCanvasShaderPage } from '@/components/html-in-canvas-shader-page';

const { worldWidth, worldHeight, ...presetDefaults } = lensDistortionPresets[0].params;

/** The HTML-in-canvas page spreads the dispersion over noisy, bulged glass, which keeps the HTML readable at the center */
const htmlInCanvasDefaults = {
  ...presetDefaults,
  spread: 0.15,
  angle: 28,
  perspective: 1,
  count: 50,
  dispersionColor: 0.75,
  focusCenter: 0.5,
  focusEdges: 0,
  swirl: 0,
  noise: 0,
  lensBulge: 0.1,
  scale: 1.12,
};

// Footer buttons fit their label and longest value (in monospace characters), so cycling values doesn't resize them
const htmlStyle = `
  .demo { --x: 64%; --y: 45%; position: relative; height: 100%; container-type: inline-size; overflow: hidden; color: #f4f3ec; background: #121212; font: 1.8cqw 'Paper Mono', ui-monospace, monospace; text-transform: uppercase; user-select: none; touch-action: none; cursor: crosshair }
  .demo header, .demo footer { position: absolute; left: 11cqw; right: 11cqw; display: flex; align-items: center; gap: 1.5cqw }
  .demo header { top: 5cqw }
  .demo footer { bottom: 5cqw; justify-content: center }
  .demo header time { margin-right: auto; font-feature-settings: "tnum", "zero" }
  .demo .battery::before { content: ''; display: inline-block; width: 3.2cqw; height: 1.4cqw; margin-right: 1cqw; padding: 0.2cqw; border: 0.2cqw solid; border-radius: 0.3cqw; vertical-align: -0.2cqw; background: linear-gradient(90deg, currentColor 76%, transparent 0) content-box }
  .demo button { padding: 1cqw 1.6cqw; border: 0.15cqw solid rgb(255 255 255 / 30%); border-radius: 0.8cqw; font: inherit; text-transform: inherit; color: inherit; background: rgb(255 255 255 / 0%); cursor: pointer; transition: background-color 150ms cubic-bezier(0.685, 0.89, 0.315, 0.995) }
  .demo button:hover { background: rgb(255 255 255 / 14%) }
  .demo button:active { background: rgb(255 255 255 / 24%) }
  .demo footer button::before { content: attr(data-label); margin-right: 0.8cqw; opacity: 0.55 }
  .demo footer button { box-sizing: content-box; width: calc(var(--chars) * 1ch + 0.8cqw); text-align: left }
  .demo [data-label="shutter"] { --chars: 13 }
  .demo [data-label="iris"] { --chars: 9 }
  .demo [data-label="iso"], .demo [data-label="wb"] { --chars: 7 }
  .demo .rec::before { content: ''; display: inline-block; width: 1.2cqw; height: 1.2cqw; margin-right: 0.8cqw; border-radius: 50%; background: #ff3b30; animation: blink 1s infinite }
  .demo[data-recording="off"] .rec::before { background: transparent; box-shadow: inset 0 0 0 0.2cqw currentColor; animation: none }
  .demo .focus { position: absolute; left: var(--x); top: var(--y); width: var(--w, 22cqw); height: var(--h, 16cqw); translate: -50% -50%; border: 0.2cqw solid #ffd84d; pointer-events: none }
  .demo .focus span { position: absolute; bottom: 100%; left: -0.2cqw; padding-bottom: 0.6cqw; font-size: 1.4cqw; color: #ffd84d }
  @keyframes blink { 50% { opacity: 0.15 } }
`;

// The handlers run from the functions and print from the strings: the compiler rewrites function bodies
const startTimecode = withCode(
  (element: HTMLDivElement | null) => {
    const timecode = element!.querySelector('time')!;
    let frames = 0;
    const interval = setInterval(() => {
      if (element!.dataset.recording === 'off') return;
      frames += 1;
      const parts = [frames / 86400, (frames / 1440) % 60, (frames / 24) % 60, frames % 24];
      timecode.textContent = parts.map((part) => String(Math.floor(part)).padStart(2, '0')).join(':');
    }, 1000 / 24);
    return () => clearInterval(interval);
  },
  `(element) => {
  const timecode = element.querySelector('time');
  let frames = 0;
  const interval = setInterval(() => {
    if (element.dataset.recording === 'off') return;
    frames += 1;
    const parts = [frames / 86400, (frames / 1440) % 60, (frames / 24) % 60, frames % 24];
    timecode.textContent = parts.map((part) => String(Math.floor(part)).padStart(2, '0')).join(':');
  }, 1000 / 24);
  return () => clearInterval(interval);
}`
);
const handlePointerDown = withCode(
  (event: {
    currentTarget: HTMLDivElement;
    target: EventTarget;
    clientX: number;
    clientY: number;
    pointerId: number;
  }) => {
    if ((event.target as Element).closest('button')) return;
    const demo = event.currentTarget;
    const bounds = demo.getBoundingClientRect();
    demo.dataset.x = String(((event.clientX - bounds.left) / bounds.width) * 100);
    demo.dataset.y = String(((event.clientY - bounds.top) / bounds.height) * 100);
    delete demo.dataset.dragged;
    demo.setPointerCapture(event.pointerId);
  },
  `(event) => {
  if (event.target.closest('button')) return;
  const demo = event.currentTarget;
  const bounds = demo.getBoundingClientRect();
  demo.dataset.x = String(((event.clientX - bounds.left) / bounds.width) * 100);
  demo.dataset.y = String(((event.clientY - bounds.top) / bounds.height) * 100);
  delete demo.dataset.dragged;
  demo.setPointerCapture(event.pointerId);
}`
);
const handlePointerMove = withCode(
  (event: { currentTarget: HTMLDivElement; clientX: number; clientY: number }) => {
    const demo = event.currentTarget;
    if (demo.dataset.x === undefined) return;
    const bounds = demo.getBoundingClientRect();
    const [startX, startY] = [Number(demo.dataset.x), Number(demo.dataset.y)];
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    if (!demo.dataset.dragged && Math.hypot(x - startX, y - startY) < 2) return;
    demo.dataset.dragged = 'true';
    demo.style.setProperty('--x', `${(x + startX) / 2}%`);
    demo.style.setProperty('--y', `${(y + startY) / 2}%`);
    demo.style.setProperty('--w', `${Math.abs(x - startX)}%`);
    demo.style.setProperty('--h', `${Math.abs(y - startY)}%`);
    demo.querySelector('.focus span')!.textContent = 'track';
  },
  `(event) => {
  const demo = event.currentTarget;
  if (demo.dataset.x === undefined) return;
  const bounds = demo.getBoundingClientRect();
  const [startX, startY] = [Number(demo.dataset.x), Number(demo.dataset.y)];
  const x = ((event.clientX - bounds.left) / bounds.width) * 100;
  const y = ((event.clientY - bounds.top) / bounds.height) * 100;
  if (!demo.dataset.dragged && Math.hypot(x - startX, y - startY) < 2) return;
  demo.dataset.dragged = 'true';
  demo.style.setProperty('--x', \`\${(x + startX) / 2}%\`);
  demo.style.setProperty('--y', \`\${(y + startY) / 2}%\`);
  demo.style.setProperty('--w', \`\${Math.abs(x - startX)}%\`);
  demo.style.setProperty('--h', \`\${Math.abs(y - startY)}%\`);
  demo.querySelector('.focus span').textContent = 'track';
}`
);
const handlePointerUp = withCode(
  (event: { currentTarget: HTMLDivElement }) => {
    const demo = event.currentTarget;
    if (demo.dataset.x === undefined) return;
    const focus = demo.querySelector('.focus')!;
    if (demo.dataset.dragged) {
      focus.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }], 300);
    } else {
      demo.style.setProperty('--x', `${demo.dataset.x}%`);
      demo.style.setProperty('--y', `${demo.dataset.y}%`);
      demo.style.removeProperty('--w');
      demo.style.removeProperty('--h');
      focus.firstElementChild!.textContent = 'af-s';
      focus.animate(
        [
          { scale: 1.4, opacity: 0 },
          { scale: 1, opacity: 1 },
        ],
        250
      );
    }
    delete demo.dataset.x;
    delete demo.dataset.y;
  },
  `(event) => {
  const demo = event.currentTarget;
  if (demo.dataset.x === undefined) return;
  const focus = demo.querySelector('.focus');
  if (demo.dataset.dragged) {
    focus.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }], 300);
  } else {
    demo.style.setProperty('--x', \`\${demo.dataset.x}%\`);
    demo.style.setProperty('--y', \`\${demo.dataset.y}%\`);
    demo.style.removeProperty('--w');
    demo.style.removeProperty('--h');
    focus.firstElementChild.textContent = 'af-s';
    focus.animate([{ scale: 1.4, opacity: 0 }, { scale: 1, opacity: 1 }], 250);
  }
  delete demo.dataset.x;
  delete demo.dataset.y;
}`
);
const toggleRecording = withCode(
  (event: { currentTarget: HTMLButtonElement }) => {
    const demo = event.currentTarget.closest<HTMLElement>('.demo')!;
    demo.dataset.recording = demo.dataset.recording === 'off' ? 'on' : 'off';
  },
  `(event) => {
  const demo = event.currentTarget.closest('.demo');
  demo.dataset.recording = demo.dataset.recording === 'off' ? 'on' : 'off';
}`
);
const cycleSetting = withCode(
  (event: { currentTarget: HTMLButtonElement }) => {
    const button = event.currentTarget;
    const values = button.dataset.values!.split(' ');
    button.textContent = values[(values.indexOf(button.textContent!) + 1) % values.length]!;
  },
  `(event) => {
  const button = event.currentTarget;
  const values = button.dataset.values.split(' ');
  button.textContent = values[(values.indexOf(button.textContent) + 1) % values.length];
}`
);
const html = (
  <div
    className="demo"
    data-recording="on"
    ref={startTimecode}
    onPointerDown={handlePointerDown}
    onPointerMove={handlePointerMove}
    onPointerUp={handlePointerUp}
    onPointerCancel={handlePointerUp}
  >
    <style>{htmlStyle}</style>
    <div className="focus">
      <span>af-s</span>
    </div>
    <header>
      <button className="rec" onClick={toggleRecording}>
        rec
      </button>
      <time>00:00:00:00</time>
      <span>4k · 24p</span>
      <span className="battery">76%</span>
    </header>
    <footer>
      <button data-label="shutter" data-values="1/60 1/125 1/250 1/500 1/1000" onClick={cycleSetting}>
        1/250
      </button>
      <button data-label="iris" data-values="f/1.4 f/2 f/2.8 f/4 f/5.6 f/8 f/11 f/16" onClick={cycleSetting}>
        f/2.8
      </button>
      <button data-label="iso" data-values="100 200 400 800 1600 3200" onClick={cycleSetting}>
        400
      </button>
      <button data-label="wb" data-values="3200K 4300K 5600K 6500K" onClick={cycleSetting}>
        5600K
      </button>
    </footer>
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

const LensDistortionWithControls = () => {
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
      lensDistortionPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      spread: { value: defaults.spread, min: 0, max: 1, order: 100 },
      bias: { value: defaults.bias, min: -1, max: 1, order: 101 },
      angle: { value: defaults.angle, min: 0, max: 360, order: 102 },
      perspective: { value: defaults.perspective, min: 0, max: 1, order: 103 },
      count: { value: defaults.count, min: 2, max: lensDistortionMeta.maxSamples, step: 1, order: 104 },
      dispersion: { value: defaults.dispersion, min: 0, max: 1, order: 105 },
      dispersionShift: { value: defaults.dispersionShift, min: -1, max: 1, order: 106 },
      dispersionColor: { value: defaults.dispersionColor, min: 0, max: 1, order: 107 },
      focusCenter: { value: defaults.focusCenter, min: 0, max: 1, order: 204 },
      focusEdges: { value: defaults.focusEdges, min: 0, max: 1, order: 205 },
      swirl: { value: defaults.swirl, min: -1, max: 1, order: 280 },
      noise: { value: defaults.noise, min: 0, max: 1, order: 300 },
      noiseFrequency: { value: defaults.noiseFrequency, min: 0, max: 1, order: 301 },
      noiseOffset: { value: defaults.noiseOffset, min: 0, max: 1, order: 302 },
      lensBulge: { value: defaults.lensBulge, min: -1, max: 1, order: 400 },
      lensCircle: { value: defaults.lensCircle, min: 0, max: 1, order: 402 },
      grainMixer: { value: defaults.grainMixer, min: 0, max: 1, order: 409 },
      grainOverlay: { value: defaults.grainOverlay, min: 0, max: 1, order: 410 },
      imageX: { value: defaults.imageX, min: -1, max: 1, order: 411 },
      imageY: { value: defaults.imageY, min: -1, max: 1, order: 412 },
      scale: { value: defaults.scale, min: 0.1, max: 4, order: 450 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 451 },
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
  useUrlParams(params, setParams, lensDistortionDef);
  usePresetHighlight(isHtmlInCanvas ? [{ name: 'Reset', params: defaults }] : lensDistortionPresets, params);
  cleanUpLevaParams(params);

  if (isHtmlInCanvas) {
    return (
      <HtmlInCanvasShaderPage
        shaderDef={lensDistortionDef}
        currentParams={params}
        defaultParams={presetDefaults}
        html={html}
      >
        <LensDistortion {...params}>{html}</LensDistortion>
      </HtmlInCanvasShaderPage>
    );
  }

  return (
    <>
      <ShaderContainer shaderDef={lensDistortionDef} currentParams={params}>
        <LensDistortion onClick={handleClick} {...params} image={image} />
      </ShaderContainer>
      <div onClick={handleClick} className="mx-auto mt-16 mb-48 w-fit text-base text-current/70 select-none">
        Click to change the sample image
      </div>
      <ShaderDetails shaderDef={lensDistortionDef} currentParams={params} />
    </>
  );
};

export default LensDistortionWithControls;

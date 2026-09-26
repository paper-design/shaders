'use client';

import { HalftoneCmyk, halftoneCmykPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { HalftoneCmykType, HalftoneCmykTypes, ShaderFit } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback, type MouseEvent } from 'react';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { halftoneCmykDef } from '@/shader-defs/halftone-cmyk-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { isHtmlInCanvasPath, useIsHtmlInCanvasPage } from '@/helpers/use-is-html-in-canvas-page';
import { withCode } from '@/helpers/jsx-to-code';
import { HtmlInCanvasShaderPage } from '@/components/html-in-canvas-shader-page';

const { worldWidth, worldHeight, ...presetDefaults } = halftoneCmykPresets[0].params;

/** The HTML-in-canvas page uses a neutral, medium screen so the flat colors of the HTML split cleanly into the four inks */
const htmlInCanvasDefaults = {
  ...presetDefaults,
  size: 0.45,
  gridNoise: 0.2,
  softness: 0.3,
  contrast: 1.2,
  gainC: 0,
  gainY: 0,
  floodC: 0,
  grainSize: 0,
};

// Carets are always 1px wide, so the textarea is laid out at a quarter size and scaled up 4x to thicken its caret
const htmlStyle = `
  .demo { display: grid; grid-template-rows: 1fr auto; gap: 3%; height: 100%; padding: 5% 6%; box-sizing: border-box; container-type: inline-size; color: #111; background: #fff; --hover-transition: 250ms cubic-bezier(0.22, 1, 0.36, 1) }
  .demo .panel { position: relative; border: 0.6cqw solid #111; background: repeating-conic-gradient(from 0deg at 28% 70%, var(--a) 0 6deg, var(--b) 6deg 12deg); cursor: pointer }
  .demo h1 { position: absolute; left: 6%; bottom: 9%; margin: 0; font: 900 11cqw/0.88 Matter, system-ui; color: #fff; -webkit-text-stroke: 0.6cqw #111; paint-order: stroke fill; text-shadow: 1.2cqw 1.2cqw 0 #111; rotate: -6deg; transition: var(--hover-transition); transition-property: rotate, scale }
  .demo h1:hover { rotate: -3deg; scale: 1.05 }
  .demo .bubble { position: absolute; top: 10%; right: 6%; display: grid; align-items: center; width: 42%; min-height: 7.6cqw; padding: 3.5cqw 4cqw; border: 0.5cqw solid #111; border-radius: 50%; background: #fff; cursor: auto; transition: var(--hover-transition); transition-property: rotate, scale }
  .demo .bubble:hover { rotate: 3deg; scale: 1.05 }
  .demo .bubble::before, .demo .bubble::after { content: ""; position: absolute; top: 80%; left: 20%; width: 7cqw; height: 8cqw; background: #111; clip-path: polygon(0 0, 100% 0, 0 100%) }
  .demo .bubble::after { top: calc(80% - 0.7cqw); left: calc(20% + 0.5cqw); width: 5.4cqw; height: 6.2cqw; background: #fff }
  .demo textarea { display: block; justify-self: center; width: 25%; field-sizing: content; padding: 0; border: 0; outline: none; resize: none; overflow: hidden; font: 700 0.85cqw/1.1 Matter, system-ui; text-align: center; text-transform: uppercase; color: inherit; caret-color: #111; background: none; scale: 4 }
  .demo fieldset { display: flex; justify-content: flex-end; gap: 2.4cqw; margin: 0; padding: 0; border: 0 }
  .demo input { appearance: none; width: 4.4cqw; height: 4.4cqw; margin: 0; border: 0.4cqw solid #111; border-radius: 50%; background: var(--a); cursor: pointer; transition: scale var(--hover-transition) }
  .demo input:hover { scale: 1.12 }
  .demo input:checked { box-shadow: 0 0 0 0.5cqw #fff, 0 0 0 0.9cqw #111 }
  .demo, .demo [value="orange"] { --a: #ffa630; --b: #ff8000 }
  .demo [value="red"], .demo:has([value="red"]:checked) { --a: #ff5c4d; --b: #e0301e }
  .demo [value="teal"], .demo:has([value="teal"]:checked) { --a: #3dc9b0; --b: #16a08e }
  .demo [value="violet"], .demo:has([value="violet"]:checked) { --a: #a37cff; --b: #7c4dff }
`;

// The focus runs from the function and prints from the string: the compiler rewrites function bodies
const focusAtEnd = withCode(
  (textarea: HTMLTextAreaElement | null) => {
    textarea?.focus({ preventScroll: true });
    textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
  },
  `(textarea) => {
  textarea?.focus({ preventScroll: true });
  textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
}`
);
// Clicking the panel outside the bubble picks the next color, without taking the focus from the bubble
const selectNextColor = withCode(
  (event: MouseEvent<HTMLElement>) => {
    if ((event.target as Element).closest('.bubble')) return;
    event.preventDefault();
    const inputs = [...event.currentTarget.parentElement!.querySelectorAll('input')];
    const checkedIndex = inputs.findIndex((input) => input.checked);
    inputs[(checkedIndex + 1) % inputs.length]!.checked = true;
  },
  `(event) => {
  if (event.target.closest('.bubble')) return;
  event.preventDefault();
  const inputs = [...event.currentTarget.parentElement.querySelectorAll('input')];
  const checkedIndex = inputs.findIndex((input) => input.checked);
  inputs[(checkedIndex + 1) % inputs.length].checked = true;
}`
);
const html = (
  <div className="demo">
    <style>{htmlStyle}</style>
    <div className="panel" onMouseDown={selectNextColor}>
      <h1>
        DIGITAL
        <br />
        INK!
      </h1>
      <div className="bubble">
        <textarea ref={focusAtEnd} defaultValue="type here" spellCheck={false} aria-label="Speech bubble" />
      </div>
    </div>
    <fieldset>
      <input type="radio" name="panel-color" value="orange" aria-label="Orange" defaultChecked />
      <input type="radio" name="panel-color" value="red" aria-label="Red" />
      <input type="radio" name="panel-color" value="teal" aria-label="Teal" />
      <input type="radio" name="panel-color" value="violet" aria-label="Violet" />
    </fieldset>
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

const HalftoneCmykWithControls = () => {
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
      halftoneCmykPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorC: { value: toHsla(defaults.colorC), order: 101 },
      colorM: { value: toHsla(defaults.colorM), order: 102 },
      colorY: { value: toHsla(defaults.colorY), order: 103 },
      colorK: { value: toHsla(defaults.colorK), order: 104 },
      size: { value: defaults.size, min: 0, max: 1, step: 0.01, order: 120 },
      gridNoise: { value: defaults.gridNoise, min: 0, max: 1, step: 0.01, order: 121 },
      type: {
        value: defaults.type,
        options: Object.keys(HalftoneCmykTypes) as HalftoneCmykType[],
        order: 123,
      },
      softness: { value: defaults.softness, min: 0, max: 1, step: 0.01, order: 124 },
      contrast: { value: defaults.contrast, min: 0, max: 2, step: 0.01, order: 130 },
      floodC: { value: defaults.floodC, min: 0, max: 1, step: 0.01, order: 210 },
      floodM: { value: defaults.floodM, min: 0, max: 1, step: 0.01, order: 211 },
      floodY: { value: defaults.floodY, min: 0, max: 1, step: 0.01, order: 212 },
      floodK: { value: defaults.floodK, min: 0, max: 1, step: 0.01, order: 213 },
      gainC: { value: defaults.gainC, min: -1, max: 1, step: 0.01, order: 200 },
      gainM: { value: defaults.gainM, min: -1, max: 1, step: 0.01, order: 201 },
      gainY: { value: defaults.gainY, min: -1, max: 1, step: 0.01, order: 202 },
      gainK: { value: defaults.gainK, min: -1, max: 1, step: 0.01, order: 203 },
      grainMixer: { value: defaults.grainMixer, min: 0, max: 1, order: 350 },
      grainOverlay: { value: defaults.grainOverlay, min: 0, max: 1, order: 351 },
      grainSize: { value: defaults.grainSize, min: 0, max: 1, order: 350 },
      scale: { value: defaults.scale, min: 0.1, max: 4, order: 420 },
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
  useUrlParams(params, setParams, halftoneCmykDef);
  usePresetHighlight(isHtmlInCanvas ? [{ name: 'Reset', params: defaults }] : halftoneCmykPresets, params);
  cleanUpLevaParams(params);

  if (isHtmlInCanvas) {
    return (
      <HtmlInCanvasShaderPage
        shaderDef={halftoneCmykDef}
        currentParams={params}
        defaultParams={presetDefaults}
        html={html}
      >
        <HalftoneCmyk {...params}>{html}</HalftoneCmyk>
      </HtmlInCanvasShaderPage>
    );
  }

  return (
    <>
      <ShaderContainer shaderDef={halftoneCmykDef} currentParams={params}>
        <HalftoneCmyk onClick={handleClick} {...params} image={image} />
      </ShaderContainer>
      <div onClick={handleClick} className="mx-auto mt-16 mb-48 w-fit text-base text-current/70 select-none">
        Click to change the sample image
      </div>
      <ShaderDetails shaderDef={halftoneCmykDef} currentParams={params} />
    </>
  );
};

export default HalftoneCmykWithControls;

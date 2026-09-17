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

const { worldWidth, worldHeight, ...imageDefaults } = lensDistortionPresets[0].params;

/** The HTML-in-canvas page spreads the dispersion over noisy, bulged glass, which keeps the HTML readable at the center */
const htmlDefaults = {
  ...imageDefaults,
  spread: 0.36,
  angle: 28,
  perspective: 1,
  count: 50,
  dispersionColor: 0.89,
  focusCenter: 1,
  focusEdges: 0,
  swirl: 0.15,
  noise: 0.69,
  noiseFrequency: 0,
  lensBulge: -0.4,
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

const LensDistortionWithControls = () => {
  const isHtmlInCanvas = useIsHtmlInCanvasPage();
  const defaults = isHtmlInCanvas ? htmlDefaults : imageDefaults;
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
        defaultParams={imageDefaults}
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

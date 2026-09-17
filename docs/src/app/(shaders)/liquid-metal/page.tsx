'use client';

import { LiquidMetal, liquidMetalPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { LiquidMetalShapes, LiquidMetalShape } from '@paper-design/shaders';
import { ShaderFit } from '@paper-design/shaders';
import { levaDeleteImageButton, levaImageButton } from '@/helpers/leva-image-button';
import { useState, Suspense } from 'react';
import { ShaderDetails } from '@/components/shader-details';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { isHtmlInCanvasPath, useIsHtmlInCanvasPage } from '@/helpers/use-is-html-in-canvas-page';
import { withCode } from '@/helpers/jsx-to-code';
import { HtmlInCanvasShaderPage } from '@/components/html-in-canvas-shader-page';
import { liquidMetalDef } from '@/shader-defs/liquid-metal-def';
import { toHsla } from '@/helpers/color-utils';

// Override just for the docs, we keep it transparent in the preset
// liquidMetalPresets[0].params.colorBack = '#000000';

const { worldWidth, worldHeight, ...defaults } = liquidMetalPresets[0].params;

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

const LiquidMetalWithControls = () => {
  const isHtmlInCanvas = useIsHtmlInCanvasPage();
  const [image, setImage] = useState<HTMLImageElement | string>('');

  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      liquidMetalPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorTint: { value: toHsla(defaults.colorTint), order: 101 },
      shape: {
        value: defaults.shape,
        options: Object.keys(LiquidMetalShapes) as LiquidMetalShape[],
        order: 102,
        disabled: isHtmlInCanvas || Boolean(image),
      },
      repetition: { value: defaults.repetition, min: 1, max: 10, order: 200 },
      softness: { value: defaults.softness, min: 0, max: 1, order: 201 },
      shiftRed: { value: defaults.shiftRed, min: -1, max: 1, order: 202 },
      shiftBlue: { value: defaults.shiftBlue, min: -1, max: 1, order: 203 },
      distortion: { value: defaults.distortion, min: 0, max: 1, order: 204 },
      contour: { value: defaults.contour, min: 0, max: 1, order: 205 },
      angle: { value: defaults.angle, min: 0, max: 360, order: 206 },
      speed: { value: defaults.speed, min: 0, max: 4, order: 300 },
      scale: { value: defaults.scale, min: 0.1, max: 4, order: 301 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 303 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 304 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 305 },
      Image: folder(
        {
          'Upload image': levaImageButton((img?: HTMLImageElement) => setImage(img ?? '')),
          ...(image && { 'Delete image': levaDeleteImageButton(() => setImage('')) }),
        },
        { render: () => !isHtmlInCanvasPath() }
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
  useUrlParams(params, setParams, liquidMetalDef);
  usePresetHighlight(isHtmlInCanvas ? [{ name: 'Reset', params: defaults }] : liquidMetalPresets, params);
  cleanUpLevaParams(params);

  if (isHtmlInCanvas) {
    return (
      <HtmlInCanvasShaderPage shaderDef={liquidMetalDef} currentParams={params} defaultParams={defaults} html={html}>
        <LiquidMetal {...params}>{html}</LiquidMetal>
      </HtmlInCanvasShaderPage>
    );
  }

  return (
    <>
      <ShaderContainer shaderDef={liquidMetalDef} currentParams={params}>
        <Suspense fallback={null}>
          <LiquidMetal {...params} image={image} suspendWhenProcessingImage />
        </Suspense>
      </ShaderContainer>
      <ShaderDetails shaderDef={liquidMetalDef} currentParams={params} codeSampleImageName="images/logos/diamond.svg" />
    </>
  );
};

export default LiquidMetalWithControls;

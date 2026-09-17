'use client';

import { FlutedGlass, flutedGlassPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { GlassGridShape, GlassGridShapes, GlassDistortionShape, GlassDistortionShapes } from '@paper-design/shaders';
import { ShaderFit } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { flutedGlassDef } from '@/shader-defs/fluted-glass-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { isHtmlInCanvasPath, useIsHtmlInCanvasPage } from '@/helpers/use-is-html-in-canvas-page';
import { withCode } from '@/helpers/jsx-to-code';
import { HtmlInCanvasShaderPage } from '@/components/html-in-canvas-shader-page';

const { worldWidth, worldHeight, ...presetDefaults } = flutedGlassPresets[0].params;

/** The HTML-in-canvas page uses wider flutes and a softer cascade, so the HTML stays legible through the glass */
const htmlInCanvasDefaults = {
  ...presetDefaults,
  shadows: 0.24,
  highlights: 0,
  size: 0.8,
  distortionShape: 'cascade' as const,
  distortion: 0.21,
  blur: 0.12,
  edges: 0,
  margin: 0.2,
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

const FlutedGlassWithControls = () => {
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
      flutedGlassPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorShadow: { value: toHsla(defaults.colorShadow), order: 101 },
      colorHighlight: { value: toHsla(defaults.colorHighlight), order: 102 },
      size: { value: defaults.size, min: 0, max: 1, step: 0.001, order: 210 },
      shadows: { value: defaults.shadows, min: 0, max: 1, order: 200 },
      highlights: { value: defaults.highlights, min: 0, max: 1, order: 201 },
      shape: {
        value: defaults.shape,
        options: Object.keys(GlassGridShapes) as GlassGridShape[],
        order: 211,
      },
      angle: { value: defaults.angle, min: 0, max: 180, order: 212 },
      distortionShape: {
        value: defaults.distortionShape,
        options: Object.keys(GlassDistortionShapes) as GlassDistortionShape[],
        order: 213,
      },
      distortion: { value: defaults.distortion, min: 0, max: 1, order: 214 },
      shift: { value: defaults.shift, min: -1, max: 1, order: 215 },
      stretch: { value: defaults.stretch, min: 0, max: 1, order: 216 },
      blur: { value: defaults.blur, min: 0, max: 1, order: 220 },
      edges: { value: defaults.edges, min: 0, max: 1, order: 221 },
      margin: { value: defaults.margin, min: 0, max: 1, order: 500 },
      grainMixer: { value: defaults.grainMixer, min: 0, max: 1, order: 550 },
      grainOverlay: { value: defaults.grainOverlay, min: 0, max: 1, order: 551 },
      scale: { value: defaults.scale, min: 0.1, max: 4, order: 600 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 604 },

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
  useUrlParams(params, setParams, flutedGlassDef);
  usePresetHighlight(isHtmlInCanvas ? [{ name: 'Reset', params: defaults }] : flutedGlassPresets, params);
  cleanUpLevaParams(params);

  if (isHtmlInCanvas) {
    return (
      // The code sample leaves out params matching the component defaults, which are the default preset's
      <HtmlInCanvasShaderPage
        shaderDef={flutedGlassDef}
        currentParams={params}
        defaultParams={presetDefaults}
        html={html}
      >
        <FlutedGlass {...params}>{html}</FlutedGlass>
      </HtmlInCanvasShaderPage>
    );
  }

  return (
    <>
      <ShaderContainer shaderDef={flutedGlassDef} currentParams={params}>
        <FlutedGlass onClick={handleClick} {...params} image={image} />
      </ShaderContainer>

      <div onClick={handleClick} className="mx-auto mt-16 mb-48 w-fit text-base text-current/70 select-none">
        Click to change the sample image
      </div>

      <ShaderDetails shaderDef={flutedGlassDef} currentParams={params} />
    </>
  );
};

export default FlutedGlassWithControls;

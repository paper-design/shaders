'use client';

import { FlutedGlass, flutedGlassPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { GlassGridShape, GlassGridShapes, GlassDistortionShape, GlassDistortionShapes } from '@paper-design/shaders';
import { ShaderFit } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback, type MouseEvent } from 'react';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { flutedGlassDef } from '@/shader-defs/fluted-glass-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { isHtmlInCanvasPath, useIsHtmlInCanvasPage } from '@/helpers/use-is-html-in-canvas-page';
import { HtmlInCanvasShaderPage } from '@/components/html-in-canvas-shader-page';
import { withCode } from '@/helpers/jsx-to-code';

const { worldWidth, worldHeight, ...presetDefaults } = flutedGlassPresets[0].params;

/** The HTML-in-canvas page uses wider flutes and a softer cascade, so the HTML stays legible through the glass */
const htmlInCanvasDefaults = {
  ...presetDefaults,
  colorShadow: '#92aae3',
  shadows: 0.4,
  highlights: 0,
  size: 0.85,
  distortionShape: 'prism' as const,
  distortion: 0.15,
  blur: 0,
  edges: 0,
  marginLeft: 0,
  marginRight: 0.1,
  marginTop: 0.1,
  marginBottom: 0.5,
};

const htmlStyle = `
  .demo { position: relative; height: 100%; color: #fff; overflow: hidden; timeline-scope: --demo-scroll }
  .demo .bg { position: absolute; top: 0; left: 0; right: 0; height: 300%; background: url(/images/html-in-canvas/succulents.jpg) center top / cover; filter: brightness(0.7); animation: bg-pan linear both; animation-timeline: --demo-scroll; animation-range: 0px 4000px }
  .demo ::selection { background: #ffd60a; color: #1a1a1a }
  .demo .scroller { height: 100%; overflow-y: auto; scrollbar-width: none; scroll-timeline: --demo-scroll; position: relative }
  .demo .scroller::after { content: ""; display: block; height: 60% }
  .demo article { position: relative; text-transform: uppercase; max-width: 1400px; padding: 180px 8% 0; font-family: system-ui, sans-serif;  }
  .demo h1 { margin: 0; font-weight: bold; opacity: .8; line-height: .85; font-size: 180px; letter-spacing: -0.03em }
  .demo p { max-width: 80%; margin: 4% 0; font-size: 44px; }
  .demo .shapes { display: flex; flex-wrap: wrap; gap: 12px; margin: -2% 0 20% }
  .demo .shapes button { padding: 0.35em 0.9em; border: 2px solid rgb(255 255 255 / 50%); border-radius: 999px; background: none; color: inherit; font: inherit; font-size: 30px; text-transform: inherit; cursor: pointer }
  .demo .shapes button:hover { border-color: #fff }
  .demo .shapes button[aria-pressed="true"] { border-color: #ffd60a; background: #ffd60a; color: #1a1a1a }
  .demo kbd { padding: 0.05em 0.35em; border: 2px solid rgb(255 255 255 / 60%); border-bottom-width: 4px; border-radius: 0.25em; font: inherit; font-size: 0.85em }
  .demo .hint { position: fixed; bottom: 15px; right: 20px; display: flex; align-items: center; font-size: 22px; animation: hint-fade linear both; animation-timeline: --demo-scroll; animation-range: 0 16px }
  .demo .hint span { display: inline-block; padding-left: 0.5em; animation: hint-bounce 1.2s ease-in-out infinite }
  @keyframes bg-pan { to { transform: translateY(-2000px) } }
  @keyframes hint-fade { to { opacity: 0 } }
  @keyframes hint-bounce { 50% { transform: translateY(8px) } }
`;

/** The buttons in the text drive the shader's distortionShape, so the HTML both shows the effect and controls it */
const getHtml = (
  distortionShape: GlassDistortionShape,
  onShapeClick: (event: MouseEvent<HTMLButtonElement>) => void
) => (
  <div className="demo">
    <style>{htmlStyle}</style>
    <div className="bg" />
    <div className="scroller">
      <article>
        <h1>Fluted glass</h1>
        <span className="hint">
          scroll down <span>↓</span>
        </span>
        <p>Everything here is live HTML, drawn into a canvas and pushed through a fluted glass shader.</p>
        <p>Pick a shape for the flutes and watch the text bend differently:</p>
        <div className="shapes">
          {Object.keys(GlassDistortionShapes).map((shape) => (
            <button key={shape} value={shape} aria-pressed={shape === distortionShape} onClick={onShapeClick}>
              {shape}
            </button>
          ))}
        </div>
        <p>The photo behind scrolls at half speed with plain CSS, and the glass bends it just like the text.</p>
        <p>It is still real text: press <kbd>⌘+F</kbd> or <kbd>Ctrl+F</kbd> to find a word on the page, or drag across it to select.</p>
        <p>Forms, links and inputs keep working under the glass.</p>
      </article>
    </div>
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
      margin: { value: defaults.margin, min: 0, max: 1, order: 500, render: () => !isHtmlInCanvasPath() },
      marginLeft: { value: defaults.marginLeft, min: 0, max: 1, order: 501, render: () => isHtmlInCanvasPath() },
      marginRight: { value: defaults.marginRight, min: 0, max: 1, order: 502, render: () => isHtmlInCanvasPath() },
      marginTop: { value: defaults.marginTop, min: 0, max: 1, order: 503, render: () => isHtmlInCanvasPath() },
      marginBottom: { value: defaults.marginBottom, min: 0, max: 1, order: 504, render: () => isHtmlInCanvasPath() },
      grainMixer: { value: defaults.grainMixer, min: 0, max: 1, order: 550 },
      grainOverlay: { value: defaults.grainOverlay, min: 0, max: 1, order: 551 },
      scale: { value: defaults.scale, min: 0.1, max: 4, order: 600, render: () => !isHtmlInCanvasPath() },
      fit: {
        value: defaults.fit,
        options: ['contain', 'cover'] as ShaderFit[],
        order: 604,
        render: () => !isHtmlInCanvasPath(),
      },

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

  // Per-side margins override the shared one, so each page passes only the margins it shows
  const { margin, marginLeft, marginRight, marginTop, marginBottom, ...restParams } = params;
  const shaderParams = isHtmlInCanvas
    ? { ...restParams, marginLeft, marginRight, marginTop, marginBottom }
    : { ...restParams, margin };

  if (isHtmlInCanvas) {
    const selectDistortionShape = withCode(
      (event: MouseEvent<HTMLButtonElement>) =>
        setParamsSafe(params, setParams, { distortionShape: event.currentTarget.value }),
      `(event) => setDistortionShape(event.currentTarget.value)`
    );
    const html = getHtml(params.distortionShape, selectDistortionShape);

    return (
      // The code sample leaves out params matching the component defaults, which are the default preset's
      <HtmlInCanvasShaderPage
        shaderDef={flutedGlassDef}
        currentParams={shaderParams}
        defaultParams={presetDefaults}
        html={html}
      >
        <FlutedGlass {...shaderParams}>{html}</FlutedGlass>
      </HtmlInCanvasShaderPage>
    );
  }

  return (
    <>
      <ShaderContainer shaderDef={flutedGlassDef} currentParams={shaderParams}>
        <FlutedGlass onClick={handleClick} {...shaderParams} image={image} />
      </ShaderContainer>

      <div onClick={handleClick} className="mx-auto mt-16 mb-48 w-fit text-base text-current/70 select-none">
        Click to change the sample image
      </div>

      <ShaderDetails shaderDef={flutedGlassDef} currentParams={shaderParams} />
    </>
  );
};

export default FlutedGlassWithControls;

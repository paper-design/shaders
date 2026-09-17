'use client';

import { GemSmoke, gemSmokePresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { gemSmokeMeta, GemSmokeShapes, GemSmokeShape } from '@paper-design/shaders';
import { ShaderFit } from '@paper-design/shaders';
import { levaDeleteImageButton, levaImageButton } from '@/helpers/leva-image-button';
import { useState, Suspense, useEffect, useCallback } from 'react';
import { ShaderDetails } from '@/components/shader-details';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { isHtmlInCanvasPath, useIsHtmlInCanvasPage } from '@/helpers/use-is-html-in-canvas-page';
import { withCode } from '@/helpers/jsx-to-code';
import { HtmlInCanvasShaderPage } from '@/components/html-in-canvas-shader-page';
import { gemSmokeDef } from '@/shader-defs/gem-smoke-def';
import { toHsla } from '@/helpers/color-utils';
import { useColors } from '@/helpers/use-colors';

const { worldWidth, worldHeight, ...defaults } = gemSmokePresets[0].params;

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
  'contra.svg',
  'apple.svg',
  'paradigm.svg',
  'paper-logo-only.svg',
  'brave.svg',
  'capy.svg',
  'infinite.svg',
  'linear.svg',
  'mercury.svg',
  'mymind.svg',
  'resend.svg',
  'shopify.svg',
  'wealth-simple.svg',
  'chanel.svg',
  'cibc.svg',
  'cloudflare.svg',
  'discord.svg',
  'nasa.svg',
  'nike.svg',
  'volkswagen.svg',
  'diamond.svg',
] as const;

const GemSmokeWithControls = () => {
  const isHtmlInCanvas = useIsHtmlInCanvasPage();
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | string>('');

  useEffect(() => {
    if (imageIdx >= 0) {
      const name = imageFiles[imageIdx];
      const img = new Image();
      img.src = `/images/logos/${name}`;
      img.onload = () => setImage(img);
    }
  }, [imageIdx]);

  const handleClick = useCallback(() => {
    setImageIdx((prev) => (prev + 1) % imageFiles.length);
    // setImageIdx(() => Math.floor(Math.random() * imageFiles.length));
  }, []);

  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: gemSmokeMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorInner: { value: toHsla(defaults.colorInner), order: 101 },
      shape: {
        value: defaults.shape,
        options: Object.keys(GemSmokeShapes) as GemSmokeShape[],
        order: 102,
        disabled: isHtmlInCanvas || Boolean(image),
      },
      innerDistortion: { value: defaults.innerDistortion, min: 0, max: 1, order: 201 },
      outerDistortion: { value: defaults.outerDistortion, min: 0, max: 1, order: 202 },
      outerGlow: { value: defaults.outerGlow, min: 0, max: 1, order: 203 },
      innerGlow: { value: defaults.innerGlow, min: 0, max: 1, order: 204 },
      offset: { value: defaults.offset, min: -1, max: 1, order: 205 },
      angle: { value: defaults.angle, min: 0, max: 360, order: 250 },
      size: { value: defaults.size, min: 0, max: 1, order: 251 },
      speed: { value: defaults.speed, min: 0, max: 4, order: 300 },
      scale: { value: defaults.scale, min: 0.1, max: 4, order: 301 },
      Image: folder(
        {
          'Upload image': levaImageButton((img?: HTMLImageElement) => setImage(img ?? '')),
          ...(image && { 'Delete image': levaDeleteImageButton(() => setImage('')) }),
        },
        { order: -1, render: () => !isHtmlInCanvasPath() }
      ),
    };
  }, [colors.length, image]);

  useControls(() => {
    const presets = Object.fromEntries(
      gemSmokePresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => {
          const { colors, ...presetParams } = preset;
          setColors(colors);
          setParamsSafe(params, setParams, presetParams);
        }),
      ])
    );
    return {
      Presets: folder(presets, { order: -2, render: () => !isHtmlInCanvasPath() }),
      Preset: folder(
        {
          Reset: button(() => {
            const { colors, ...presetParams } = defaults;
            setColors(colors);
            setParamsSafe(params, setParams, presetParams);
          }),
        },
        { order: -2, render: () => isHtmlInCanvasPath() }
      ),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, gemSmokeDef, setColors);
  usePresetHighlight(isHtmlInCanvas ? [{ name: 'Reset', params: defaults }] : gemSmokePresets, params);
  cleanUpLevaParams(params);

  if (isHtmlInCanvas) {
    return (
      <HtmlInCanvasShaderPage
        shaderDef={gemSmokeDef}
        currentParams={{ colors, ...params }}
        defaultParams={defaults}
        html={html}
      >
        <GemSmoke {...params} colors={colors}>
          {html}
        </GemSmoke>
      </HtmlInCanvasShaderPage>
    );
  }

  return (
    <>
      <ShaderContainer shaderDef={gemSmokeDef} currentParams={params}>
        <Suspense fallback={null}>
          <GemSmoke onClick={handleClick} {...params} colors={colors} image={image} suspendWhenProcessingImage />
        </Suspense>
      </ShaderContainer>
      <ShaderDetails
        shaderDef={gemSmokeDef}
        currentParams={{ colors, ...params }}
        codeSampleImageName="images/logos/diamond.svg"
      />
    </>
  );
};

export default GemSmokeWithControls;

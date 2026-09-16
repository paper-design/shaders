'use client';

import { Heatmap, heatmapMeta, heatmapPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { isHtmlInCanvasPath, useIsHtmlInCanvasPage } from '@/helpers/use-is-html-in-canvas-page';
import { withCode } from '@/helpers/jsx-to-code';
import { HtmlInCanvasShaderPage } from '@/components/html-in-canvas-shader-page';
import { heatmapDef } from '@/shader-defs/heatmap-def';
import { useColors } from '@/helpers/use-colors';
import { levaImageButton } from '@/helpers/leva-image-button';

const { worldWidth, worldHeight, ...defaults } = heatmapPresets[0].params;

const htmlStyle = `
  .demo { display: grid; align-content: center; justify-items: start; gap: 40px; height: 100%; padding: 0 8% }
  .demo p { margin: 0; font: 700 120px/1 system-ui; background: linear-gradient(90deg, #4052d6, #9b5de5); background-clip: text; color: transparent }
  .demo button { padding: 32px 64px; border: 0; border-radius: 99px; font: 48px system-ui; color: #fff; background: linear-gradient(135deg, #4052d6, #9b5de5) }
  .demo button:hover { filter: brightness(1.15) }
`;

// The counter runs from the function and prints from the string: the compiler rewrites function bodies
const handleClick = withCode(
  (event: { currentTarget: HTMLButtonElement }) => {
    const clicks = Number(event.currentTarget.dataset.clicks ?? 0) + 1;
    event.currentTarget.dataset.clicks = String(clicks);
    event.currentTarget.textContent = `Clicked ${clicks} time${clicks === 1 ? '' : 's'}`;
  },
  `(event) => {
  const clicks = Number(event.currentTarget.dataset.clicks ?? 0) + 1;
  event.currentTarget.dataset.clicks = String(clicks);
  event.currentTarget.textContent = \`Clicked \${clicks} time\${clicks === 1 ? '' : 's'}\`;
}`
);
const html = (
  <div className="demo">
    <style>{htmlStyle}</style>
    <p>Select this text</p>
    <button onClick={handleClick}>Hover and click me</button>
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

const HeatmapWithControls = () => {
  const isHtmlInCanvas = useIsHtmlInCanvasPage();
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | string>('/images/logos/diamond.svg');

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
    maxColorCount: heatmapMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 102 },
      contour: { value: defaults.contour, min: 0, max: 1, order: 103 },
      angle: { value: defaults.angle, min: 0, max: 360, order: 104 },
      noise: { value: defaults.noise, min: 0, max: 1, order: 105 },
      innerGlow: { value: defaults.innerGlow, min: 0, max: 1, order: 106 },
      outerGlow: { value: defaults.outerGlow, min: 0, max: 1, order: 107 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 300 },
      scale: { value: defaults.scale, min: 0.1, max: 4, order: 301 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 303 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 304 },
      Image: folder(
        {
          'Upload image': levaImageButton((img?: HTMLImageElement) => setImage(img ?? '')),
        },
        { order: -1, render: () => !isHtmlInCanvasPath() }
      ),
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      heatmapPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  useUrlParams(params, setParams, heatmapDef, setColors);
  usePresetHighlight(isHtmlInCanvas ? [{ name: 'Reset', params: defaults }] : heatmapPresets, params);
  cleanUpLevaParams(params);

  if (isHtmlInCanvas) {
    return (
      <HtmlInCanvasShaderPage
        shaderDef={heatmapDef}
        currentParams={{ colors, ...params }}
        defaultParams={defaults}
        html={html}
      >
        <Heatmap {...params} colors={colors}>
          {html}
        </Heatmap>
      </HtmlInCanvasShaderPage>
    );
  }

  return (
    <>
      <ShaderContainer shaderDef={heatmapDef} currentParams={{ colors, ...params }}>
        <Suspense fallback={null}>
          <Heatmap onClick={handleClick} {...params} colors={colors} image={image} suspendWhenProcessingImage />
        </Suspense>
      </ShaderContainer>
      <ShaderDetails
        shaderDef={heatmapDef}
        currentParams={{ colors, ...params }}
        codeSampleImageName="images/logos/diamond.svg"
      />
    </>
  );
};

export default HeatmapWithControls;

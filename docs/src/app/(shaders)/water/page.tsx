'use client';

import { Water, waterPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit } from '@paper-design/shaders';
import { levaImageButton, levaDeleteImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { waterDef } from '@/shader-defs/water-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { isHtmlInCanvasPath, useIsHtmlInCanvasPage } from '@/helpers/use-is-html-in-canvas-page';
import { withCode } from '@/helpers/jsx-to-code';
import { HtmlInCanvasShaderPage } from '@/components/html-in-canvas-shader-page';

const { worldWidth, worldHeight, ...presetDefaults } = waterPresets[0].params;

/** The HTML-in-canvas page uses teal water with bigger, brighter ripples, so the HTML shows through the surface */
const htmlInCanvasDefaults = {
  ...presetDefaults,
  colorBack: '#8ed7d5',
  colorHighlight: '#ffffff',
  highlights: 0.25,
  layering: 0.4,
  waves: 0.16,
  caustic: 0.04,
  size: 0.9,
};

const htmlStyle = `
  .demo { display: grid; place-content: center; justify-items: center; gap: 1.6cqw; height: 100%; container-type: inline-size; color: #fff; text-shadow: 0 0.04em 0.12em rgb(0 70 80 / 35%); position: relative }
  .demo time { font: 12.8cqw/1 'Paper Mono', ui-monospace, monospace; }
  .demo p { margin: 0; font: 2.4cqw ui-monospace, monospace; }
  .demo img { position: absolute; top: 5.5cqw; right: 5.5cqw; height: 2.8cqw; filter: brightness(0) invert(1) drop-shadow(0 0.15cqw 0.4cqw rgb(0 70 80 / 35%)) }
`;

// The clock runs from the function and prints from the string: the compiler rewrites function bodies
const startClock = withCode(
  (element: HTMLDivElement | null) => {
    const time = element!.querySelector('time')!;
    const date = element!.querySelector('p')!;
    const city = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()!.replace(/_/g, ' ');
    const tick = () => {
      const now = new Date();
      time.textContent = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      });
      date.textContent = `${now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })} · ${city}`;
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  },
  `(element) => {
  const time = element.querySelector('time');
  const date = element.querySelector('p');
  const city = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace(/_/g, ' ');
  const tick = () => {
    const now = new Date();
    time.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    date.textContent = \`\${now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })} · \${city}\`;
  };
  tick();
  const interval = setInterval(tick, 1000);
  return () => clearInterval(interval);
}`
);
const html = (
  <div className="demo" ref={startClock}>
    <style>{htmlStyle}</style>
    <time>00:00:00</time>
    <p>today</p>
    <img src="/images/logos/paper.svg" alt="Paper" />
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

const notes = (
  <>
    Thanks to{' '}
    <a href="https://x.com/zozuar" target="_blank" rel="noopener">
      zozuar
    </a>{' '}
    for the amazing{' '}
    <a href="https://twigl.app/?ol=true&ss=-NOAlYulOVLklxMdxBDx" target="_blank" rel="noopener">
      recursive fractal noise algorithm
    </a>
    .
  </>
);

const WaterWithControls = () => {
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
      waterPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorHighlight: { value: toHsla(defaults.colorHighlight), order: 101 },
      highlights: { value: defaults.highlights, min: 0, max: 1, order: 200 },
      layering: { value: defaults.layering, min: 0, max: 1, order: 201 },
      edges: { value: defaults.edges, min: 0, max: 1, order: 202 },
      waves: { value: defaults.waves, min: 0, max: 1, order: 203 },
      caustic: { value: defaults.caustic, min: 0, max: 1, order: 204 },
      size: { value: defaults.size, min: 0.01, max: 7, order: 205 },
      speed: { value: defaults.speed, min: 0, max: 3, order: 300 },
      scale: { value: defaults.scale, min: 0.1, max: 4, order: 301, render: () => !isHtmlInCanvasPath() },
      fit: {
        value: defaults.fit,
        options: ['contain', 'cover'] as ShaderFit[],
        order: 302,
        render: () => !isHtmlInCanvasPath(),
      },
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
  useUrlParams(params, setParams, waterDef);
  usePresetHighlight(isHtmlInCanvas ? [{ name: 'Reset', params: defaults }] : waterPresets, params);
  cleanUpLevaParams(params);

  if (isHtmlInCanvas) {
    return (
      <HtmlInCanvasShaderPage
        shaderDef={waterDef}
        currentParams={params}
        defaultParams={presetDefaults}
        html={html}
        notes={notes}
      >
        <Water {...params}>{html}</Water>
      </HtmlInCanvasShaderPage>
    );
  }

  return (
    <>
      <ShaderContainer shaderDef={waterDef} currentParams={params}>
        <Water onClick={handleClick} {...params} image={image} />
      </ShaderContainer>
      <div onClick={handleClick} className="mx-auto mt-16 mb-48 w-fit text-base text-current/70 select-none">
        Click to change the sample image
      </div>
      <ShaderDetails shaderDef={waterDef} currentParams={params} notes={notes} />
    </>
  );
};

export default WaterWithControls;

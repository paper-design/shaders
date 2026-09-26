'use client';

import { ImageDithering, imageDitheringPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { DitheringType, DitheringTypes, ShaderFit } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { imageDitheringDef } from '@/shader-defs/image-dithering-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { isHtmlInCanvasPath, useIsHtmlInCanvasPage } from '@/helpers/use-is-html-in-canvas-page';
import { withCode } from '@/helpers/jsx-to-code';
import { HtmlInCanvasShaderPage } from '@/components/html-in-canvas-shader-page';

const { worldWidth, worldHeight, ...presetDefaults } = imageDitheringPresets[0].params;

/** The HTML-in-canvas page keeps the page's own colors, so the palette survives the dithering */
const htmlInCanvasDefaults = {
  ...presetDefaults,
  colorFront: '#fff3a8',
  colorHighlight: '#ff00f7',
  originalColors: true,
  type: '2x2',
  size: 2,
  colorSteps: 2,
} satisfies typeof presetDefaults;

const htmlStyle = `
  .demo { --bg: #f0efe4; --text: #222; --panel: #e2dfcf; --muted: #666; --line: rgb(0 0 0 / 15%); --yellow: #ffd23f; --pink: #ff8fab; --blue: #7aa7ff; --green: #5fd49a; display: flex; flex-direction: column; height: 100%; overflow: hidden; background: var(--bg); color: var(--text); font: 500 28px/1.2 Matter, system-ui; font-feature-settings: "ss01"; user-select: none }
  .demo button { padding: 0; border: 0; background: none; color: inherit; font: inherit; cursor: pointer }
  .demo header { display: flex; align-items: center; gap: 28px; padding: 20px 32px; border-bottom: 2px solid var(--line) }
  .demo .burger { display: grid; gap: 9px; width: 40px; margin-right: auto }
  .demo .burger span { height: 5px; border-radius: 3px; background: var(--text); transition: translate 300ms, rotate 300ms, opacity 300ms }
  .demo.menu-open .burger span:nth-child(1) { translate: 0 14px; rotate: 45deg }
  .demo.menu-open .burger span:nth-child(2) { opacity: 0 }
  .demo.menu-open .burger span:nth-child(3) { translate: 0 -14px; rotate: -45deg }
  .demo header img { width: 56px; height: 56px; border: 3px solid var(--pink); border-radius: 50%; object-fit: cover }
  .demo .body { flex: 1; display: flex; min-height: 0 }
  .demo nav { display: grid; align-content: start; gap: 12px; width: 0; padding: 32px 0; overflow: hidden; background: var(--panel); font-size: 40px; white-space: nowrap; transition: width 400ms }
  .demo.menu-open nav { width: 280px }
  .demo nav a { padding: 0 32px }
  .demo main { flex: 1; display: grid; grid-template-columns: 1fr minmax(max-content, 1fr); align-items: center; gap: 48px; min-width: 0; padding: 32px 48px }
  .demo .details { display: grid }
  .demo .detail { grid-area: 1 / 1; opacity: 0; pointer-events: none; translate: 0 12px; transition: opacity 200ms, translate 200ms }
  .demo:has(label:nth-of-type(1) :checked) .detail:nth-child(1),
  .demo:has(label:nth-of-type(2) :checked) .detail:nth-child(2),
  .demo:has(label:nth-of-type(3) :checked) .detail:nth-child(3),
  .demo:has(label:nth-of-type(4) :checked) .detail:nth-child(4) { --mark: 100%; opacity: 1; pointer-events: auto; translate: 0; transition: opacity 500ms 150ms, translate 700ms 150ms cubic-bezier(0.2, 0.8, 0.2, 1) }
  .demo :is(.detail, label):nth-of-type(1) { --tile: var(--yellow) }
  .demo :is(.detail, label):nth-of-type(2) { --tile: var(--blue) }
  .demo :is(.detail, label):nth-of-type(3) { --tile: var(--pink) }
  .demo :is(.detail, label):nth-of-type(4) { --tile: var(--green) }
  .demo h1 { margin: 0 0 16px; font-size: 72px; line-height: 1 }
  .demo h1 span { background: linear-gradient(transparent 55%, var(--tile) 55% 90%, transparent 90%) no-repeat 0 0 / var(--mark, 0%) 100%; box-decoration-break: clone; -webkit-box-decoration-break: clone; transition: background-size 600ms 350ms cubic-bezier(0.2, 0.8, 0.2, 1) }
  .demo p { margin: 0 0 32px; color: var(--muted); font-size: 36px }
  .demo .like { display: flex; align-items: center; gap: 16px; padding: 14px 32px; border: 2px solid var(--line); border-radius: 48px; font-size: 36px }
  .demo .like svg { width: 40px; height: 40px; fill: none; stroke: currentColor; stroke-width: 2.5; transition: fill 200ms, stroke 200ms, scale 200ms }
  .demo .like span { font-family: 'Paper Mono', ui-monospace, monospace }
  .demo .like.liked svg { fill: #e5484d; stroke: #e5484d; scale: 1.15 }
  .demo .playlists { display: grid; gap: 14px }
  .demo label { padding: 18px 28px; border-radius: 20px; background: var(--tile); color: #1a1a1a; font-size: 32px; white-space: nowrap; cursor: pointer; transition: box-shadow 200ms }
  .demo label:has(:checked) { box-shadow: 0 0 0 4px var(--bg), 0 0 0 8px var(--text) }
  .demo input { display: none }
`;

const playlists = [
  { title: 'Morning coffee', about: 'Slow jazz and soft piano to ease into the day', likes: 128 },
  { title: 'Deep focus', about: 'Wordless ambient loops that keep you in the zone', likes: 342 },
  { title: 'Night drive', about: 'Synthwave for empty roads and city lights', likes: 76 },
  { title: 'Garden party', about: 'Sunny bossa nova and disco for long afternoons', likes: 51 },
];

// The handlers run from the functions and print from the strings: the compiler rewrites function bodies
const handleMenuToggle = withCode(
  (event: { currentTarget: HTMLElement }) => {
    event.currentTarget.closest('.demo')!.classList.toggle('menu-open');
  },
  `(event) => {
  event.currentTarget.closest('.demo').classList.toggle('menu-open');
}`
);
const handleLike = withCode(
  (event: { currentTarget: HTMLElement }) => {
    const isLiked = event.currentTarget.classList.toggle('liked');
    const count = event.currentTarget.querySelector('span')!;
    count.textContent = String(Number(count.textContent) + (isLiked ? 1 : -1));
  },
  `(event) => {
  const isLiked = event.currentTarget.classList.toggle('liked');
  const count = event.currentTarget.querySelector('span');
  count.textContent = String(Number(count.textContent) + (isLiked ? 1 : -1));
}`
);
const html = (
  <div className="demo">
    <style>{htmlStyle}</style>
    <header>
      <button className="burger" aria-label="Menu" onClick={handleMenuToggle}>
        <span />
        <span />
        <span />
      </button>
      <img src="/images/image-filters/001.webp" alt="" />
    </header>
    <div className="body">
      <nav>
        <a>Home</a>
        <a>Browse</a>
        <a>Library</a>
      </nav>
      <main>
        <div className="details">
          {playlists.map(({ title, about, likes }) => (
            <div className="detail" key={title}>
              <h1>
                <span>{title}</span>
              </h1>
              <p>{about}</p>
              <button className="like" onClick={handleLike}>
                <svg viewBox="0 0 24 24">
                  <path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z" />
                </svg>
                <span>{likes}</span>
              </button>
            </div>
          ))}
        </div>
        <div className="playlists">
          {playlists.map(({ title }, index) => (
            <label key={title}>
              <input type="radio" name="playlist" {...(index === 0 && { defaultChecked: true })} />
              {title}
            </label>
          ))}
        </div>
      </main>
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

const ImageDitheringWithControls = () => {
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
      imageDitheringPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorFront: { value: toHsla(defaults.colorFront), order: 102 },
      colorHighlight: { value: toHsla(defaults.colorHighlight), order: 103 },
      originalColors: { value: defaults.originalColors, order: 104 },
      inverted: { value: defaults.inverted, order: 105 },
      type: { value: defaults.type, options: Object.keys(DitheringTypes) as DitheringType[], order: 200 },
      size: { value: defaults.size, min: 0.5, max: 20, order: 201 },
      colorSteps: { value: defaults.colorSteps, min: 1, max: 7, step: 1, order: 202 },
      scale: { value: defaults.scale, min: 0.1, max: 4, order: 300 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 301 },
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
  useUrlParams(params, setParams, imageDitheringDef);
  usePresetHighlight(isHtmlInCanvas ? [{ name: 'Reset', params: defaults }] : imageDitheringPresets, params);
  cleanUpLevaParams(params);

  if (isHtmlInCanvas) {
    return (
      <HtmlInCanvasShaderPage shaderDef={imageDitheringDef} currentParams={params} defaultParams={defaults} html={html}>
        <ImageDithering {...params}>{html}</ImageDithering>
      </HtmlInCanvasShaderPage>
    );
  }

  return (
    <>
      <ShaderContainer shaderDef={imageDitheringDef} currentParams={params}>
        <ImageDithering onClick={handleClick} {...params} image={image} />
      </ShaderContainer>
      <div onClick={handleClick} className="mx-auto mt-16 mb-48 w-fit text-base text-current/70 select-none">
        Click to change the sample image
      </div>
      <ShaderDetails shaderDef={imageDitheringDef} currentParams={params} />
    </>
  );
};

export default ImageDitheringWithControls;

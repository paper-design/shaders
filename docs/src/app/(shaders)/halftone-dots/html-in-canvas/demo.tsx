import { withCode } from '@/helpers/jsx-to-code';

/** The HTML-in-canvas page drops the grain distortion, so the text edges stay clean */
export const htmlInCanvasParams = {
  colorBack: '#fff6d6',
  grainMixer: 0,
  contrast: 0.3,
};

const htmlStyle = `
  .demo { --ease: cubic-bezier(0.22, 1, 0.36, 1); --ease-expand: cubic-bezier(0.16, 1, 0.3, 1); position: relative; height: 100%; container-type: inline-size; overflow: hidden; color: #222; background: #fff }
  .demo ul { display: grid; align-content: center; width: 50%; height: 100%; margin: 0; padding: 0 0 0 5cqw; box-sizing: border-box; list-style: none; transition: opacity 400ms var(--ease) 300ms }
  .demo[data-fullscreen] ul { opacity: 0; pointer-events: none; transition: opacity 250ms var(--ease) }
  .demo a { display: block; padding: 0.8cqw 0; font: 400 8cqw/1.1 Matter, system-ui; font-feature-settings: "ss01"; text-transform: lowercase; color: inherit; text-decoration: underline 0.5cqw transparent; text-underline-offset: 1.4cqw; cursor: pointer; transition: opacity 600ms var(--ease), text-decoration-color 600ms var(--ease) }
  .demo a:hover { text-decoration-color: currentColor }
  .demo ul:has(a.active) a:not(.active), .demo ul:has(a:hover) a:not(:hover) { opacity: 0.25 }
  .demo ul:has(a:hover) a:hover { opacity: 1 }
  .demo img { position: absolute; top: 0; right: 0; width: 50%; height: 100%; object-fit: cover; opacity: 0; pointer-events: none; transition: opacity 600ms var(--ease), width 700ms var(--ease-expand) }
  .demo img.active { opacity: 1 }
  .demo[data-fullscreen] img { width: 100% }
  .demo[data-fullscreen] img.active { pointer-events: auto; cursor: zoom-out }
  .demo button { position: absolute; top: 3cqw; right: 3cqw; display: grid; place-items: center; width: 7cqw; height: 7cqw; padding: 0; border: 0; border-radius: 50%; background: #fff; cursor: pointer; opacity: 0; pointer-events: none; transition: opacity 300ms var(--ease) }
  .demo button svg { width: 3cqw; height: 3cqw; stroke: #222; stroke-width: 3; stroke-linecap: round }
  .demo[data-fullscreen] button { opacity: 1; pointer-events: auto; transition-delay: 600ms }
`;

// The handlers run from the functions and print from the strings: the compiler rewrites function bodies
const showImage = withCode(
  (event: { currentTarget: HTMLAnchorElement }) => {
    const link = event.currentTarget;
    const demo = link.closest('.demo')!;
    demo
      .querySelectorAll('img')
      .forEach((image, index) => image.classList.toggle('active', index === Number(link.dataset.image)));
    demo.querySelectorAll('a').forEach((other) => other.classList.toggle('active', other === link));
  },
  `(event) => {
  const link = event.currentTarget;
  const demo = link.closest('.demo');
  demo.querySelectorAll('img').forEach((image, index) => image.classList.toggle('active', index === Number(link.dataset.image)));
  demo.querySelectorAll('a').forEach((other) => other.classList.toggle('active', other === link));
}`
);
const openImage = withCode(
  (event: { currentTarget: HTMLElement }) => {
    event.currentTarget.closest<HTMLElement>('.demo')!.dataset.fullscreen = '';
  },
  `(event) => {
  event.currentTarget.closest('.demo').dataset.fullscreen = '';
}`
);
const closeImage = withCode(
  (event: { currentTarget: HTMLElement }) => {
    delete event.currentTarget.closest<HTMLElement>('.demo')!.dataset.fullscreen;
  },
  `(event) => {
  delete event.currentTarget.closest('.demo').dataset.fullscreen;
}`
);

export const html = (
  <div className="demo">
    <style>{htmlStyle}</style>
    <img className="active" src="/images/image-filters/0018.webp" alt="Flowers" onClick={closeImage} />
    <img src="/images/image-filters/002.webp" alt="Banana on blue" onClick={closeImage} />
    <img src="/images/image-filters/003.webp" alt="Astronaut on the Moon" onClick={closeImage} />
    <img src="/images/image-filters/004.webp" alt="Monstera leaves" onClick={closeImage} />
    <img src="/images/image-filters/005.webp" alt="Marble statue on red" onClick={closeImage} />
    <ul>
      <li>
        <a className="active" data-image="0" onPointerEnter={showImage} onClick={openImage}>
          Flowers
        </a>
      </li>
      <li>
        <a data-image="1" onPointerEnter={showImage} onClick={openImage}>
          Banana
        </a>
      </li>
      <li>
        <a data-image="2" onPointerEnter={showImage} onClick={openImage}>
          Astronaut
        </a>
      </li>
      <li>
        <a data-image="3" onPointerEnter={showImage} onClick={openImage}>
          Monstera
        </a>
      </li>
      <li>
        <a data-image="4" onPointerEnter={showImage} onClick={openImage}>
          Statue
        </a>
      </li>
    </ul>
    <button aria-label="Close" onClick={closeImage}>
      <svg viewBox="0 0 16 16">
        <path d="M3 3l10 10M13 3L3 13" />
      </svg>
    </button>
  </div>
);

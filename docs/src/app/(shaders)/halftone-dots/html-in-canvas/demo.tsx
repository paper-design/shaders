import { withCode } from '@/helpers/jsx-to-code';

/** The HTML-in-canvas page drops the grain distortion, so the text edges stay clean */
export const htmlInCanvasParams = {
  colorBack: '#fff6d6',
  grainMixer: 0,
  contrast: 0.3,
};

// The active name thickens with a growing text stroke rather than font-weight, which would also widen the word:
// the stroke doesn't change the glyph advances, so the letters swell in place and the dots grow with them.
// The stroke width itself doesn't animate, so it follows a registered length property that does.
// A dot grows in right after the active name on the same timing.
const htmlStyle = `
  @property --highlight-stroke { syntax: '<length>'; inherits: false; initial-value: 0px }
  .demo { --ease: cubic-bezier(0.22, 1, 0.36, 1); position: relative; height: 100%; container-type: inline-size; overflow: hidden; color: #222; background: #fff }
  .demo ul { display: grid; align-content: center; justify-items: start; width: 50%; height: 100%; margin: 0; padding: 0 0 0 3cqw; box-sizing: border-box; list-style: none }
  .demo a { display: flex; align-items: center; gap: 2cqw; padding: 0.8cqw 0; font: 300 8cqw/1.1 Matter, system-ui; font-feature-settings: "ss01"; letter-spacing: 0.03em; text-transform: lowercase; color: inherit; -webkit-text-stroke: var(--highlight-stroke) currentColor; cursor: default; transition: --highlight-stroke 1000ms var(--ease) }
  .demo a.active { --highlight-stroke: 0.065em }
  .demo a::after { content: ''; display: inline-block; flex: none; width: 2.6cqw; height: 2.6cqw; margin-top: 0.8cqw; border-radius: 50%; background: currentColor; scale: 0; transition: scale 1000ms var(--ease) }
  .demo a.active::after { scale: 1 }
  .demo img { position: absolute; top: 0; right: 0; width: 50%; height: 100%; object-fit: cover; opacity: 0; pointer-events: none; transition: opacity 600ms var(--ease) }
  .demo img.active { opacity: 1 }
`;

// The handler runs from the function and prints from the string: the compiler rewrites function bodies
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

export const html = (
  <div className="demo">
    <style>{htmlStyle}</style>
    <img className="active" src="/images/image-filters/004.webp" alt="Monstera leaves" />
    <img src="/images/image-filters/006.webp" alt="Palm fronds on yellow" />
    <img src="/images/image-filters/0015.webp" alt="Mint sprigs" />
    <img src="/images/image-filters/0018.webp" alt="Orange cosmos flowers" />
    <ul>
      <li>
        <a className="active" data-image="0" onPointerEnter={showImage}>
          Tropical
        </a>
      </li>
      <li>
        <a data-image="1" onPointerEnter={showImage}>
          Palms
        </a>
      </li>
      <li>
        <a data-image="2" onPointerEnter={showImage}>
          Herbs
        </a>
      </li>
      <li>
        <a data-image="3" onPointerEnter={showImage}>
          Blooms
        </a>
      </li>
    </ul>
  </div>
);

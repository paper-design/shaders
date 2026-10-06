import { type PointerEvent } from 'react';
import { withCode } from '@/helpers/jsx-to-code';

/** The HTML-in-canvas page drops the grain distortion, so the text edges stay clean */
export const htmlInCanvasOverrides = {
  colorBack: '#fff6d6',
  grainMixer: 0,
  radius: 1.15,
  contrast: 0.4,
};

// The active name thickens with a growing text stroke rather than font-weight, which would also widen the word:
// the stroke doesn't change the glyph advances, so the letters swell in place and the dots grow with them.
// The stroke width itself doesn't animate, so it follows a registered length property that does.
// A dot grows in right after the active name on the same timing. It sits on the baseline and is lifted by half
// an x-height minus its radius, so it centers on the lowercase letters in whatever font the system picks.
export const htmlContentCss = `
@property --highlight-stroke { syntax: '<length>'; inherits: false; initial-value: 0px }
.demo { --ease: cubic-bezier(0.22, 1, 0.36, 1); position: relative; height: 100%; container-type: inline-size; overflow: hidden; color: #222; background: #fff }
.demo ul { display: grid; align-content: center; justify-items: start; width: 50%; height: 100%; margin: 0; padding: 0 0 0 3cqw; box-sizing: border-box; list-style: none }
.demo a { display: flex; align-items: baseline; gap: 2cqw; padding: 0.8cqw 0; font: 300 80px/1.1 system-ui; letter-spacing: 0.03em; text-transform: lowercase; -webkit-text-stroke: var(--highlight-stroke) currentColor; cursor: default; transition: --highlight-stroke 1000ms var(--ease) }
.demo a.active { --highlight-stroke: 0.065em }
.demo a::after { content: ''; flex: none; width: 0.32em; height: 0.32em; translate: 0 calc(0.16em - 0.5ex); border-radius: 50%; background: currentColor; scale: 0; transition: scale 1000ms var(--ease) }
.demo a.active::after { scale: 1 }
.demo img { position: absolute; top: 0; right: 0; width: 50%; height: 100%; object-fit: cover; opacity: 0; pointer-events: none; transition: opacity 1000ms var(--ease) }
.demo img.active { opacity: 1 }
`;

const topics = [
  { name: 'Tropical', src: '/images/image-filters/004.webp', alt: 'Monstera leaves' },
  { name: 'Palms', src: '/images/image-filters/006.webp', alt: 'Palm fronds on yellow' },
  { name: 'Herbs', src: '/images/image-filters/0015.webp', alt: 'Mint sprigs' },
  { name: 'Blooms', src: '/images/image-filters/0018.webp', alt: 'Orange cosmos flowers' },
];

// The handler runs from the function and prints from the string: the compiler rewrites function bodies.
// One handler on the demo serves every link: the hovered link and its image share an index
const showImage = withCode(
  (event: PointerEvent<HTMLDivElement>) => {
    const link = (event.target as Element).closest('a');
    if (!link) return;
    const links = [...event.currentTarget.querySelectorAll('a')];
    const index = links.indexOf(link);
    links.forEach((other) => other.classList.toggle('active', other === link));
    event.currentTarget.querySelectorAll('img').forEach((image, i) => image.classList.toggle('active', i === index));
  },
  `(event) => {
  const link = event.target.closest('a');
  if (!link) return;
  const links = [...event.currentTarget.querySelectorAll('a')];
  const index = links.indexOf(link);
  links.forEach((other) => other.classList.toggle('active', other === link));
  event.currentTarget.querySelectorAll('img').forEach((image, i) => image.classList.toggle('active', i === index));
}`
);

export const htmlContent = (
  <div className="demo" onPointerOver={showImage}>
    {topics.map(({ src, alt }, index) => (
      <img key={src} src={src} alt={alt} {...(index === 0 && { className: 'active' })} />
    ))}
    <ul>
      {topics.map(({ name }, index) => (
        <li key={name}>
          <a {...(index === 0 && { className: 'active' })}>{name}</a>
        </li>
      ))}
    </ul>
  </div>
);

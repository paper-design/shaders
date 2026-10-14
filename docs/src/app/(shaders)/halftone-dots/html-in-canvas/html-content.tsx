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
// The names and the photos sit side by side, and their aspect ratio gives the gallery its height.
// When two columns don't fit, they wrap into equal rows with the photos on top: the photos then stop sizing
// the rows, so the names set the row height and the photos take half of the gallery.
export const htmlContentCss = `
.gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); grid-auto-rows: 1fr; align-items: center; container-type: inline-size; color: #222; background: #fff }
.gallery ul { display: grid; justify-items: start; margin: 0; padding: 32px; list-style: none }
.gallery .photos { display: grid }
.gallery a { display: flex; align-items: baseline; gap: 16px; padding: 4px 0; font: 300 64px/1 system-ui; letter-spacing: 0.03em; text-transform: lowercase; -webkit-text-stroke: var(--highlight-stroke) currentColor; cursor: default; transition: --highlight-stroke 1s cubic-bezier(0.22, 1, 0.36, 1) }
.gallery a.active { --highlight-stroke: 0.065em }
.gallery a::after { content: ''; flex: none; width: 0.32em; height: 0.32em; translate: 0 calc(0.16em - 0.5ex); border-radius: 50%; background: currentColor; scale: 0; transition: scale 1s cubic-bezier(0.22, 1, 0.36, 1) }
.gallery a.active::after { scale: 1 }
.gallery img { grid-area: 1 / 1; width: 100%; aspect-ratio: 4 / 5; object-fit: cover; opacity: 0; pointer-events: none; transition: opacity 1s cubic-bezier(0.22, 1, 0.36, 1) }
.gallery img.active { opacity: 1 }
@container (width < 720px) {
  .gallery .photos { order: -1; align-self: stretch; position: relative }
  .gallery img { position: absolute; inset: 0; height: 100% }
}
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
  <div className="gallery" onPointerOver={showImage}>
    <ul>
      {topics.map(({ name }, index) => (
        <li key={name}>
          <a {...(index === 0 && { className: 'active' })}>{name}</a>
        </li>
      ))}
    </ul>
    <div className="photos">
      {topics.map(({ src, alt }, index) => (
        <img key={src} src={src} alt={alt} {...(index === 0 && { className: 'active' })} />
      ))}
    </div>
  </div>
);

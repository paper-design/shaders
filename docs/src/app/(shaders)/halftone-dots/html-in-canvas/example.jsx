'use client';

import { HalftoneDots } from '@paper-design/shaders-react';
import './example.css';

export const params = {
  originX: 0,
  originY: 0,
  colorBack: '#fff6d6',
  grainMixer: 0,
  radius: 1.15,
  contrast: 0.3,
  size: 0.3,
  grainOverlay: 0,
};

const images = 'https://shaders.paper.design/images/image-filters';

const topics = [
  { name: 'Tropical', src: `${images}/004.webp`, alt: 'Monstera leaves' },
  { name: 'Palms', src: `${images}/006.webp`, alt: 'Palm fronds on yellow' },
  { name: 'Herbs', src: `${images}/0015.webp`, alt: 'Mint sprigs' },
  { name: 'Blooms', src: `${images}/0018.webp`, alt: 'Orange cosmos flowers' },
];

// One handler on the gallery serves every link: the hovered link and its image share an index
function showImage(event) {
  const link = event.target.closest('a');
  if (!link) return;
  const links = [...event.currentTarget.querySelectorAll('a')];
  const index = links.indexOf(link);
  links.forEach((other) => other.classList.toggle('active', other === link));
  event.currentTarget.querySelectorAll('img').forEach((image, i) => image.classList.toggle('active', i === index));
}

export default function Example(props) {
  return (
    <HalftoneDots {...params} sizeToContent="height" {...props}>
      <div className="gallery" onPointerOver={showImage}>
        <ul>
          {topics.map(({ name }, index) => (
            <li key={name}>
              <a className={index === 0 ? 'active' : undefined}>{name}</a>
            </li>
          ))}
        </ul>
        <div className="photos">
          {topics.map(({ src, alt }, index) => (
            <img key={src} src={src} alt={alt} crossOrigin="anonymous" className={index === 0 ? 'active' : undefined} />
          ))}
        </div>
      </div>
    </HalftoneDots>
  );
}

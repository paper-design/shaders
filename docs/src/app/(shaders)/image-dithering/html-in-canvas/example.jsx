'use client';

import { useState } from 'react';
import { flushSync } from 'react-dom';
import { ImageDithering } from '@paper-design/shaders-react';
import './example.css';

export const params = {
  originX: 0,
  originY: 0,
  colorBack: '#00021f',
  colorFront: '#fff3a8',
  colorHighlight: '#940000',
  originalColors: true,
  type: '8x8',
  size: 2,
  colorSteps: 2,
};

const images = 'https://shaders.paper.design/images/image-filters';
const layouts = ['cover', 'spread', 'back'];
const menu = [
  { name: 'shaders', href: 'https://shaders.paper.design/' },
  { name: 'docs', href: 'https://shaders.paper.design/html-in-canvas' },
  { name: 'GitHub', href: 'https://github.com/paper-design/shaders' },
  { name: 'paper.design', href: 'https://paper.design/' },
];

export default function Example(props) {
  const [layout, setLayout] = useState('cover');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // flex-direction can't transition, so every block glides from where it was to where it lands
  const changeLayout = (name, page) => {
    const blocks = [...page.querySelectorAll('h1, p, figure')];
    const before = blocks.map((block) => block.getBoundingClientRect());
    flushSync(() => setLayout(name));
    blocks.forEach((block, index) => {
      const from = before[index];
      const to = block.getBoundingClientRect();
      const start = `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
      block.animate({ transform: [start, 'none'], transformOrigin: ['0 0', '0 0'] }, { duration: 300, easing: 'ease-out' });
    });
  };

  return (
    <ImageDithering {...params} style={{ height: '100vh' }} {...props}>
      <div className="zine">
        <aside data-open={isMenuOpen || undefined} inert={!isMenuOpen}>
          <div>
            {menu.map(({ name, href }) => (
              <a key={name} href={href} target="_blank" rel="noopener" onClick={() => setIsMenuOpen(false)}>
                {name}
              </a>
            ))}
          </div>
        </aside>
        <div className="page">
          <nav>
            <button
              className="burger"
              aria-label="Menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span />
              <span />
              <span />
            </button>
            {layouts.map((name) => (
              <button
                key={name}
                aria-pressed={name === layout}
                onClick={(event) => changeLayout(name, event.currentTarget.closest('.page'))}
              >
                {name}
              </button>
            ))}
          </nav>
          <main data-layout={layout}>
            <div className="lead">
              <h1>HTML in Canvas</h1>
              <p>The web, printed by a shader.</p>
            </div>
            <div className="photos">
              <figure>
                <img src={`${images}/0018.webp`} crossOrigin="anonymous" alt="Orange cosmos flowers" />
              </figure>
              <figure>
                <img src={`${images}/004.webp`} crossOrigin="anonymous" alt="Monstera leaves" />
              </figure>
            </div>
          </main>
        </div>
      </div>
    </ImageDithering>
  );
}

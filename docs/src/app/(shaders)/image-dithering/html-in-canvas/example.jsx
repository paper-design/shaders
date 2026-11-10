'use client';

import { useState } from 'react';
import { flushSync } from 'react-dom';
import { ImageDithering, MeshGradient, Metaballs } from '@paper-design/shaders-react';
import './example.css';

export const params = {
  originX: 0,
  originY: 0,
  colorBack: '#00021f',
  colorFront: '#b3cbff',
  colorHighlight: '#ffffff',
  originalColors: true,
  type: '8x8',
  size: 2,
  colorSteps: 2,
};

const layouts = ['column', 'row', 'row-reverse'];
const menu = [
  { name: 'shaders', href: 'https://shaders.paper.design/' },
  { name: 'docs', href: 'https://shaders.paper.design/html-in-canvas' },
  { name: 'GitHub', href: 'https://github.com/paper-design/shaders' },
  { name: 'paper.design', href: 'https://paper.design/' },
];

export default function Example(props) {
  const [layout, setLayout] = useState('column');
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
              <p>Any HTML, even other shaders, dithered live.</p>
            </div>
            <div className="photos">
              <figure>
                <a href="https://shaders.paper.design/mesh-gradient" target="_blank" rel="noopener" aria-label="Mesh Gradient">
                  <MeshGradient className="fill" colors={['#8fb3ea', '#f08a5d', '#f2c14e', '#f0efe4']} />
                </a>
              </figure>
              <figure>
                <a href="https://shaders.paper.design/metaballs" target="_blank" rel="noopener" aria-label="Metaballs">
                  <Metaballs className="fill" colorBack="#222222" colors={['#8fb3ea', '#f08a5d', '#f2c14e']} />
                </a>
              </figure>
            </div>
          </main>
        </div>
      </div>
    </ImageDithering>
  );
}

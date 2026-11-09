'use client';

import { useEffect, useState } from 'react';
import { LensDistortion } from '@paper-design/shaders-react';
import './example.css';

export const params = {
  dispersionColor: 0.75,
  spread: 0.14,
  bias: 0.3,
  angle: 28,
  perspective: 1,
  count: 50,
  focusCenter: 0.5,
  focusEdges: 0,
  swirl: 0,
  noise: 0,
  lensBulge: 0.1,
};

const items = [
  { name: 'text', text: 'Real text you can select and copy.', color: '#8fb3ea', ink: '#222' },
  { name: 'links', text: 'Links stay clickable.', color: '#f08a5d', ink: '#222' },
  { name: 'forms', text: 'Inputs and buttons work as usual.', color: '#f2c14e', ink: '#222' },
  { name: 'flexbox', text: 'Layout works like on any page.', color: '#222', ink: '#f0efe4' },
  { name: 'images', text: 'Drawn too, with CORS if cross-origin.', color: '#f0efe4', ink: '#222' },
  { name: 'scroll', text: 'Scrolling areas keep scrolling.', color: '#8fb3ea', ink: '#222' },
  { name: 'focus', text: 'Focus rings and carets are drawn.', color: '#f08a5d', ink: '#222' },
  { name: 'search', text: 'Find-in-page highlights are drawn.', color: '#f2c14e', ink: '#222' },
  { name: 'aria', text: 'Screen readers see regular DOM.', color: '#222', ink: '#f0efe4' },
];

const count = items.length;
const visibleSides = 3;
// Panels past the visible ones stay collapsed at the ends, ready to open during a move of any distance
const renderedSides = visibleSides * 2;
const slots = Array.from({ length: renderedSides * 2 + 1 }, (_, index) => index - renderedSides);

export default function Example(props) {
  // Keeps counting past the number of items, so panels keep their place in the row and the menu never has an end
  const [position, setPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timeout = setTimeout(() => setPosition(position + 1), 2400);
    return () => clearTimeout(timeout);
  }, [position, isPaused]);

  return (
    <LensDistortion {...params} style={{ height: '100vh' }} {...props}>
      <nav className="menu-loop" onPointerEnter={() => setIsPaused(true)} onPointerLeave={() => setIsPaused(false)}>
        {slots.map((slot) => {
          const panel = position + slot;
          const { name, text, color, ink } = items[((panel % count) + count) % count];
          const isVisible = Math.abs(slot) <= visibleSides;

          return (
            <button
              key={panel}
              style={{ '--grow': slot === 0 ? 5 : isVisible ? 1 : 0, '--color': color, '--ink': ink }}
              aria-current={slot === 0 ? 'page' : undefined}
              tabIndex={isVisible ? undefined : -1}
              onClick={() => setPosition(panel)}
            >
              <span>{name}</span>
              <p>{text}</p>
            </button>
          );
        })}
      </nav>
    </LensDistortion>
  );
}

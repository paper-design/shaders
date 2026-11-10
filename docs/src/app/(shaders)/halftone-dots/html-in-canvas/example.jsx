'use client';

import { useState } from 'react';
import {
  HalftoneDots,
  Metaballs,
  metaballsPresets,
  MeshGradient,
  meshGradientPresets,
  Swirl,
  swirlPresets,
  SmokeRing,
  smokeRingPresets,
} from '@paper-design/shaders-react';
import './example.css';

export const params = {
  originX: 0,
  originY: 0,
  colorBack: '#fff6d6',
  grainMixer: 0,
  radius: 1.15,
  contrast: 0.3,
  size: 0.2,
  grainOverlay: 0,
};

const shaders = [
  { name: 'Metaballs', path: 'metaballs', Shader: Metaballs, params: { ...metaballsPresets[1].params, scale: 1.5, colorBack: '#333333', colors: ['#ffffff'] } },
  {
    name: 'MeshGradient',
    path: 'mesh-gradient',
    Shader: MeshGradient,
    params: { ...meshGradientPresets[0].params, swirl: 1, speed: 2, colors: ['#bbbbbb', '#000000', '#666666', '#000000'] },
  },
  { name: 'Swirl', path: 'swirl', Shader: Swirl, params: swirlPresets[0].params },
  { name: 'SmokeRing', path: 'smoke-ring', Shader: SmokeRing, params: { ...smokeRingPresets[0].params, thickness: 0.5 } },
];

// Other Paper shaders run inside the HTML, and the dots print whatever they draw
export default function Example(props) {
  const [active, setActive] = useState(0);

  return (
    <HalftoneDots {...params} sizeToContent="height" {...props}>
      <div className="gallery">
        <ul>
          {shaders.map(({ name, path }, index) => (
            <li key={name}>
              <a
                className={index === active ? 'active' : undefined}
                href={`https://shaders.paper.design/${path}`}
                target="_blank"
                rel="noopener"
                onPointerEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
              >
                {name}
              </a>
            </li>
          ))}
        </ul>
        <div className="shaders">
          {shaders.map(({ name, Shader, params }, index) => (
            // Hidden shaders stand still, so only the one on show keeps drawing
            <Shader key={name} {...params} speed={index === active ? params.speed : 0} className={index === active ? 'active' : undefined} />
          ))}
        </div>
      </div>
    </HalftoneDots>
  );
}

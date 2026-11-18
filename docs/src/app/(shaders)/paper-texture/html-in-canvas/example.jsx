'use client';

import { useState } from 'react';
import { PaperTexture } from '@paper-design/shaders-react';
import { useFollowPanel } from '@/helpers/html-in-canvas-page'; // docs-only
import './example.css';

export const params = {
  colorBack: '#00000000',
  clip: true,
  colorShadow: '#c7c9d1',
  distortion: 0.25,
  angle: 116,
  seed: 311,
  roughness: 0.2,
  fiberSize: 0.72,
  wrinkleSize: 0.5,
  drops: 0.15,
};

function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.classList.add('submitted');
    form.querySelector(':invalid')?.focus();
    return;
  }
  form.reset();
  form.classList.remove('submitted');
  form.classList.add('done');
  setTimeout(() => form.classList.remove('done'), 3000);
}

export default function Example(props) {
  // Every symbol typed reshuffles the seed, so the sheet crumples anew under the text
  const [seed, setSeed] = useState(params.seed);
  useFollowPanel(props.seed, setSeed); // docs-only

  return (
    <PaperTexture {...params} sizeToContent="both" {...props} seed={seed}>
      <form
        className="signup"
        noValidate
        onSubmit={handleSubmit}
        onInput={() => setSeed(Math.floor(Math.random() * 1000))}
      >
        <h2>HTML form through Paper Texture</h2>
        <div className="field">
          <input type="text" name="name" placeholder="name" autoComplete="off" required />
          <span className="error">Please enter your name</span>
        </div>
        <div className="field">
          <input
            type="email"
            name="email"
            placeholder="email"
            autoComplete="off"
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
            required
          />
          <span className="error">Please enter a valid email</span>
        </div>
        <textarea name="message" placeholder="message" />
        <label>
          <input type="checkbox" name="subscribe" required />
          subscribe to updates
        </label>
        <button type="submit">send</button>
        <span className="sent">Thanks, you&apos;re on the list</span>
      </form>
    </PaperTexture>
  );
}

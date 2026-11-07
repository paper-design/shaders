'use client';

import { ImageDithering } from '@paper-design/shaders-react';
import './example.css';

export const params = {
  originX: 0,
  originY: 0,
  colorFront: '#fff3a8',
  colorHighlight: '#ff00f7',
  originalColors: true,
  type: '8x8',
  size: 2,
  colorSteps: 2,
};

const playlists = [
  { title: 'Morning coffee', about: 'Slow jazz and soft piano to ease into the day', likes: 128 },
  { title: 'Deep focus', about: 'Wordless ambient loops that keep you in the zone', likes: 342 },
  { title: 'Night drive', about: 'Synthwave for empty roads and city lights', likes: 76 },
  { title: 'Garden party', about: 'Sunny bossa nova and disco for long afternoons', likes: 51 },
];

function handleMenuToggle(event) {
  event.currentTarget.closest('.player').classList.toggle('menu-open');
}

function handleLike(event) {
  const like = event.target.closest('.like');
  if (!like) return;
  const isLiked = like.classList.toggle('liked');
  const count = like.querySelector('.count');
  count.textContent = String(Number(count.textContent) + (isLiked ? 1 : -1));
}

function selectPlaylist(event) {
  const button = event.target.closest('.playlists button');
  if (!button) return;
  button.closest('.player').dataset.playlist = button.dataset.playlist;
  for (const other of button.parentElement.children) other.setAttribute('aria-pressed', String(other === button));
}

export default function Example(props) {
  return (
    <ImageDithering {...params} style={{ height: '100vh' }} {...props}>
      <div className="player" data-playlist="1">
        <header>
          <button className="burger" aria-label="Menu" onClick={handleMenuToggle}>
            <span />
            <span />
            <span />
          </button>
          <img
            src="https://shaders.paper.design/images/image-filters/001.webp"
            crossOrigin="anonymous"
            alt=""
          />
        </header>
        <div className="body">
          <nav>
            <span />
            <span />
            <span />
            <span />
          </nav>
          <main>
            <div className="details" onClick={handleLike}>
              {playlists.map(({ title, about, likes }) => (
                <div className="detail" key={title}>
                  <h1>
                    <span>{title}</span>
                  </h1>
                  <span className="about">{about}</span>
                  <button className="like">
                    <span className="count">{likes}</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="playlists" onClick={selectPlaylist}>
              {playlists.map(({ title }, index) => (
                <button key={title} data-playlist={index + 1} aria-pressed={index === 0}>
                  {title}
                </button>
              ))}
            </div>
          </main>
        </div>
      </div>
    </ImageDithering>
  );
}

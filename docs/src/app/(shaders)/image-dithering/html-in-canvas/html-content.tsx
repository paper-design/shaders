import { type ImageDitheringParams } from '@paper-design/shaders';
import { withCode } from '@/helpers/jsx-to-code';

/** The HTML-in-canvas page keeps the page's own colors, so the palette survives the dithering */
export const htmlInCanvasOverrides = {
  colorFront: '#fff3a8',
  colorHighlight: '#ff00f7',
  originalColors: true,
  type: '8x8',
  size: 2,
  colorSteps: 2,
} satisfies Partial<ImageDitheringParams>;

// The active playlist's details show with --shown: 1, which also slows their transitions down and staggers them in.
// --tile is each playlist's color, shared by its button and the highlight behind its title.
// The chosen playlist is kept on the player itself, so every copy of the demo keeps its own
export const htmlContentCss = `
.player { display: flex; flex-direction: column; height: 100%; background: #f0efe4; color: #222; font: 500 28px/1.2 system-ui; user-select: none }
.player button { padding: 0; border: 0; background: none; color: inherit; font: inherit; cursor: pointer }
.player header { position: relative; display: flex; align-items: center; gap: 28px; padding: 20px 32px }
.player header::after { content: ""; position: absolute; top: 100%; inset-inline: 0; z-index: 3; height: 32px; background: linear-gradient(rgb(0 0 0 / 20%), transparent); pointer-events: none }
.player .burger { display: grid; gap: 9px; width: 40px; margin-right: auto }
.player .burger span { height: 5px; border-radius: 3px; background: #222; transition: 300ms }
.player.menu-open .burger span:nth-child(1) { translate: 0 14px; rotate: 45deg }
.player.menu-open .burger span:nth-child(2) { opacity: 0 }
.player.menu-open .burger span:nth-child(3) { translate: 0 -14px; rotate: -45deg }
.player header img { width: 56px; height: 56px; border: 3px solid #ff8fab; border-radius: 50%; object-fit: cover }
.player .body { flex: 1; display: flex; min-height: 0 }
.player nav { position: relative; z-index: 2; display: grid; align-content: start; gap: 12px; width: 0; padding: 32px 0; overflow: hidden; background: #e2dfcf; transition: width 400ms }
.player.menu-open nav { width: 280px }
.player nav span { display: flex; align-items: center; gap: 16px; height: 48px; padding: 0 32px }
.player nav span::before, .player nav span::after { content: ""; flex-shrink: 0; width: 120px; height: 18px; border-radius: 9px; background: gray }
.player nav span::before { width: 28px; height: 28px; border-radius: 8px }
.player nav span:nth-child(2)::after { width: 90px }
.player nav span:nth-child(3)::after { width: 140px }
.player nav span:nth-child(4)::after { width: 70px }
.player main { flex: 1; display: grid; grid-template-columns: 1fr minmax(max-content, 1fr); align-items: center; gap: 48px; min-width: 0; padding: 32px 48px }
.player .details, .player .detail { display: grid; justify-items: start }
.player .detail { --shown: 0; grid-area: 1 / 1; z-index: var(--shown); pointer-events: none }
.player[data-playlist="1"] .detail:nth-child(1),
.player[data-playlist="2"] .detail:nth-child(2),
.player[data-playlist="3"] .detail:nth-child(3),
.player[data-playlist="4"] .detail:nth-child(4) { --shown: 1; pointer-events: auto }
.player .detail > * { opacity: var(--shown); translate: 0 calc(16px - var(--shown) * 16px); transition: calc(150ms + var(--shown) * 450ms) calc(var(--shown) * 150ms) ease-out }
.player .detail > :nth-child(2) { transition-delay: calc(var(--shown) * 240ms) }
.player .detail > :nth-child(3) { transition-delay: calc(var(--shown) * 330ms) }
.player :is(.detail, .playlists button):nth-of-type(1) { --tile: #ffd23f }
.player :is(.detail, .playlists button):nth-of-type(2) { --tile: #7aa7ff }
.player :is(.detail, .playlists button):nth-of-type(3) { --tile: #ff8fab }
.player :is(.detail, .playlists button):nth-of-type(4) { --tile: #5fd49a }
.player h1 { margin: 0 0 16px; font-size: 72px; line-height: 1 }
.player h1 span { background: linear-gradient(transparent 55%, var(--tile) 55% 90%, transparent 90%) no-repeat 0 0 / calc(var(--shown) * 100%) 100%; box-decoration-break: clone; transition: background-size 600ms 350ms ease-out }
.player .about { margin-bottom: 32px; color: #666; font-size: 36px }
.player .like { display: flex; align-items: center; gap: 16px; font-size: 36px }
.player .like::before { content: ""; width: 44px; height: 44px; background: currentColor; mask: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z' fill='none' stroke='black' stroke-width='2.5' stroke-linejoin='round'/></svg>"); transition: background-color 150ms, scale 200ms }
.player .like:hover::before { scale: 1.1 }
.player .like.liked::before { background: #ff5e5e; mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z' stroke='black' stroke-width='2.5' stroke-linejoin='round'/></svg>"); animation: like-pop 300ms ease-out }
.player .like .count { min-width: 3ch; font-family: ui-monospace, monospace }
.player .playlists { display: grid; gap: 14px }
.player .playlists button { padding: 18px 28px; border-radius: 20px; background: var(--tile); color: #1a1a1a; font-size: 32px; text-align: left; white-space: nowrap; transition: box-shadow 200ms }
.player .playlists [aria-pressed="true"] { box-shadow: 0 0 0 4px #f0efe4, 0 0 0 8px #222 }
@keyframes like-pop { 50% { scale: 1.15 } }
`;

const playlists = [
  { title: 'Morning coffee', about: 'Slow jazz and soft piano to ease into the day', likes: 128 },
  { title: 'Deep focus', about: 'Wordless ambient loops that keep you in the zone', likes: 342 },
  { title: 'Night drive', about: 'Synthwave for empty roads and city lights', likes: 76 },
  { title: 'Garden party', about: 'Sunny bossa nova and disco for long afternoons', likes: 51 },
];

// The handlers run from the functions and print from the strings: the compiler rewrites function bodies
const handleMenuToggle = withCode(
  (event: { currentTarget: HTMLElement }) => {
    event.currentTarget.closest('.player')!.classList.toggle('menu-open');
  },
  `(event) => {
  event.currentTarget.closest('.player').classList.toggle('menu-open');
}`
);
// One handler on the list serves every like button
const handleLike = withCode(
  (event: { target: EventTarget }) => {
    const like = (event.target as Element).closest('.like');
    if (!like) return;
    const isLiked = like.classList.toggle('liked');
    const count = like.querySelector('.count')!;
    count.textContent = String(Number(count.textContent) + (isLiked ? 1 : -1));
  },
  `(event) => {
  const like = event.target.closest('.like');
  if (!like) return;
  const isLiked = like.classList.toggle('liked');
  const count = like.querySelector('.count');
  count.textContent = String(Number(count.textContent) + (isLiked ? 1 : -1));
}`
);
// One handler on the list serves every playlist button
const selectPlaylist = withCode(
  (event: { target: EventTarget }) => {
    const button = (event.target as Element).closest<HTMLElement>('.playlists button');
    if (!button) return;
    button.closest<HTMLElement>('.player')!.dataset.playlist = button.dataset.playlist;
    for (const other of button.parentElement!.children) other.setAttribute('aria-pressed', String(other === button));
  },
  `(event) => {
  const button = event.target.closest('.playlists button');
  if (!button) return;
  button.closest('.player').dataset.playlist = button.dataset.playlist;
  for (const other of button.parentElement.children) other.setAttribute('aria-pressed', String(other === button));
}`
);
export const htmlContent = (
  <div className="player" data-playlist="1">
    <header>
      <button className="burger" aria-label="Menu" onClick={handleMenuToggle}>
        <span />
        <span />
        <span />
      </button>
      <img src="/images/image-filters/001.webp" alt="" />
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
);

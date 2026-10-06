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

export const htmlContentCss = `
.demo { --bg: #f0efe4; --text: #222; --panel: #e2dfcf; --muted: #666; --shade: rgb(0 0 0 / 20%); --yellow: #ffd23f; --pink: #ff8fab; --blue: #7aa7ff; --green: #5fd49a; --like: #ff5e5e; --skeleton: #808080; display: flex; flex-direction: column; height: 100%; overflow: hidden; background: var(--bg); color: var(--text); font: 500 28px/1.2 system-ui; user-select: none }
.demo button { padding: 0; border: 0; background: none; color: inherit; font: inherit; cursor: pointer }
.demo header { position: relative; display: flex; align-items: center; gap: 28px; padding: 20px 32px }
.demo header::after { content: ""; position: absolute; top: 100%; left: 0; right: 0; z-index: 3; height: 32px; background: linear-gradient(var(--shade), transparent); pointer-events: none }
.demo .burger { display: grid; gap: 9px; width: 40px; margin-right: auto }
.demo .burger span { height: 5px; border-radius: 3px; background: var(--text); transition: translate 300ms, rotate 300ms, opacity 300ms }
.demo.menu-open .burger span:nth-child(1) { translate: 0 14px; rotate: 45deg }
.demo.menu-open .burger span:nth-child(2) { opacity: 0 }
.demo.menu-open .burger span:nth-child(3) { translate: 0 -14px; rotate: -45deg }
.demo header img { width: 56px; height: 56px; border: 3px solid var(--pink); border-radius: 50%; object-fit: cover }
.demo .body { flex: 1; display: flex; min-height: 0 }
.demo nav { position: relative; z-index: 2; display: grid; align-content: start; gap: 12px; width: 0; padding: 32px 0; overflow: hidden; background: var(--panel); transition: width 400ms }
.demo.menu-open nav { width: 280px }
.demo nav span { display: flex; align-items: center; gap: 16px; height: 48px; padding: 0 32px }
.demo nav span::before { content: ""; flex-shrink: 0; width: 28px; height: 28px; border-radius: 8px; background: var(--skeleton) }
.demo nav span::after { content: ""; flex-shrink: 0; width: 120px; height: 18px; border-radius: 9px; background: var(--skeleton) }
.demo nav span:nth-child(2)::after { width: 90px }
.demo nav span:nth-child(3)::after { width: 140px }
.demo nav span:nth-child(4)::after { width: 70px }
.demo main { flex: 1; display: grid; grid-template-columns: 1fr minmax(max-content, 1fr); align-items: center; gap: 48px; min-width: 0; padding: 32px 48px }
.demo .details, .demo .detail { display: grid; justify-items: start }
.demo .detail { --shown: 0; --delay: 0ms; --step: 0ms; --duration: 150ms; grid-area: 1 / 1; z-index: var(--shown); pointer-events: none }
.demo .detail > * { opacity: var(--shown); translate: 0 calc((1 - var(--shown)) * 16px); transition: opacity var(--duration) calc(var(--delay) + var(--i, 0) * var(--step)), translate var(--duration) calc(var(--delay) + var(--i, 0) * var(--step)) cubic-bezier(0.2, 0.8, 0.2, 1) }
.demo .detail > :nth-child(2) { --i: 1 }
.demo .detail > :nth-child(3) { --i: 2 }
.demo:has(label:nth-of-type(1) :checked) .detail:nth-child(1),
.demo:has(label:nth-of-type(2) :checked) .detail:nth-child(2),
.demo:has(label:nth-of-type(3) :checked) .detail:nth-child(3),
.demo:has(label:nth-of-type(4) :checked) .detail:nth-child(4) { --mark: 100%; --shown: 1; --delay: 150ms; --step: 90ms; --duration: 600ms; pointer-events: auto }
.demo :is(.detail, label):nth-of-type(1) { --tile: var(--yellow) }
.demo :is(.detail, label):nth-of-type(2) { --tile: var(--blue) }
.demo :is(.detail, label):nth-of-type(3) { --tile: var(--pink) }
.demo :is(.detail, label):nth-of-type(4) { --tile: var(--green) }
.demo h1 { margin: 0 0 16px; font-size: 72px; line-height: 1 }
.demo h1 span { background: linear-gradient(transparent 55%, var(--tile) 55% 90%, transparent 90%) no-repeat 0 0 / var(--mark, 0%) 100%; box-decoration-break: clone; transition: background-size 600ms 350ms cubic-bezier(0.2, 0.8, 0.2, 1) }
.demo p { margin: 0 0 32px; color: var(--muted); font-size: 36px }
.demo .like { display: flex; align-items: center; gap: 16px; font-size: 36px }
.demo .like::before { content: ""; width: 44px; height: 44px; background: currentColor; mask: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z' fill='none' stroke='black' stroke-width='2.5' stroke-linejoin='round'/></svg>"); transition: background-color 150ms, scale 200ms }
.demo .like:hover::before { scale: 1.1 }
.demo .like.liked::before { background: var(--like); mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z' stroke='black' stroke-width='2.5' stroke-linejoin='round'/></svg>"); animation: like-pop 300ms ease-out }
.demo .like .count { min-width: 3ch; font-family: ui-monospace, monospace }
.demo .playlists { display: grid; gap: 14px }
.demo label { padding: 18px 28px; border-radius: 20px; background: var(--tile); color: #1a1a1a; font-size: 32px; white-space: nowrap; cursor: pointer; transition: box-shadow 200ms }
.demo label:has(:checked) { box-shadow: 0 0 0 4px var(--bg), 0 0 0 8px var(--text) }
.demo input { display: none }
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
    event.currentTarget.closest('.demo')!.classList.toggle('menu-open');
  },
  `(event) => {
  event.currentTarget.closest('.demo').classList.toggle('menu-open');
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
export const htmlContent = (
  <div className="demo">
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
        <div className="info">
          <div className="details" onClick={handleLike}>
            {playlists.map(({ title, about, likes }) => (
              <div className="detail" key={title}>
                <h1>
                  <span>{title}</span>
                </h1>
                <p>{about}</p>
                <button className="like">
                  <span className="count">{likes}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="playlists">
          {playlists.map(({ title }, index) => (
            <label key={title}>
              <input type="radio" name="playlist" {...(index === 0 && { defaultChecked: true })} />
              {title}
            </label>
          ))}
        </div>
      </main>
    </div>
  </div>
);

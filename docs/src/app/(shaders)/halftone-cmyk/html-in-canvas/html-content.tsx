import { type ChangeEvent, type PointerEvent } from 'react';
import { withCode } from '@/helpers/jsx-to-code';

/** The HTML-in-canvas page uses a neutral, medium screen so the flat colors of the HTML split cleanly into the four inks */
export const htmlInCanvasOverrides = {
  size: 0.45,
  gridNoise: 0.2,
  softness: 0.3,
  contrast: 1.2,
  gainC: 0,
  gainY: 0,
  floodC: 0,
  grainSize: 0,
};

// Carets are always 1px wide, so the textarea is laid out at a quarter size and scaled up 4x to thicken its caret.
// Scaling doesn't resize the caption, so a hidden full-size copy of the text gives the caption its height.
// The headline and the sticker have fixed sizes; the caption and the slider too, shrinking only when there's no room
export const htmlContentCss = `
.demo { --hue: 55; position: relative; display: grid; grid-template-rows: 1fr auto; gap: 24px; width: 100%; height: 100%; padding: clamp(16px, 5%, 48px) clamp(16px, 6%, 56px); box-sizing: border-box; color: #111; background: #fff }
.demo .panel { position: relative; border: 6px solid #111; background: repeating-conic-gradient(from 0deg at 28% 58%, oklch(0.93 0.07 var(--hue)) 0 6deg, oklch(0.7 0.19 var(--hue)) 6deg 12deg) }
.demo h1 { position: absolute; left: 6%; bottom: 20%; margin: 0; font: 900 110px/0.88 system-ui; color: #fff; -webkit-text-stroke: 6px #111; paint-order: stroke fill; text-shadow: 12px 12px 0 #111; rotate: -6deg; cursor: grab; touch-action: none; user-select: none; transition: rotate 250ms ease-out, scale 250ms ease-out }
.demo h1:is(:hover:not(.dropped), .dragging) { rotate: -3deg; scale: 1.05 }
.demo .caption { position: absolute; top: 0; right: 0; display: grid; width: 336px; max-width: 100%; padding: 20px 28px; box-sizing: border-box; border: solid #111; border-width: 0 0 6px 6px; background: #fff5c2; cursor: text }
.demo .caption::after { content: attr(data-value) " "; grid-area: 1 / 1; visibility: hidden; white-space: pre-wrap; overflow-wrap: anywhere; font: 700 34px/1.1 system-ui; text-transform: uppercase }
.demo textarea { grid-area: 1 / 1; align-self: start; width: 25%; overflow-wrap: anywhere; field-sizing: content; padding: 0; border: 0; outline: none; resize: none; overflow: hidden; font: 700 8.5px/1.1 system-ui; text-transform: uppercase; color: inherit; background: none; scale: 4; transform-origin: top left }
.demo .color { display: flex; justify-content: flex-end; align-items: center; gap: 20px; font: 900 24px/1 system-ui }
.demo input { appearance: none; width: 360px; min-width: 0; height: 30px; margin: 0; border: 4px solid #111; border-radius: 30px; background: linear-gradient(to right, oklch(0.7 0.19 0), oklch(0.7 0.19 90), oklch(0.7 0.19 180), oklch(0.7 0.19 270), oklch(0.7 0.19 360)); cursor: pointer }
.demo input::-webkit-slider-thumb { appearance: none; width: 44px; height: 44px; border: 4px solid #111; border-radius: 50%; background: oklch(0.7 0.19 var(--hue)); box-shadow: 0 0 0 4px #fff; transition: scale 250ms ease-out }
.demo input:hover::-webkit-slider-thumb { scale: 1.12 }
.demo .sticker { position: absolute; right: 17%; bottom: 26%; display: grid; place-items: center; width: 260px; aspect-ratio: 1; font: 900 34px/1 system-ui; text-align: center; isolation: isolate; rotate: 12deg; cursor: grab; touch-action: none; user-select: none; transition: scale 250ms ease-out }
.demo .sticker:is(:hover:not(.dropped), .dragging) { scale: 1.08 }
.demo .dragging { cursor: grabbing }
.demo .sticker::before, .demo .sticker::after { content: ""; position: absolute; inset: 0; z-index: -1; background: #111; clip-path: polygon(50% 0%, 59% 15%, 75% 7%, 75% 25%, 93% 25%, 85% 41%, 100% 50%, 85% 59%, 93% 75%, 75% 75%, 75% 93%, 59% 85%, 50% 100%, 41% 85%, 25% 93%, 25% 75%, 7% 75%, 15% 59%, 0% 50%, 15% 41%, 7% 25%, 25% 25%, 25% 7%, 41% 15%) }
.demo .sticker::after { inset: 13px; background: #ffe03a }
`;

// The handlers run from the functions and print from the strings: the compiler rewrites function bodies
const focusAtEnd = withCode(
  (textarea: HTMLTextAreaElement | null) => {
    textarea?.focus({ preventScroll: true });
    textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
  },
  `(textarea) => {
  textarea?.focus({ preventScroll: true });
  textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
}`
);
const mirrorCaption = withCode(
  (event: ChangeEvent<HTMLTextAreaElement>) => {
    event.currentTarget.parentElement!.dataset.value = event.currentTarget.value;
  },
  `(event) => {
  event.currentTarget.parentElement.dataset.value = event.currentTarget.value;
}`
);
const setHue = withCode(
  (event: ChangeEvent<HTMLInputElement>) => {
    (event.currentTarget.closest('.demo') as HTMLElement).style.setProperty('--hue', event.currentTarget.value);
  },
  `(event) => {
  event.currentTarget.closest('.demo').style.setProperty('--hue', event.currentTarget.value);
}`
);
// One handler on the demo drags the headline and the sticker within their positioned parents.
// The dragging class holds the hover look for the whole drag, and the dropped class clears it on release
// until the pointer leaves the element
// offsetLeft and offsetTop ignore rotate and scale, so the grab point stays under the pointer
const drag = withCode(
  (event: PointerEvent<HTMLElement>) => {
    const element = (event.target as Element).closest<HTMLElement>('h1, .sticker');
    if (!element) return;
    event.preventDefault();
    const area = element.offsetParent as HTMLElement;
    const grabX = event.clientX - element.offsetLeft;
    const grabY = event.clientY - element.offsetTop;
    const move = (moveEvent: globalThis.PointerEvent) => {
      const left = Math.min(Math.max(moveEvent.clientX - grabX, 0), area.clientWidth - element.offsetWidth);
      const top = Math.min(Math.max(moveEvent.clientY - grabY, 0), area.clientHeight - element.offsetHeight);
      Object.assign(element.style, {
        left: `${(left / area.clientWidth) * 100}%`,
        top: `${(top / area.clientHeight) * 100}%`,
        right: 'auto',
        bottom: 'auto',
      });
    };
    element.setPointerCapture(event.pointerId);
    element.classList.add('dragging');
    element.addEventListener('pointermove', move);
    element.addEventListener(
      'lostpointercapture',
      () => {
        element.classList.replace('dragging', 'dropped');
        element.removeEventListener('pointermove', move);
        element.addEventListener('pointerleave', () => element.classList.remove('dropped'), { once: true });
      },
      { once: true }
    );
  },
  `(event) => {
  const element = event.target.closest('h1, .sticker');
  if (!element) return;
  event.preventDefault();
  const area = element.offsetParent;
  const grabX = event.clientX - element.offsetLeft;
  const grabY = event.clientY - element.offsetTop;
  const move = (moveEvent) => {
    const left = Math.min(Math.max(moveEvent.clientX - grabX, 0), area.clientWidth - element.offsetWidth);
    const top = Math.min(Math.max(moveEvent.clientY - grabY, 0), area.clientHeight - element.offsetHeight);
    Object.assign(element.style, {
      left: \`\${(left / area.clientWidth) * 100}%\`,
      top: \`\${(top / area.clientHeight) * 100}%\`,
      right: 'auto',
      bottom: 'auto',
    });
  };
  element.setPointerCapture(event.pointerId);
  element.classList.add('dragging');
  element.addEventListener('pointermove', move);
  element.addEventListener('lostpointercapture', () => {
    element.classList.replace('dragging', 'dropped');
    element.removeEventListener('pointermove', move);
    element.addEventListener('pointerleave', () => element.classList.remove('dropped'), { once: true });
  }, { once: true });
}`
);
export const htmlContent = (
  <div className="demo" onPointerDown={drag}>
    <div className="panel">
      <h1>
        DIGITAL
        <br />
        INK!
      </h1>
      <label className="caption" data-value="type here">
        <textarea
          ref={focusAtEnd}
          defaultValue="type here"
          spellCheck={false}
          aria-label="Caption"
          onChange={mirrorCaption}
        />
      </label>
    </div>
    <label className="color">
      COLOR
      <input type="range" min="0" max="360" defaultValue="55" onChange={setHue} />
    </label>
    <div className="sticker">DRAG ME</div>
  </div>
);

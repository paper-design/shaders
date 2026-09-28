import { type MouseEvent } from 'react';
import { withCode } from '@/helpers/jsx-to-code';

/** The HTML-in-canvas page uses a neutral, medium screen so the flat colors of the HTML split cleanly into the four inks */
export const htmlInCanvasParams = {
  size: 0.45,
  gridNoise: 0.2,
  softness: 0.3,
  contrast: 1.2,
  gainC: 0,
  gainY: 0,
  floodC: 0,
  grainSize: 0,
};

// Carets are always 1px wide, so the textarea is laid out at a quarter size and scaled up 4x to thicken its caret
const htmlStyle = `
  .demo { display: grid; grid-template-rows: 1fr auto; gap: 3%; height: 100%; padding: 5% 6%; box-sizing: border-box; container-type: inline-size; color: #111; background: #fff; --hover-transition: 250ms cubic-bezier(0.22, 1, 0.36, 1) }
  .demo .panel { position: relative; border: 0.6cqw solid #111; background: repeating-conic-gradient(from 0deg at 28% 70%, var(--a) 0 6deg, var(--b) 6deg 12deg); cursor: pointer }
  .demo h1 { position: absolute; left: 6%; bottom: 9%; margin: 0; font: 900 11cqw/0.88 Matter, system-ui; color: #fff; -webkit-text-stroke: 0.6cqw #111; paint-order: stroke fill; text-shadow: 1.2cqw 1.2cqw 0 #111; rotate: -6deg; transition: var(--hover-transition); transition-property: rotate, scale }
  .demo h1:hover { rotate: -3deg; scale: 1.05 }
  .demo .bubble { position: absolute; top: 10%; right: 6%; display: grid; align-items: center; width: 42%; min-height: 7.6cqw; padding: 3.5cqw 4cqw; border: 0.5cqw solid #111; border-radius: 50%; background: #fff; cursor: auto; transition: var(--hover-transition); transition-property: rotate, scale }
  .demo .bubble:hover { rotate: 3deg; scale: 1.05 }
  .demo .bubble::before, .demo .bubble::after { content: ""; position: absolute; top: 80%; left: 20%; width: 7cqw; height: 8cqw; background: #111; clip-path: polygon(0 0, 100% 0, 0 100%) }
  .demo .bubble::after { top: calc(80% - 0.7cqw); left: calc(20% + 0.5cqw); width: 5.4cqw; height: 6.2cqw; background: #fff }
  .demo textarea { display: block; justify-self: center; width: 25%; field-sizing: content; padding: 0; border: 0; outline: none; resize: none; overflow: hidden; font: 700 0.85cqw/1.1 Matter, system-ui; text-align: center; text-transform: uppercase; color: inherit; caret-color: #111; background: none; scale: 4 }
  .demo fieldset { display: flex; justify-content: flex-end; gap: 2.4cqw; margin: 0; padding: 0; border: 0 }
  .demo input { appearance: none; width: 4.4cqw; height: 4.4cqw; margin: 0; border: 0.4cqw solid #111; border-radius: 50%; background: var(--a); cursor: pointer; transition: scale var(--hover-transition) }
  .demo input:hover { scale: 1.12 }
  .demo input:checked { box-shadow: 0 0 0 0.5cqw #fff, 0 0 0 0.9cqw #111 }
  .demo, .demo [value="orange"] { --a: #ffa630; --b: #ff8000 }
  .demo [value="red"], .demo:has([value="red"]:checked) { --a: #ff5c4d; --b: #e0301e }
  .demo [value="teal"], .demo:has([value="teal"]:checked) { --a: #3dc9b0; --b: #16a08e }
  .demo [value="violet"], .demo:has([value="violet"]:checked) { --a: #a37cff; --b: #7c4dff }
`;

// The focus runs from the function and prints from the string: the compiler rewrites function bodies
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
// Clicking the panel outside the bubble picks the next color, without taking the focus from the bubble
const selectNextColor = withCode(
  (event: MouseEvent<HTMLElement>) => {
    if ((event.target as Element).closest('.bubble')) return;
    event.preventDefault();
    const inputs = [...event.currentTarget.parentElement!.querySelectorAll('input')];
    const checkedIndex = inputs.findIndex((input) => input.checked);
    inputs[(checkedIndex + 1) % inputs.length]!.checked = true;
  },
  `(event) => {
  if (event.target.closest('.bubble')) return;
  event.preventDefault();
  const inputs = [...event.currentTarget.parentElement.querySelectorAll('input')];
  const checkedIndex = inputs.findIndex((input) => input.checked);
  inputs[(checkedIndex + 1) % inputs.length].checked = true;
}`
);
export const html = (
  <div className="demo">
    <style>{htmlStyle}</style>
    <div className="panel" onMouseDown={selectNextColor}>
      <h1>
        DIGITAL
        <br />
        INK!
      </h1>
      <div className="bubble">
        <textarea ref={focusAtEnd} defaultValue="type here" spellCheck={false} aria-label="Speech bubble" />
      </div>
    </div>
    <fieldset>
      <input type="radio" name="panel-color" value="orange" aria-label="Orange" defaultChecked />
      <input type="radio" name="panel-color" value="red" aria-label="Red" />
      <input type="radio" name="panel-color" value="teal" aria-label="Teal" />
      <input type="radio" name="panel-color" value="violet" aria-label="Violet" />
    </fieldset>
  </div>
);

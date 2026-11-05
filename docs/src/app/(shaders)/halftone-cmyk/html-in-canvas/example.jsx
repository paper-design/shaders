'use client';

import { HalftoneCmyk } from '@paper-design/shaders-react';
import './example.css';

export const params = {
  originX: 0,
  originY: 0,
  size: 0.25,
  gridNoise: 0.2,
  softness: 0.3,
  contrast: 1.2,
  gainC: 0,
  gainY: 0,
  floodC: 0,
  grainSize: 0,
};

function focusAtEnd(textarea) {
  textarea?.focus({ preventScroll: true });
  textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
}

function mirrorCaption(event) {
  event.currentTarget.parentElement.dataset.value = event.currentTarget.value;
}

function setHue(event) {
  event.currentTarget.closest('.poster').style.setProperty('--hue', event.currentTarget.value);
}

// offsetLeft and offsetTop ignore rotate and scale, so the grab point stays under the pointer
function drag(event) {
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
}

export default function Example(props) {
  return (
    <HalftoneCmyk {...params} sizeToContent="height" {...props}>
      <div className="poster" onPointerDown={drag}>
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
    </HalftoneCmyk>
  );
}

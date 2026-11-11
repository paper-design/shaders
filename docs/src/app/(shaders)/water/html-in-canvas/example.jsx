'use client';

import { Water } from '@paper-design/shaders-react';
import './example.css';

export const params = {
  originX: 0,
  originY: 0,
  colorBack: '#8ed7d5',
  colorHighlight: '#ffffff',
  highlights: 0.25,
  layering: 0.4,
  waves: 0.16,
  caustic: 0.04,
  size: 0.9,
};

function startClock(element) {
  if (!element) return;
  const time = element.querySelector('time');
  const date = element.querySelector('.clock');
  const stopwatch = element.querySelector('.stopwatch');
  const city = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace(/_/g, ' ');
  const pad = (value) => String(Math.floor(value)).padStart(2, '0');
  let frame = 0;
  const tick = () => {
    let text = '';
    if (element.querySelector('.modes :checked')?.value !== 'stopwatch') {
      const now = new Date();
      text = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
      date.textContent = `${now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })} · ${city}`;
    } else {
      const { elapsed, since } = stopwatch.dataset;
      const ms = Number(elapsed) + (since ? Date.now() - Number(since) : 0);
      text = `${pad(ms / 60000)}:${pad((ms / 1000) % 60)}.${pad((ms / 10) % 100)}`;
    }
    if (time.textContent !== text) time.textContent = text;
    frame = requestAnimationFrame(tick);
  };
  tick();
  return () => cancelAnimationFrame(frame);
}

function toggleRunning(event) {
  const stopwatch = event.currentTarget.parentElement;
  const { elapsed, since } = stopwatch.dataset;
  if (since) {
    stopwatch.dataset.elapsed = String(Number(elapsed) + Date.now() - Number(since));
    delete stopwatch.dataset.since;
  } else {
    stopwatch.dataset.since = String(Date.now());
  }
}

function reset(event) {
  const stopwatch = event.currentTarget.parentElement;
  stopwatch.dataset.elapsed = '0';
  delete stopwatch.dataset.since;
}

export default function Example(props) {
  return (
    <Water {...params} style={{ height: '100vh' }} {...props}>
      <div className="timekeeper" ref={startClock}>
        <form className="modes">
          <label>
            <input type="radio" name="water-mode" value="clock" defaultChecked />
            clock
          </label>
          <label>
            <input type="radio" name="water-mode" value="stopwatch" />
            stopwatch
          </label>
        </form>
        <time>00:00:00</time>
        <section className="clock">today</section>
        <section className="stopwatch" data-elapsed="0">
          <button className="toggle" aria-label="Start or pause" onClick={toggleRunning} />
          <button className="reset" onClick={reset}>
            reset
          </button>
        </section>
      </div>
    </Water>
  );
}

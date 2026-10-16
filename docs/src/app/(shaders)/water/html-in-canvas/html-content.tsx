import { withCode } from '@/helpers/jsx-to-code';

/** The HTML-in-canvas page uses teal water with bigger, brighter ripples, so the HTML shows through the surface */
export const htmlInCanvasOverrides = {
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

// The mode radios show one section each with plain CSS, and the start button reads its label from the stopwatch state.
// The stopwatch keeps its state in data attributes: time run so far, and when the current run started.
export const htmlContentCss = `
.timekeeper { text-align: center; color: #fff; font: 24px ui-monospace, monospace; user-select: none }
.timekeeper time { font-size: 128px; line-height: 1 }
.timekeeper .modes, .timekeeper section { display: flex; justify-content: center; align-items: center; gap: 3cqw; min-height: 5.6cqw }
.timekeeper section { gap: 1.6cqw }
.timekeeper label { padding: 0.5cqw 0; border-bottom: 0.2cqw solid transparent; opacity: 0.8; cursor: pointer; transition: opacity 150ms }
.timekeeper label:hover, .timekeeper label:has(:checked) { opacity: 1 }
.timekeeper label:has(:checked) { border-color: currentColor }
.timekeeper input { display: none }
.timekeeper button { min-width: 12cqw; padding: 1cqw 2.4cqw; border: 0.2cqw solid rgb(255 255 255 / 80%); border-radius: 999px; background: rgb(255 255 255 / 25%); color: inherit; font: inherit; cursor: pointer; transition: background-color 150ms, opacity 150ms }
.timekeeper button:hover { background: rgb(255 255 255 / 40%) }
.timekeeper [data-elapsed="0"]:not([data-since]) .reset { opacity: 0.4; pointer-events: none }
.timekeeper:has([value="clock"]:checked) .stopwatch, .timekeeper:has([value="stopwatch"]:checked) .clock { display: none }
.timekeeper .toggle::before { content: 'start' }
.timekeeper [data-since] .toggle::before { content: 'pause' }
`;

// The handlers run from the functions and print from the strings: the compiler rewrites function bodies
const startClock = withCode(
  (element: HTMLDivElement | null) => {
    const time = element!.querySelector('time')!;
    const date = element!.querySelector<HTMLElement>('.clock')!;
    const stopwatch = element!.querySelector<HTMLElement>('.stopwatch')!;
    const city = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()!.replace(/_/g, ' ');
    const pad = (value: number) => String(Math.floor(value)).padStart(2, '0');
    let frame = 0;
    const tick = () => {
      let text = '';
      if (element!.querySelector<HTMLInputElement>('.modes :checked')?.value !== 'stopwatch') {
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
  },
  `(element) => {
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
      date.textContent = \`\${now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })} · \${city}\`;
    } else {
      const { elapsed, since } = stopwatch.dataset;
      const ms = Number(elapsed) + (since ? Date.now() - Number(since) : 0);
      text = \`\${pad(ms / 60000)}:\${pad((ms / 1000) % 60)}.\${pad((ms / 10) % 100)}\`;
    }
    if (time.textContent !== text) time.textContent = text;
    frame = requestAnimationFrame(tick);
  };
  tick();
  return () => cancelAnimationFrame(frame);
}`
);
const toggleRunning = withCode(
  (event: { currentTarget: HTMLButtonElement }) => {
    const stopwatch = event.currentTarget.parentElement!;
    const { elapsed, since } = stopwatch.dataset;
    if (since) {
      stopwatch.dataset.elapsed = String(Number(elapsed) + Date.now() - Number(since));
      delete stopwatch.dataset.since;
    } else {
      stopwatch.dataset.since = String(Date.now());
    }
  },
  `(event) => {
  const stopwatch = event.currentTarget.parentElement;
  const { elapsed, since } = stopwatch.dataset;
  if (since) {
    stopwatch.dataset.elapsed = String(Number(elapsed) + Date.now() - Number(since));
    delete stopwatch.dataset.since;
  } else {
    stopwatch.dataset.since = String(Date.now());
  }
}`
);
const reset = withCode(
  (event: { currentTarget: HTMLButtonElement }) => {
    const stopwatch = event.currentTarget.parentElement!;
    stopwatch.dataset.elapsed = '0';
    delete stopwatch.dataset.since;
  },
  `(event) => {
  const stopwatch = event.currentTarget.parentElement;
  stopwatch.dataset.elapsed = '0';
  delete stopwatch.dataset.since;
}`
);

export const htmlContent = (
  <div className="timekeeper" ref={startClock}>
    <div className="modes">
      <label>
        <input type="radio" name="water-mode" value="clock" defaultChecked />
        clock
      </label>
      <label>
        <input type="radio" name="water-mode" value="stopwatch" />
        stopwatch
      </label>
    </div>
    <time>00:00:00</time>
    <section className="clock">today</section>
    <section className="stopwatch" data-elapsed="0">
      <button className="toggle" aria-label="Start or pause" onClick={toggleRunning} />
      <button className="reset" onClick={reset}>
        reset
      </button>
    </section>
  </div>
);

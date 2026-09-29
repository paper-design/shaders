import { withCode } from '@/helpers/jsx-to-code';

/** The HTML-in-canvas page uses teal water with bigger, brighter ripples, so the HTML shows through the surface */
export const htmlInCanvasParams = {
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
const htmlStyle = `
  .demo { display: grid; place-content: center; justify-items: center; gap: 2cqw; height: 100%; container-type: inline-size; color: #fff; font: 2.4cqw 'Paper Mono', ui-monospace, monospace; text-shadow: 0 0.05em 0.25em rgb(0 70 80 / 55%); user-select: none }
  .demo time { font-size: 12.8cqw; line-height: 1; text-shadow: 0 0.04em 0.12em rgb(0 70 80 / 35%) }
  .demo nav, .demo section { display: flex; align-items: center; gap: 3cqw; min-height: 5.6cqw }
  .demo section { gap: 1.6cqw }
  .demo label { padding: 0.5cqw 0; border-bottom: 0.2cqw solid transparent; opacity: 0.8; cursor: pointer; transition: opacity 150ms }
  .demo label:hover, .demo label:has(:checked) { opacity: 1 }
  .demo label:has(:checked) { border-color: currentColor }
  .demo nav input { position: absolute; opacity: 0; pointer-events: none }
  .demo p { margin: 0 }
  .demo button { min-width: 12cqw; padding: 1cqw 2.4cqw; border: 0.2cqw solid rgb(255 255 255 / 80%); border-radius: 999px; background: rgb(255 255 255 / 25%); color: inherit; font: inherit; text-shadow: inherit; cursor: pointer; transition: background-color 150ms, opacity 150ms }
  .demo button:hover { background: rgb(255 255 255 / 40%) }
  .demo [data-elapsed="0"]:not([data-since]) .reset { opacity: 0.4; pointer-events: none }
  .demo:has([value="clock"]:checked) .stopwatch, .demo:has([value="stopwatch"]:checked) .clock { display: none }
  .demo .toggle::before { content: 'start' }
  .demo [data-since] .toggle::before { content: 'pause' }
`;

// The handlers run from the functions and print from the strings: the compiler rewrites function bodies
const startClock = withCode(
  (element: HTMLDivElement | null) => {
    const time = element!.querySelector('time')!;
    const date = element!.querySelector('p')!;
    const stopwatch = element!.querySelector<HTMLElement>('.stopwatch')!;
    const city = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()!.replace(/_/g, ' ');
    const pad = (value: number) => String(Math.floor(value)).padStart(2, '0');
    let frame = 0;
    const tick = () => {
      let text = '';
      if (element!.querySelector<HTMLInputElement>('nav :checked')!.value === 'clock') {
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
  const date = element.querySelector('p');
  const stopwatch = element.querySelector('.stopwatch');
  const city = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace(/_/g, ' ');
  const pad = (value) => String(Math.floor(value)).padStart(2, '0');
  let frame = 0;
  const tick = () => {
    let text = '';
    if (element.querySelector('nav :checked').value === 'clock') {
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

export const html = (
  <div className="demo" ref={startClock}>
    <style>{htmlStyle}</style>
    <nav>
      <label>
        <input type="radio" name="water-mode" value="clock" defaultChecked />
        clock
      </label>
      <label>
        <input type="radio" name="water-mode" value="stopwatch" />
        stopwatch
      </label>
    </nav>
    <time>00:00:00</time>
    <section className="clock">
      <p>today</p>
    </section>
    <section className="stopwatch" data-elapsed="0">
      <button className="toggle" aria-label="Start or pause" onClick={toggleRunning} />
      <button className="reset" onClick={reset}>
        reset
      </button>
    </section>
  </div>
);

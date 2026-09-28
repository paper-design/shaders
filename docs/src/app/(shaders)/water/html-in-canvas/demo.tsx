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

const htmlStyle = `
  .demo { display: grid; place-content: center; justify-items: center; gap: 1.6cqw; height: 100%; container-type: inline-size; color: #fff; text-shadow: 0 0.04em 0.12em rgb(0 70 80 / 35%); position: relative }
  .demo time { font: 12.8cqw/1 'Paper Mono', ui-monospace, monospace; }
  .demo p { margin: 0; font: 2.4cqw ui-monospace, monospace; }
  .demo img { position: absolute; top: 5.5cqw; right: 5.5cqw; height: 2.8cqw; filter: brightness(0) invert(1) drop-shadow(0 0.15cqw 0.4cqw rgb(0 70 80 / 35%)) }
`;

// The clock runs from the function and prints from the string: the compiler rewrites function bodies
const startClock = withCode(
  (element: HTMLDivElement | null) => {
    const time = element!.querySelector('time')!;
    const date = element!.querySelector('p')!;
    const city = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()!.replace(/_/g, ' ');
    const tick = () => {
      const now = new Date();
      time.textContent = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      });
      date.textContent = `${now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })} · ${city}`;
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  },
  `(element) => {
  const time = element.querySelector('time');
  const date = element.querySelector('p');
  const city = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace(/_/g, ' ');
  const tick = () => {
    const now = new Date();
    time.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    date.textContent = \`\${now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })} · \${city}\`;
  };
  tick();
  const interval = setInterval(tick, 1000);
  return () => clearInterval(interval);
}`
);
export const html = (
  <div className="demo" ref={startClock}>
    <style>{htmlStyle}</style>
    <time>00:00:00</time>
    <p>today</p>
    <img src="/images/logos/paper.svg" alt="Paper" />
  </div>
);

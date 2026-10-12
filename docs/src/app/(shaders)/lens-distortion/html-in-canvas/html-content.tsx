import { withCode } from '@/helpers/jsx-to-code';

/** The HTML-in-canvas page spreads the dispersion over noisy, bulged glass, which keeps the HTML readable at the center */
export const htmlInCanvasOverrides = {
  spread: 0.15,
  angle: 28,
  perspective: 1,
  count: 50,
  dispersionColor: 0.75,
  focusCenter: 0.5,
  focusEdges: 0,
  swirl: 0,
  noise: 0,
  lensBulge: 0.1,
};

// Each viewfinder slider is a native range input that sets its CSS variable on the demo:
// --ev is exposure in stops, --zoom scales the scene and --wb is white balance in kelvin.
// The color slider drives the shader's dispersionColor instead, so the HTML controls the lens that distorts it.
// The header and the dials share one centered, capped width. The dials sit in two columns and stack into one
// when two don't fit, and labels and readouts have fixed widths, so the sliders line up.
export const htmlContentCss = `
.demo { --ev: 0; --zoom: 1; --wb: 5600; --warmth: calc((var(--wb) - 5600) / 2400); position: relative; width: 100%; height: 100%; overflow: hidden; color: #f4f3ec; background: #121212; font: 22px ui-monospace, monospace; text-transform: uppercase; user-select: none; text-shadow: 0 1px 4px rgb(0 0 0 / 50%) }
.demo .scene { position: absolute; inset: 0; background: url(/images/image-filters/003.webp) center / cover; scale: var(--zoom); filter: brightness(pow(2, var(--ev))); transition: scale 200ms ease-out, filter 200ms }
.demo .tint { position: absolute; inset: 0; background: color-mix(in oklab, #3d7bff, #ff9a3d calc((var(--warmth) + 1) * 50%)); mix-blend-mode: soft-light; opacity: calc(max(var(--warmth), -1 * var(--warmth)) * 0.8); transition: opacity 200ms }
.demo .shade { position: absolute; inset: 0; background: linear-gradient(rgb(0 0 0 / 55%), transparent 25% 55%, rgb(0 0 0 / 75%)) }
.demo header, .demo footer { position: absolute; inset-inline: 24px; max-width: 880px; margin-inline: auto }
.demo header { top: 40px; display: flex; justify-content: space-between; align-items: center }
.demo footer { bottom: 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(380px, 100%), 1fr)); gap: 16px }
.demo header time { padding-left: 22px }
.demo .rec { padding: 14px 22px; border: 2px solid rgb(255 255 255 / 30%); border-radius: 14px; background: rgb(0 0 0 / 45%); font: inherit; text-transform: inherit; color: inherit; cursor: pointer; transition: background-color 150ms }
.demo .rec:hover { background: rgb(255 255 255 / 14%) }
.demo .rec:active { background: rgb(255 255 255 / 24%) }
.demo .rec::before { content: ''; display: inline-block; width: 15px; height: 15px; margin-right: 10px; border-radius: 50%; background: #ff3b30; animation: blink 1s infinite }
.demo[data-recording="off"] .rec::before { background: transparent; box-shadow: inset 0 0 0 2px currentColor; animation: none }
.demo .dial { display: grid; grid-template-columns: 5ch 1fr 5ch; align-items: center; gap: 16px; padding: 12px 22px }
.demo .dial span { opacity: 0.75 }
.demo .dial output { text-align: right }
.demo input { appearance: none; min-width: 0; height: 44px; margin: 0; background: linear-gradient(transparent calc(50% - 1.5px), rgb(255 255 255 / 55%) 0 calc(50% + 1.5px), transparent 0); outline: none; cursor: pointer }
.demo input::-webkit-slider-thumb { appearance: none; width: 14px; height: 36px; border-radius: 7px; background: #f4f3ec; box-shadow: 0 1px 6px rgb(0 0 0 / 50%); transition: background-color 150ms }
.demo input:focus-visible::-webkit-slider-thumb { background: #ffd84d }
@keyframes blink { 50% { opacity: 0.15 } }
`;

// The handlers run from the functions and print from the strings: the compiler rewrites function bodies
const startTimecode = withCode(
  (element: HTMLDivElement | null) => {
    const timecode = element!.querySelector('time')!;
    let frames = 0;
    const interval = setInterval(() => {
      if (element!.dataset.recording === 'off') return;
      frames += 1;
      const parts = [frames / 86400, (frames / 1440) % 60, (frames / 24) % 60, frames % 24];
      timecode.textContent = parts.map((part) => String(Math.floor(part)).padStart(2, '0')).join(':');
    }, 1000 / 24);
    return () => clearInterval(interval);
  },
  `(element) => {
  const timecode = element.querySelector('time');
  let frames = 0;
  const interval = setInterval(() => {
    if (element.dataset.recording === 'off') return;
    frames += 1;
    const parts = [frames / 86400, (frames / 1440) % 60, (frames / 24) % 60, frames % 24];
    timecode.textContent = parts.map((part) => String(Math.floor(part)).padStart(2, '0')).join(':');
  }, 1000 / 24);
  return () => clearInterval(interval);
}`
);
const toggleRecording = withCode(
  (event: { currentTarget: HTMLButtonElement }) => {
    const demo = event.currentTarget.closest<HTMLElement>('.demo')!;
    demo.dataset.recording = demo.dataset.recording === 'off' ? 'on' : 'off';
  },
  `(event) => {
  const demo = event.currentTarget.closest('.demo');
  demo.dataset.recording = demo.dataset.recording === 'off' ? 'on' : 'off';
}`
);
// One handler on the footer serves every dial; the color slider has no CSS property and is left to its own handler
const updateDial = withCode(
  (event: { target: EventTarget }) => {
    const input = event.target as HTMLInputElement;
    if (!input.dataset.property) return;
    input.closest<HTMLElement>('.demo')!.style.setProperty(input.dataset.property, input.value);
    const value = input.valueAsNumber.toFixed(Number(input.dataset.digits ?? 1));
    input.parentElement!.querySelector('output')!.textContent = input.dataset.format!.replace('%', value);
  },
  `(event) => {
  const input = event.target;
  if (!input.dataset.property) return;
  input.closest('.demo').style.setProperty(input.dataset.property, input.value);
  const value = input.valueAsNumber.toFixed(Number(input.dataset.digits ?? 1));
  input.parentElement.querySelector('output').textContent = input.dataset.format.replace('%', value);
}`
);

const dials = [
  { label: 'ev', property: '--ev', min: -2, max: 2, step: 0.1, value: 0, format: '%' },
  { label: 'zoom', property: '--zoom', min: 1, max: 3, step: 0.1, value: 1, format: '%×' },
  { label: 'wb', property: '--wb', min: 3200, max: 8000, step: 100, value: 5600, format: '%K', digits: 0 },
];

/** The color slider sets the shader's dispersionColor, so the HTML also controls the lens it's seen through */
export const getHtmlContent = (dispersionColor: number, setDispersionColor: (value: number) => void) => {
  const updateDispersionColor = withCode(
    (event: { currentTarget: HTMLInputElement }) => setDispersionColor(event.currentTarget.valueAsNumber),
    `(event) => setDispersionColor(event.currentTarget.valueAsNumber)`
  );

  return (
    <div className="demo" data-recording="on" ref={startTimecode}>
      <div className="scene" />
      <div className="tint" />
      <div className="shade" />
      <header>
        <time>00:00:00:00</time>
        <button className="rec" onClick={toggleRecording}>
          rec
        </button>
      </header>
      <footer onInput={updateDial}>
        {dials.map(({ label, property, min, max, step, value, format, digits }) => (
          <label className="dial" key={label}>
            <span>{label}</span>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              defaultValue={value}
              data-property={property}
              data-format={format}
              {...(digits !== undefined && { 'data-digits': digits })}
            />
            <output>{format.replace('%', value.toFixed(digits ?? 1))}</output>
          </label>
        ))}
        <label className="dial">
          <span>color</span>
          <input type="range" min={0} max={1} step={0.01} value={dispersionColor} onChange={updateDispersionColor} />
          <output>{dispersionColor.toFixed(2)}</output>
        </label>
      </footer>
    </div>
  );
};

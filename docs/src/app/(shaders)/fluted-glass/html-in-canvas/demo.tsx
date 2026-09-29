import { type ChangeEvent, type SyntheticEvent } from 'react';
import { type FlutedGlassParams, GlassDistortionShapes } from '@paper-design/shaders';
import { withCode } from '@/helpers/jsx-to-code';

/** The HTML-in-canvas page uses wider flutes and a softer cascade, so the HTML stays legible through the glass */
export const htmlInCanvasParams = {
  colorShadow: '#92aae3',
  shadows: 0.4,
  highlights: 0,
  size: 0.85,
  distortionShape: 'prism' as const,
  distortion: 0.15,
  blur: 0,
  edges: 0,
  marginLeft: 0,
  marginRight: 0.1,
  marginTop: 0.1,
  marginBottom: 0.5,
};

// Every repaint of the HTML is captured again for the shader, so the hint stops bouncing once the page is scrolled
export const css = `
.demo { position: relative; height: 100%; color: #fff; overflow: hidden; timeline-scope: --demo-scroll }
.demo .bg { position: absolute; inset: 0; height: 300%; background: url(/images/html-in-canvas/succulents.jpg) center top / cover; filter: brightness(0.7); animation: bg-pan linear both; animation-timeline: --demo-scroll; animation-range: 0px 4000px }
.demo ::selection { background: #ffd60a; color: #1a1a1a }
.demo .scroller { height: 100%; overflow-y: auto; scrollbar-width: none; scroll-timeline: --demo-scroll; position: relative; container-type: scroll-state }
.demo .scroller::after { content: ""; display: block; height: 60% }
.demo article { max-width: 1400px; padding: 180px 8% 0; font-family: system-ui; text-transform: uppercase }
.demo h1 { margin: 0; opacity: 0.8; font-size: 180px; line-height: 0.85; letter-spacing: -0.03em }
.demo p { max-width: 80%; margin: 4% 0; font-size: 44px }
.demo .shapes { display: flex; flex-wrap: wrap; gap: 12px; margin: -2% 0 8% }
.demo .shapes button { padding: 0.35em 0.9em; border: 2px solid rgb(255 255 255 / 50%); border-radius: 999px; background: none; color: inherit; font: inherit; font-size: 30px; text-transform: inherit; cursor: pointer }
.demo .shapes button:hover { border-color: #fff }
.demo .shapes button[aria-pressed="true"] { border-color: #ffd60a; background: #ffd60a; color: #1a1a1a }
.demo .dials { display: grid; grid-template-columns: auto 1fr 4ch; align-items: center; gap: 20px 32px; max-width: 80%; margin: -1% 0 8%; font-size: 30px }
.demo .dials label { display: contents }
.demo .dials output { text-align: right; font-variant-numeric: tabular-nums }
.demo input[type="range"] { appearance: none; min-width: 0; height: 36px; margin: 0; background: linear-gradient(transparent calc(50% - 1px), rgb(255 255 255 / 50%) 0 calc(50% + 1px), transparent 0); cursor: pointer }
.demo input[type="range"]::-webkit-slider-thumb { appearance: none; width: 28px; height: 28px; border-radius: 50%; background: #ffd60a }
.demo input[type="range"]:hover::-webkit-slider-thumb { scale: 1.15 }
.demo kbd { padding: 0.05em 0.35em; border: 2px solid rgb(255 255 255 / 60%); border-bottom-width: 4px; border-radius: 0.25em; font: inherit; font-size: 0.85em }
.demo .hint { position: fixed; bottom: 15px; right: 20px; display: flex; align-items: center; font-size: 22px; animation: hint-fade linear both; animation-timeline: --demo-scroll; animation-range: 0 16px }
.demo .hint span { display: inline-block; padding-left: 0.5em; animation: hint-bounce 1.2s ease-in-out infinite }
@keyframes bg-pan { to { transform: translateY(-2000px) } }
@keyframes hint-fade { to { opacity: 0 } }
@container scroll-state(scrollable: top) { .demo .hint span { animation: none } }
@keyframes hint-bounce { 50% { transform: translateY(8px) } }
`;

const dials = [
  { name: 'size', min: 0, max: 1, step: 0.01 },
  { name: 'distortion', min: 0, max: 1, step: 0.01 },
  { name: 'shift', min: -1, max: 1, step: 0.01 },
] as const;

type GlassControls = Required<Pick<FlutedGlassParams, 'distortionShape' | (typeof dials)[number]['name']>>;

/** The buttons and sliders in the text drive the shader's params, so the HTML both shows the effect and controls it */
export const getHtml = (params: GlassControls, setParam: (name: string, value: string | number) => void) => {
  // The handlers run from the functions and print from the strings: the compiler rewrites function bodies
  const selectShape = withCode(
    (event: SyntheticEvent<HTMLButtonElement>) => setParam(event.currentTarget.name, event.currentTarget.value),
    `(event) => setParam(event.currentTarget.name, event.currentTarget.value)`
  );
  const updateDial = withCode(
    (event: ChangeEvent<HTMLInputElement>) => setParam(event.currentTarget.name, event.currentTarget.valueAsNumber),
    `(event) => setParam(event.currentTarget.name, event.currentTarget.valueAsNumber)`
  );

  return (
    <div className="demo">
      <div className="bg" />
      <div className="scroller">
        <article>
          <h1>Fluted glass</h1>
          <span className="hint">
            scroll down <span>↓</span>
          </span>
          <p>Live HTML, bent by a shader.</p>
          <p>Pick a flute shape:</p>
          <div className="shapes">
            {Object.keys(GlassDistortionShapes).map((shape) => (
              <button
                key={shape}
                name="distortionShape"
                value={shape}
                aria-pressed={shape === params.distortionShape}
                onClick={selectShape}
              >
                {shape}
              </button>
            ))}
          </div>
          <p>Tune the glass:</p>
          <div className="dials">
            {dials.map(({ name, min, max, step }) => (
              <label key={name}>
                {name}
                <input
                  type="range"
                  name={name}
                  min={min}
                  max={max}
                  step={step}
                  value={params[name]}
                  onChange={updateDial}
                />
                <output>{params[name].toFixed(2)}</output>
              </label>
            ))}
          </div>
          <p>
            Still real text: <kbd>⌘+F</kbd> finds it, dragging selects it.
          </p>
        </article>
      </div>
    </div>
  );
};

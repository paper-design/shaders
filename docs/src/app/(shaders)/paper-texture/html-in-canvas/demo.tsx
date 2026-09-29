import { withCode } from '@/helpers/jsx-to-code';

/** The HTML-in-canvas page keeps the paper white and the texture pronounced, so the HTML stays readable through it */
export const htmlInCanvasParams = {
  colorBack: '#8b8fa7',
  clip: true,
  colorPaper: '#ffffff',
  colorShadow: '#c2c2c2',
  distortion: 0.25,
  angle: 0,
  roughness: 0.2,
  roughnessRows: 0,
  fiber: 0.4,
  fiberSize: 0.72,
  folds: 0.5,
  crumples: 0,
  wrinkles: 1,
  wrinkleSize: 0.83,
  drops: 0.15,
  seed: 311,
};

const htmlStyle = `
  .demo { --ink: #222; --error: #d93025; --ease: cubic-bezier(0.685, 0.89, 0.315, 0.995); display: grid; place-items: center; height: 100%; color: var(--ink) }
  .demo form { display: grid; gap: 12px; width: 360px; padding: 48px; background: #fff; font: 16px 'Paper Mono', ui-monospace, monospace }
  .demo h2 { margin: 0 0 12px; font: 400 28px/1.2 Matter, system-ui; font-feature-settings: "ss01" }
  .demo .field { display: grid; gap: 6px }
  .demo input[type="text"], .demo input[type="email"] { height: 44px; padding: 0 14px; border: 1px solid var(--ink); border-radius: 2px; font: inherit; color: inherit; background: #fff; outline: none; transition: border-color 150ms var(--ease), box-shadow 150ms var(--ease) }
  .demo input::placeholder { color: rgb(34 34 34 / 40%) }
  .demo ::selection { background: rgb(34 34 34 / 14%); color: var(--ink) }
  .demo input:focus-visible { box-shadow: 0 0 0 3px rgb(34 34 34 / 12%) }
  .demo .error { display: none; font-size: 13px; color: var(--error) }
  .demo input:user-invalid, .demo form.submitted input:invalid { border-color: var(--error); box-shadow: 0 0 0 3px rgb(217 48 37 / 12%) }
  .demo input:user-invalid + .error, .demo form.submitted input:invalid + .error { display: block; animation: error-in 200ms var(--ease) }
  .demo label { display: flex; align-items: center; gap: 10px }
  .demo input[type="checkbox"] { appearance: none; width: 18px; height: 18px; margin: 0; border: 1px solid var(--ink); border-radius: 2px; background: #fff }
  .demo input[type="checkbox"]:checked { background: var(--ink); box-shadow: inset 0 0 0 3px #fff }
  .demo button { height: 44px; margin-top: 4px; border: 1px solid var(--ink); border-radius: 2px; font: inherit; color: inherit; background: #fff; transition: background-color 150ms var(--ease), color 150ms var(--ease), border-color 150ms var(--ease) }
  .demo button:hover { background: var(--ink); color: #fff }
  .demo button:active { background: #000 }
  .demo form:invalid button { border-color: rgb(34 34 34 / 20%); color: rgb(34 34 34 / 40%); pointer-events: none }
  .demo .sent { display: none; margin: 0; font-size: 13px; text-align: center }
  .demo form.done .sent { display: block; animation: error-in 200ms var(--ease) }
  @keyframes error-in { from { opacity: 0; transform: translateY(-4px) } }
`;

// The handler runs from the function and prints from the string: the compiler rewrites function bodies
const handleSubmit = withCode(
  (event: { preventDefault: () => void; currentTarget: HTMLFormElement }) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.classList.add('submitted');
      form.querySelector<HTMLInputElement>(':invalid')?.focus();
      return;
    }
    form.reset();
    form.classList.remove('submitted');
    form.classList.add('done');
    setTimeout(() => form.classList.remove('done'), 3000);
  },
  `(event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.classList.add('submitted');
    form.querySelector(':invalid')?.focus();
    return;
  }
  form.reset();
  form.classList.remove('submitted');
  form.classList.add('done');
  setTimeout(() => form.classList.remove('done'), 3000);
}`
);
/** Every symbol typed into the form reshuffles the paper's seed, so the sheet crumples anew under the text */
export const getHtml = (setSeed: (seed: number) => void) => {
  // The handler runs from the function and prints from the string: the compiler rewrites function bodies
  const reshuffleSeed = withCode(
    () => setSeed(Math.floor(Math.random() * 1000)),
    `() => setSeed(Math.floor(Math.random() * 1000))`
  );

  return (
    <div className="demo">
      <style>{htmlStyle}</style>
      <form noValidate onSubmit={handleSubmit} onInput={reshuffleSeed}>
        <h2>Stay in touch</h2>
        <div className="field">
          <input type="text" name="name" placeholder="name" autoComplete="off" required />
          <span className="error">Please enter your name</span>
        </div>
        <div className="field">
          <input
            type="email"
            name="email"
            placeholder="email"
            autoComplete="off"
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
            required
          />
          <span className="error">Please enter a valid email</span>
        </div>
        <label>
          <input type="checkbox" name="subscribe" required />
          subscribe to updates
        </label>
        <button type="submit">send</button>
        <p className="sent">Thanks, you&apos;re on the list</p>
      </form>
    </div>
  );
};

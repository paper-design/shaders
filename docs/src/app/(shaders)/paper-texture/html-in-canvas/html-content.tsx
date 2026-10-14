import { withCode } from '@/helpers/jsx-to-code';

/** The HTML-in-canvas page keeps the paper white and the texture pronounced, so the HTML stays readable through it */
export const htmlInCanvasOverrides = {
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
  wrinkleSize: 0.5,
  drops: 0.15,
  seed: 311,
};

// The form is the whole demo and hugs its fields, so its size comes from them.
// The message grows with its text (field-sizing), so the form grows and shrinks with it
export const htmlContentCss = `
.signup { display: grid; gap: 12px; width: fit-content; padding: 48px; background: #fff; color: #222; font: 16px ui-monospace, monospace }
.signup h2 { margin: 0 0 12px; font: 400 28px/1.2 system-ui }
.signup .field { display: grid; gap: 6px }
.signup .field input, .signup textarea { width: 264px; height: 44px; padding: 0 14px; border: 1px solid; border-radius: 2px; font: inherit; color: inherit; background: #fff; outline: none; transition: 150ms }
.signup ::placeholder { color: rgb(34 34 34 / 40%) }
.signup ::selection { background: rgb(34 34 34 / 14%); color: #222 }
.signup :is(input, textarea):focus-visible { box-shadow: 0 0 0 3px rgb(34 34 34 / 12%) }
.signup .error { display: none; font-size: 13px; color: #d93025 }
.signup textarea { height: auto; padding: 11px 14px; resize: none; field-sizing: content }
.signup input:user-invalid, .signup.submitted input:invalid { border-color: #d93025; box-shadow: 0 0 0 3px rgb(217 48 37 / 12%) }
.signup input:user-invalid + .error, .signup.submitted input:invalid + .error { display: block; animation: fade-in 200ms }
.signup label { display: flex; align-items: center; gap: 10px }
.signup input[type="checkbox"] { appearance: none; width: 18px; height: 18px; margin: 0; border: 1px solid #222; border-radius: 2px; background: #fff }
.signup input[type="checkbox"]:checked { background: #222; box-shadow: inset 0 0 0 3px #fff }
.signup button { height: 44px; margin-top: 4px; border: 1px solid #222; border-radius: 2px; font: inherit; color: inherit; background: #fff; transition: 150ms }
.signup button:hover { background: #222; color: #fff }
.signup button:active { background: #000 }
.signup:invalid button { border-color: rgb(34 34 34 / 20%); color: rgb(34 34 34 / 40%); pointer-events: none }
.signup .sent { display: none; font-size: 13px; text-align: center }
.signup.done .sent { display: block; animation: fade-in 200ms }
@keyframes fade-in { from { opacity: 0; translate: 0 -4px } }
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
export const getHtmlContent = (setSeed: (seed: number) => void) => {
  // The handler runs from the function and prints from the string: the compiler rewrites function bodies
  const reshuffleSeed = withCode(
    () => setSeed(Math.floor(Math.random() * 1000)),
    `() => setSeed(Math.floor(Math.random() * 1000))`
  );

  return (
    <form className="signup" noValidate onSubmit={handleSubmit} onInput={reshuffleSeed}>
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
      <textarea name="message" placeholder="message" />
      <label>
        <input type="checkbox" name="subscribe" required />
        subscribe to updates
      </label>
      <button type="submit">send</button>
      <span className="sent">Thanks, you&apos;re on the list</span>
    </form>
  );
};

import { FALLBACK_COLOR, getCssColorSource, type Rgba } from './css-color-source.js';
import { getShaderColorFromString } from './get-shader-color-from-string.js';

const reportedColors = new Set<string>();

export function getCssVariableNames(css: string): string[] {
  const names = [...css.matchAll(/var\(\s*(--[^\s,)]+)/g)].map((match) => match[1]!);
  return [...new Set(names)];
}

/**
 * Reports when CSS variables change, including ones registered with `inherits: false`.
 * The browser has no event for that, but it does fire one when a transition starts,
 * and a child element can transition on a variable that it inherits from its parent.
 *
 * While a parent animates a variable, Firefox only fires that event at the start,
 * so we also follow any animation on the parent or its ancestors frame by frame until it ends.
 */
export class CssVariableObserver {
  private names: string[] = [];
  private lastValues = '';
  private rafId: number | null = null;
  private doc: Document;

  constructor(
    private element: HTMLElement,
    private parentElement: HTMLElement,
    private onChange: () => void
  ) {
    this.doc = parentElement.ownerDocument;
    this.element.addEventListener('transitionrun', this.handleTransitionRun);
    this.doc.addEventListener('transitionrun', this.handleDocumentAnimation, true);
    this.doc.addEventListener('animationstart', this.handleDocumentAnimation, true);
  }

  get isEmpty(): boolean {
    return this.names.length === 0;
  }

  observe(names: string[]): void {
    if (names.join() === this.names.join()) return;

    for (const name of this.names) {
      this.element.style.removeProperty(name);
    }

    for (const name of names) {
      this.element.style.setProperty(name, 'inherit');
    }

    this.element.style.transition = names.map((name) => `${name} 1ms allow-discrete`).join(',');
    this.names = names;
    this.lastValues = this.readValues();

    // An animation may already be running, in which case we won't get an event for its start
    this.follow();
  }

  dispose(): void {
    this.doc.removeEventListener('transitionrun', this.handleDocumentAnimation, true);
    this.doc.removeEventListener('animationstart', this.handleDocumentAnimation, true);

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private handleTransitionRun = (event: Event): void => {
    // Keep our internal transitions from reaching the app's event listeners
    event.stopPropagation();
    this.follow();
  };

  private handleDocumentAnimation = (event: Event): void => {
    if (this.isEmpty) return;

    if ((event.target as Node | null)?.contains?.(this.parentElement)) {
      this.follow();
    }
  };

  private follow = (): void => {
    this.notifyIfChanged();

    if (this.rafId === null && this.isParentAnimating()) {
      this.rafId = requestAnimationFrame(this.followNextFrame);
    }
  };

  private followNextFrame = (): void => {
    this.rafId = null;

    // Checked before reading, so that the final value of an animation always gets read
    const isAnimating = this.isParentAnimating();
    this.notifyIfChanged();

    if (isAnimating) {
      this.rafId = requestAnimationFrame(this.followNextFrame);
    }
  };

  private notifyIfChanged(): void {
    const values = this.readValues();

    if (values !== this.lastValues) {
      this.lastValues = values;
      this.onChange();
    }
  }

  private readValues(): string {
    const style = this.doc.defaultView?.getComputedStyle(this.parentElement);
    return this.names.map((name) => style?.getPropertyValue(name)).join('|');
  }

  private isParentAnimating(): boolean {
    if (this.isEmpty) return false;

    return this.doc.getAnimations().some((animation) => {
      const target = (animation.effect as KeyframeEffect | null)?.target;
      return animation.playState === 'running' && Boolean(target?.contains(this.parentElement));
    });
  }
}

/** Reads the current value of a CSS color, with any variables as seen by the element */
export function resolveCssColor(css: string, element: HTMLElement): Rgba {
  const view = element.ownerDocument.defaultView;
  if (!view) return [0, 0, 0, 0];

  const style = view.getComputedStyle(element);
  const color = substituteCssVariables(css, (name) => style.getPropertyValue(name).trim());

  // Same as CSS: an undefined variable means no color
  if (color === null) return [0, 0, 0, 0];

  if (!view.CSS.supports('color', color)) {
    // Colors are read again on every update, so only report each one once
    if (!reportedColors.has(color)) {
      reportedColors.add(color);
      console.error('Unsupported color format', color);
    }

    return [...FALLBACK_COLOR];
  }

  // Variables often hold a simple color, which doesn't need a canvas
  const parsed = getShaderColorFromString(color);
  if (getCssColorSource(parsed) === undefined) return parsed;

  return cssColorToRgba(color, element.ownerDocument);
}

/** Replaces each `var(--name, fallback)`, or returns null if a variable has no value and no fallback */
export function substituteCssVariables(css: string, getValue: (name: string) => string): string | null {
  let result = css;
  let start = result.indexOf('var(');

  while (start !== -1) {
    const end = findClosingParen(result, start + 'var'.length);
    if (end === -1) return null;

    const contents = result.slice(start + 'var('.length, end);
    const commaIndex = contents.indexOf(',');
    const name = commaIndex === -1 ? contents.trim() : contents.slice(0, commaIndex).trim();
    const fallback = commaIndex === -1 ? '' : contents.slice(commaIndex + 1).trim();

    const value = getValue(name) || fallback;
    if (!value) return null;

    // Fallbacks may contain more variables, so we scan from the same position again
    result = result.slice(0, start) + value + result.slice(end + 1);
    start = result.indexOf('var(', start);
  }

  return result;
}

function findClosingParen(text: string, openIndex: number): number {
  let depth = 0;

  for (let i = openIndex; i < text.length; i++) {
    if (text[i] === '(') depth++;
    if (text[i] === ')') depth--;
    if (depth === 0) return i;
  }

  return -1;
}

const contexts = new WeakMap<Document, CanvasRenderingContext2D | null>();

/** Colors can be in any CSS format (`oklch(…)`, `color-mix(…)`, `red`), so we let a canvas convert them */
function cssColorToRgba(css: string, doc: Document): Rgba {
  if (!contexts.has(doc)) {
    const canvas = doc.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    contexts.set(doc, canvas.getContext('2d', { willReadFrequently: true }));
  }

  const context = contexts.get(doc);
  if (!context) return [0, 0, 0, 0];

  const paint = () => {
    context.clearRect(0, 0, 1, 1);
    context.fillRect(0, 0, 1, 1);
    return context.getImageData(0, 0, 1, 1).data;
  };

  // Invalid colors are ignored by the canvas, which then keeps the previous fill style
  context.fillStyle = '#0000';
  context.fillStyle = css;
  const a = paint()[3]!;

  // Canvas pixels are premultiplied, which loses precision on translucent colors, so read the channels when opaque.
  // Browsers without relative colors ignore this fill style and keep the previous one, which is close enough.
  context.fillStyle = `rgb(from ${css} r g b / 1)`;
  const [r, g, b] = paint();

  return [r! / 255, g! / 255, b! / 255, a / 255];
}

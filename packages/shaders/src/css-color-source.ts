export type Rgba = [number, number, number, number];

export const FALLBACK_COLOR: Rgba = [0.5, 0.5, 0.5, 1];

const cssColorSources = new WeakMap<object, string>();

/**
 * A CSS color that only the browser can resolve, like `var(--brand)` or `oklch(…)`.
 * ShaderMount replaces it with the actual color. Stays gray until then, e.g. during SSR.
 */
export function createCssColorUniform(css: string): Rgba {
  const uniform: Rgba = [...FALLBACK_COLOR];
  cssColorSources.set(uniform, css);
  return uniform;
}

export function getCssColorSource(value: unknown): string | undefined {
  return Array.isArray(value) ? cssColorSources.get(value) : undefined;
}

import { expect, test, describe } from 'bun:test';
import { getCssColorSource } from './css-color-source.js';
import { getCssVariableNames, substituteCssVariables } from './css-color-uniform.js';
import { getShaderColorFromString } from './get-shader-color-from-string.js';

describe('colors resolved by the browser', () => {
  test('are gray until a mount resolves them', () => {
    expect(getShaderColorFromString('var(--brand)')).toEqual([0.5, 0.5, 0.5, 1]);
  });

  test.each(['oklch(70% 0.2 150)', 'color-mix(red 10%, transparent)', 'red', 'rgb(255 0 0)', 'hsl(0.5 100% 50%)'])(
    '%s keeps its source for the mount',
    (color) => {
      expect(getCssColorSource(getShaderColorFromString(color))).toBe(color);
    }
  );

  test('keep their source for the mount, including when mapped over an array', () => {
    const [first, second] = ['var(--brand)', 'color-mix(var(--brand) 10%, transparent)'].map(getShaderColorFromString);

    expect(getCssColorSource(first)).toBe('var(--brand)');
    expect(getCssColorSource(second)).toBe('color-mix(var(--brand) 10%, transparent)');
  });

  test('literal colors have no source', () => {
    expect(getCssColorSource(getShaderColorFromString('#ff0000'))).toBeUndefined();
  });

});

describe('getCssVariableNames', () => {
  test('finds each name once, including inside fallbacks and with spacing', () => {
    const names = getCssVariableNames('color-mix(var( --a ) var(--b-2, var(--c)), var(--a))');

    expect(names).toEqual(['--a', '--b-2', '--c']);
  });
});

describe('substituteCssVariables', () => {
  const values: Record<string, string> = { '--red': '#f00', '--muted': '10%' };
  const substitute = (css: string) => substituteCssVariables(css, (name) => values[name] ?? '');

  test('replaces variables embedded in a color function', () => {
    expect(substitute('color-mix(var(--red) var( --muted ), transparent)')).toBe('color-mix(#f00 10%, transparent)');
  });

  test('uses a fallback containing commas when the variable has no value', () => {
    expect(substitute('var(--nope, rgb(0, 255, 0))')).toBe('rgb(0, 255, 0)');
  });

  test('follows variables inside fallbacks', () => {
    expect(substitute('var(--nope, var(--red))')).toBe('#f00');
  });

  test('ignores the fallback when the variable has a value', () => {
    expect(substitute('var(--red, #00f)')).toBe('#f00');
  });

  test('returns null for a variable without a value or fallback', () => {
    expect(substitute('var(--nope)')).toBeNull();
  });

  test('returns null for unbalanced parentheses', () => {
    expect(substitute('var(--red')).toBeNull();
  });
});

describe('getShaderColorFromString', () => {
  // Test array inputs
  test('handles 3-number array input', () => {
    expect(getShaderColorFromString([0.5, 0.2, 0.7])).toEqual([0.5, 0.2, 0.7, 1]);
  });

  test('handles 4-number array input', () => {
    expect(getShaderColorFromString([0.5, 0.2, 0.7, 0.8])).toEqual([0.5, 0.2, 0.7, 0.8]);
  });

  // Test hex inputs
  test('handles 3-digit hex', () => {
    expect(getShaderColorFromString('#f00')).toEqual([1, 0, 0, 1]);
  });

  test('handles 6-digit hex', () => {
    expect(getShaderColorFromString('#ff0000')).toEqual([1, 0, 0, 1]);
  });

  test('handles 8-digit hex with alpha', () => {
    expect(getShaderColorFromString('#ff0000cc')).toEqual([1, 0, 0, 0.8]);
  });

  // Test RGB inputs
  test('handles rgb() format', () => {
    expect(getShaderColorFromString('rgb(255, 0, 0)')).toEqual([1, 0, 0, 1]);
  });

  test('handles rgba() format', () => {
    expect(getShaderColorFromString('rgba(255, 0, 0, 0.5)')).toEqual([1, 0, 0, 0.5]);
  });

  test('handles spaces in rgb format', () => {
    expect(getShaderColorFromString('rgb( 255 , 0 , 0 )')).toEqual([1, 0, 0, 1]);
  });

  // Test HSL inputs
  test('handles hsl() format', () => {
    expect(getShaderColorFromString('hsl(0, 100%, 50%)')).toEqual([1, 0, 0, 1]);
  });

  test('handles hsla() format', () => {
    expect(getShaderColorFromString('hsla(0, 100%, 50%, 0.5)')).toEqual([1, 0, 0, 0.5]);
  });

  // Test edge cases
  test('handles undefined input', () => {
    expect(getShaderColorFromString(undefined)).toEqual([0.5, 0.5, 0.5, 1]);
  });

  test('handles invalid color string', () => {
    expect(getShaderColorFromString('not-a-color')).toEqual([0.5, 0.5, 0.5, 1]);
  });

  test('handles 4-digit hex with alpha', () => {
    expect(getShaderColorFromString('#ff0c')).toEqual([1, 1, 0, 0.8]);
  });

  test('returns fallback for hex with invalid characters', () => {
    expect(getShaderColorFromString('#gggggg')).toEqual([0.5, 0.5, 0.5, 1]);
  });

  test('returns fallback for hex with invalid length', () => {
    expect(getShaderColorFromString('#12345')).toEqual([0.5, 0.5, 0.5, 1]);
    expect(getShaderColorFromString('#ff')).toEqual([0.5, 0.5, 0.5, 1]);
  });

  test('returns fallback for malformed rgb/hsl', () => {
    expect(getShaderColorFromString('rgb(nope)')).toEqual([0.5, 0.5, 0.5, 1]);
    expect(getShaderColorFromString('hsl(nope)')).toEqual([0.5, 0.5, 0.5, 1]);
  });

  // Test color value ranges
  test('normalizes RGB values to 0-1 range', () => {
    expect(getShaderColorFromString('rgb(127, 127, 127)')).toEqual([
      0.4980392156862745, 0.4980392156862745, 0.4980392156862745, 1,
    ]);
  });

  test('clamps alpha values to 0-1 range', () => {
    expect(getShaderColorFromString('rgba(273, 800, 8000, 1.5)')).toEqual([1, 1, 1, 1]);
    // Note negative values aren't valid and we just let them be undefined behavior
  });
});

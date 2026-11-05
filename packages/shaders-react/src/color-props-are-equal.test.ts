import { describe, expect, test } from 'bun:test';
import { colorPropsAreEqual } from './color-props-are-equal.js';

describe('colorPropsAreEqual', () => {
  test('literal colors with the same values are equal', () => {
    const result = colorPropsAreEqual({ colors: ['#f00'], colorBack: '#000' }, { colors: ['#f00'], colorBack: '#000' });

    expect(result).toBe(true);
  });

  test('colors array using a CSS variable is never equal', () => {
    const result = colorPropsAreEqual({ colors: ['var(--a)'] }, { colors: ['var(--a)'] });

    expect(result).toBe(false);
  });

  test('single color using a CSS variable is never equal', () => {
    const result = colorPropsAreEqual({ colorBack: 'var(--a)' }, { colorBack: 'var(--a)' });

    expect(result).toBe(false);
  });
});

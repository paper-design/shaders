import { expect, test, describe } from 'bun:test';
import { getShaderColorFromString } from './get-shader-color-from-string.js';

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
    expect(getShaderColorFromString(undefined)).toEqual([0, 0, 0, 1]);
  });

  test('handles invalid color string', () => {
    expect(getShaderColorFromString('not-a-color')).toEqual([0, 0, 0, 1]);
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

import { describe, expect, test } from 'bun:test';
import { propertyCapacity } from './catalog.js';

describe('propertyCapacity', () => {
  test('resolves a plural property from singular count metadata', () => {
    expect(propertyCapacity('colors', { maxColorCount: 10 })).toBe(10);
  });

  test('preserves direct metadata matches', () => {
    expect(propertyCapacity('spots', { maxSpots: 4 })).toBe(4);
  });
});

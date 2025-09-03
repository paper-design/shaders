import { describe, test, expect } from 'bun:test';
import { serializeParams, deserializeParams } from './url-serializer';
import type { ParamDef } from '../shader-defs/shader-def-types';

describe('URL Serializer', () => {
  test('handles basic types roundtrip', () => {
    const params = {
      enabled: true,
      disabled: false,
      number: 0.24,
      text: 'solid',
      array: ['red', 'green'],
      numbers: [1, 2.5, -3],
    };

    const paramDefs: ParamDef[] = [
      { name: 'enabled', type: 'boolean', defaultValue: false, description: 'Enabled' },
      { name: 'disabled', type: 'boolean', defaultValue: true, description: 'Disabled' },
      { name: 'number', type: 'number', defaultValue: 0, description: 'Number' },
      { name: 'text', type: 'string', defaultValue: '', description: 'Text' },
      { name: 'array', type: 'string[]', defaultValue: [], description: 'Array' },
      { name: 'numbers', type: 'number[]', defaultValue: [], description: 'Numbers' },
    ];

    const serialized = serializeParams(params, paramDefs);
    const deserialized = deserializeParams(serialized, paramDefs);
    expect(deserialized).toEqual(params);
  });

  test('handles type-aware color conversion', () => {
    const paramDefs: ParamDef[] = [
      { name: 'color', type: 'string', isColor: true, defaultValue: '#ff0000', description: 'Color' },
      { name: 'colors', type: 'string[]', isColor: true, defaultValue: [], description: 'Color array' },
      { name: 'scale', type: 'number', defaultValue: 1, description: 'Scale' },
    ];

    const serialized = 'color=336699&colors=ff0000,00ff00&scale=1.5';
    const deserialized = deserializeParams(serialized, paramDefs);

    expect(deserialized).toEqual({
      color: 'hsla(210, 50%, 40%, 1)',
      colors: ['hsla(0, 100%, 50%, 1)', 'hsla(120, 100%, 50%, 1)'],
      scale: 1.5,
    });
  });

  test('wraps single values in arrays when needed', () => {
    const paramDefs: ParamDef[] = [
      { name: 'tags', type: 'string[]', defaultValue: [], description: 'Tags' },
      { name: 'nums', type: 'number[]', defaultValue: [], description: 'Numbers' },
    ];

    const deserialized = deserializeParams('tags=single&nums=42', paramDefs);

    expect(deserialized).toEqual({
      tags: ['single'],
      nums: [42],
    });
  });
});

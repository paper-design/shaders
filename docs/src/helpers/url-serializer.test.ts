import { describe, test, expect } from 'bun:test';
import { serializeParams, deserializeParams } from './url-serializer';
import { hslToHex, hexToHsl } from './color-utils';
import type { ParamDef } from '../shader-defs/shader-def-types';

describe('URL Serializer', () => {
  describe('Type-Aware Deserialization', () => {
    test('detects all-numeric hex colors with shader def type info', () => {
      const paramDefs: ParamDef[] = [
        { name: 'colorFront', type: 'string', isColor: true, defaultValue: '#ff0000', description: 'Front color' },
        { name: 'colorBack', type: 'string', isColor: true, defaultValue: '#00ff00', description: 'Back color' },
        { name: 'scale', type: 'number', defaultValue: 1, description: 'Scale factor' },
      ];

      const serialized = 'colorFront=336699&colorBack=aabbcc&scale=1.5';
      const deserialized = deserializeParams(serialized, paramDefs);

      expect(deserialized).toEqual({
        colorFront: 'hsla(210, 50%, 40%, 1)', // converted from #336699
        colorBack: 'hsla(210, 25%, 73%, 1)', // converted from #aabbcc
        scale: 1.5,
      });
    });

    test('wraps single values in arrays when paramDef.type is array', () => {
      const paramDefs: ParamDef[] = [
        { name: 'colors', type: 'string[]', isColor: true, defaultValue: [], description: 'Color array' },
        { name: 'tags', type: 'string[]', defaultValue: [], description: 'String array' },
        { name: 'numbers', type: 'number[]', defaultValue: [], description: 'Number array' },
      ];

      const serialized = 'colors=00ffff&tags=single&numbers=42';
      const deserialized = deserializeParams(serialized, paramDefs);

      expect(deserialized).toEqual({
        colors: ['hsla(180, 100%, 50%, 1)'], // single color wrapped in array and converted from hex
        tags: ['single'], // single string wrapped in array
        numbers: [42], // single number wrapped in array
      });
    });

    test('handles mixed color formats with type info', () => {
      const paramDefs: ParamDef[] = [
        { name: 'colors', type: 'string[]', isColor: true, defaultValue: [], description: 'Color array' },
      ];

      const serialized = 'colors=ff0000,336699,00ff00';
      const deserialized = deserializeParams(serialized, paramDefs);

      expect(deserialized).toEqual({
        colors: [
          'hsla(0, 100%, 50%, 1)', // from ff0000
          'hsla(210, 50%, 40%, 1)', // from 336699
          'hsla(120, 100%, 50%, 1)', // from 00ff00
        ],
      });
    });
  });

  describe('Basic Types', () => {
    test('serializes and deserializes booleans', () => {
      const params = { enabled: true, disabled: false };
      const serialized = serializeParams(params);
      const deserialized = deserializeParams(serialized);

      expect(deserialized).toEqual(params);
      expect(serialized).toBe('enabled=true&disabled=false');
    });

    test('serializes and deserializes numbers', () => {
      const params = {
        brightness: 0.24,
        contrast: 0.87,
        rotation: 56,
        scale: 0.28,
        negative: -5.5,
      };
      const serialized = serializeParams(params);
      const deserialized = deserializeParams(serialized);

      expect(deserialized).toEqual(params);
    });

    test('serializes and deserializes strings', () => {
      const params = {
        color: 'red',
        pattern: 'solid',
        shape: 'circle',
      };
      const serialized = serializeParams(params);
      const deserialized = deserializeParams(serialized);

      expect(deserialized).toEqual(params);
    });
  });

  describe('Special String Cases', () => {
    test('handles HSL color strings (converts to hex in URL)', () => {
      const params = {
        colorFront: 'hsla(0, 100%, 50%, 1)',
        colorMid: 'hsla(240, 100%, 50%, 1)',
        colorBack: 'hsla(0, 0%, 100%, 1)',
      };
      const serialized = serializeParams(params);
      const deserialized = deserializeParams(serialized);

      expect(deserialized).toEqual({
        colorFront: 'hsla(0, 100%, 50%, 1)',
        colorMid: 'hsla(240, 100%, 50%, 1)',
        colorBack: 'hsla(0, 0%, 100%, 1)',
      });

      expect(serialized).toBe('colorFront=ff0000&colorMid=0000ff&colorBack=ffffff');
      expect(serialized).not.toContain('hsl');
      expect(serialized).not.toContain('(');
      expect(serialized).not.toContain(')');
      expect(serialized).not.toContain('%');
    });

    test('handles HSLA color strings (converts to hex8 in URL)', () => {
      const params = {
        colorWithAlpha: 'hsla(0, 100%, 50%, 0.5)',
        colorOpaque: 'hsla(120, 100%, 50%, 1)',
        colorTransparent: 'hsla(240, 100%, 50%, 0)',
      };
      const serialized = serializeParams(params);
      const deserialized = deserializeParams(serialized);

      expect(deserialized.colorWithAlpha).toMatch(/^hsla\(0, 100%, 50%, 0\.5\d*\)$/);
      expect(deserialized.colorOpaque).toBe('hsla(120, 100%, 50%, 1)');
      expect(deserialized.colorTransparent).toBe('hsla(240, 100%, 50%, 0)');

      expect(serialized).toContain('80');
      expect(serialized).toContain('ff');
      expect(serialized).toContain('00');
      expect(serialized).not.toContain('hsla');
    });

    test('handles hex colors', () => {
      const params = {
        primary: '#ff0000',
        secondary: '#00ff00',
        tertiary: '#0000ff',
      };
      const serialized = serializeParams(params);
      const deserialized = deserializeParams(serialized);

      expect(deserialized).toEqual(params);
    });

    test('handles strings with special characters', () => {
      const params = {
        withUnderscore: 'test_value',
        withComma: 'a,b,c',
      };
      const serialized = serializeParams(params);
      const deserialized = deserializeParams(serialized);

      expect(deserialized).toEqual({
        withUnderscore: 'test_value',
        withComma: ['a', 'b', 'c'],
      });
    });
  });

  describe('Arrays', () => {
    test('serializes and deserializes string arrays', () => {
      const params = {
        colors: ['red', 'green', 'blue'],
        patterns: ['solid', 'dashed'],
      };
      const serialized = serializeParams(params);
      const deserialized = deserializeParams(serialized);

      expect(deserialized).toEqual(params);
    });

    test('serializes and deserializes number arrays', () => {
      const params = {
        coordinates: [1, 2, 3.5, -4.2],
        single: [42],
      };
      const serialized = serializeParams(params);
      const deserialized = deserializeParams(serialized);

      expect(deserialized).toEqual({
        coordinates: [1, 2, 3.5, -4.2],
        single: 42,
      });
    });

    test('handles array elements with HSL colors (converts to hex)', () => {
      const params = {
        colors: ['hsla(0, 100%, 50%, 1)', 'hsla(120, 100%, 50%, 1)', '#0000ff'],
      };
      const serialized = serializeParams(params);
      const deserialized = deserializeParams(serialized);

      expect(deserialized).toEqual({
        colors: ['hsla(0, 100%, 50%, 1)', 'hsla(120, 100%, 50%, 1)', '#0000ff'],
      });

      expect(serialized).toBe('colors=ff0000,00ff00,#0000ff');
      expect(serialized).not.toContain('hsl');
    });
  });

  describe('Real Shader Examples', () => {
    test('handles neuro-noise parameters (with hex conversion)', () => {
      const params = {
        colorFront: 'hsla(0, 100%, 50%, 1)',
        colorMid: 'hsla(0, 100%, 50%, 1)',
        colorBack: 'hsla(0, 0%, 100%, 1)',
        brightness: 0.24,
        contrast: 0.8700000000000001,
        scale: 0.28,
        rotation: 56,
        speed: 2,
      };
      const serialized = serializeParams(params);
      const deserialized = deserializeParams(serialized);

      expect(deserialized).toEqual({
        colorFront: 'hsla(0, 100%, 50%, 1)',
        colorMid: 'hsla(0, 100%, 50%, 1)',
        colorBack: 'hsla(0, 0%, 100%, 1)',
        brightness: 0.24,
        contrast: 0.8700000000000001,
        scale: 0.28,
        rotation: 56,
        speed: 2,
      });

      expect(serialized).toBe(
        'colorFront=ff0000&colorMid=ff0000&colorBack=ffffff&brightness=0.24&contrast=0.8700000000000001&scale=0.28&rotation=56&speed=2'
      );
      expect(serialized).not.toContain('hsl');
      expect(serialized).not.toContain('(');
      expect(serialized).not.toContain(')');
      expect(serialized).not.toContain('%');
      expect(serialized).not.toContain(' ');
      expect(serialized).toContain('&');
    });

    test('handles warp parameters with arrays and enums', () => {
      const params = {
        colors: ['#ff0000', '#00ff00', '#0000ff'],
        pattern: 'circles',
        distortion: 0.5,
        enabled: true,
        iterations: 10,
      };
      const serialized = serializeParams(params);
      const deserialized = deserializeParams(serialized);

      expect(deserialized).toEqual(params);

      expect(serialized).toBe(
        'colors=#ff0000,#00ff00,#0000ff&pattern=circles&distortion=0.5&enabled=true&iterations=10'
      );
    });
  });

  describe('Edge Cases', () => {
    test('handles empty object', () => {
      const params = {};
      const serialized = serializeParams(params);
      const deserialized = deserializeParams(serialized);

      expect(deserialized).toEqual(params);
      expect(serialized).toBe('');
    });

    test('handles very long decimal numbers', () => {
      const params = {
        precision: 0.123456789012345,
        large: 999999.999999,
      };
      const serialized = serializeParams(params);
      const deserialized = deserializeParams(serialized);

      expect(deserialized).toEqual(params);
    });
  });

  describe('URL Safety', () => {
    test('produces clean URLs for complex inputs', () => {
      const params = {
        color: 'hsla(120, 50%, 75%, 1)',
        array: ['item1', 'item2', 'item3'],
        boolean: true,
        number: 3.14159,
      };
      const serialized = serializeParams(params);

      expect(serialized).not.toContain(' ');
      expect(serialized).not.toContain('hsl');
      expect(serialized).toContain(',');
      expect(serialized).toContain('&');

      const deserialized = deserializeParams(serialized);

      const expectedColor = hexToHsl(hslToHex('hsla(120, 50%, 75%, 1)'));
      expect(deserialized).toEqual({
        color: expectedColor,
        array: ['item1', 'item2', 'item3'],
        boolean: true,
        number: 3.14159,
      });
    });
  });

  describe('Error Handling', () => {
    test('throws error for invalid serialized data', () => {
      expect(() => deserializeParams('missing_separator')).toThrow();
      expect(() => deserializeParams('key')).toThrow();
    });

    test('handles mixed arrays as strings', () => {
      const result = deserializeParams('array=1,notanumber,3');
      expect(result).toEqual({ array: ['1', 'notanumber', '3'] });
    });
  });
});

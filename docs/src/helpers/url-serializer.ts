import { hslToHex, hexToHsl, isHslColor, isHexColor } from './color-utils';
import type { ParamDef } from '../shader-defs/shader-def-types';

export type SerializableValue = string | number | boolean | string[] | number[];

const serializeValue = (value: SerializableValue, isColor?: boolean): string => {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') {
    // Convert HSL to hex if explicitly marked as color OR if it looks like HSL (for backward compatibility)
    return (isColor || isHslColor(value)) && isHslColor(value) ? hslToHex(value) : value;
  }
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (typeof v === 'string') {
          // Convert HSL to hex if explicitly marked as color OR if it looks like HSL (for backward compatibility)
          return (isColor || isHslColor(v)) && isHslColor(v) ? hslToHex(v) : String(v);
        }
        return String(v);
      })
      .join(',');
  }
  throw new Error(`Unsupported value type: ${typeof value}`);
};

const deserializeValue = (str: string, paramDef?: ParamDef): SerializableValue => {
  if (str === 'true') return true;
  if (str === 'false') return false;

  if (str.includes(',')) {
    const elements = str.split(',');

    // If this is a color array, handle color conversion
    if (paramDef?.isColor && paramDef?.type === 'string[]') {
      return elements.map((s) => {
        // Check if it's a hex color (could be 6 or 8 characters, or with # prefix)
        const cleanHex = s.startsWith('#') ? s.slice(1) : s;
        if (isHexColor(cleanHex) || /^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(cleanHex)) {
          return hexToHsl('#' + cleanHex);
        }
        return s;
      });
    }

    // If param type is number[], try to parse as numbers
    if (paramDef?.type === 'number[]') {
      const numElements = elements.map((s) => Number(s));
      if (numElements.every((n) => !isNaN(n) && isFinite(n))) return numElements;
    }

    // If we know this is a string type and not an array, treat the whole thing as a string
    // This handles HSL colors that contain commas but should remain as single strings
    if (paramDef?.type === 'string') {
      return str;
    }

    // Fallback: if we don't have type info, try to be smart about it
    if (!paramDef) {
      // If all elements are numbers, return as number array
      const numElements = elements.map((s) => Number(s));
      if (numElements.every((n) => !isNaN(n) && isFinite(n))) return numElements;

      // If the string looks like HSL format, keep it as a single string
      if (str.startsWith('hsla(') || str.startsWith('hsl(')) {
        return str;
      }

      // For arrays without type info, convert hex colors back to HSL for backward compatibility
      // but only for hex without # prefix (which indicates it was originally HSL)
      return elements.map((s) => {
        if (!s.startsWith('#') && /^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(s)) {
          return hexToHsl('#' + s);
        }
        return s;
      });
    }

    // Default to string array
    return elements;
  }

  // Handle single values that should be arrays based on paramDef type
  if (paramDef?.type === 'string[]') {
    if (paramDef?.isColor) {
      // Single color value for color array - convert hex to HSL if needed
      const cleanHex = str.startsWith('#') ? str.slice(1) : str;
      if (isHexColor(cleanHex) || /^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(cleanHex)) {
        return [hexToHsl('#' + cleanHex)];
      }
    }
    // Single string value for string array - wrap in array
    return [str];
  }

  if (paramDef?.type === 'number[]') {
    // Single number value for number array - wrap in array
    const num = Number(str);
    if (!isNaN(num) && isFinite(num)) return [num];
    // If not a valid number, treat as string array
    return [str];
  }

  // Single values
  if (paramDef?.type === 'boolean') {
    return str === 'true';
  }

  if (paramDef?.type === 'number') {
    const num = Number(str);
    if (!isNaN(num) && isFinite(num)) return num;
  }

  if (paramDef?.isColor && paramDef?.type === 'string') {
    // Check if it's a hex color (could be 6 or 8 characters, or with # prefix)
    const cleanHex = str.startsWith('#') ? str.slice(1) : str;
    if (isHexColor(cleanHex) || /^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(cleanHex)) {
      return hexToHsl('#' + cleanHex);
    }
  }

  // For enum types, return as string
  if (paramDef?.type === 'enum') {
    return str;
  }

  // For backward compatibility: if we don't have type info and it looks like hex WITHOUT # prefix, convert to HSL
  // This handles the case where HSL was serialized to hex, but preserves original hex colors (with #)
  if (!paramDef && !str.startsWith('#')) {
    if (/^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(str)) {
      return hexToHsl('#' + str);
    }
  }

  // Fallback: try number, then string
  const num = Number(str);
  if (!isNaN(num) && isFinite(num) && str.trim() !== '') return num;

  return str;
};

export const serializeParams = (params: Record<string, SerializableValue>, paramDefs?: ParamDef[]): string => {
  const paramDefsMap = paramDefs ? Object.fromEntries(paramDefs.map((def) => [def.name, def])) : {};

  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      const paramDef = paramDefsMap[key];
      return `${key}=${serializeValue(value, paramDef?.isColor)}`;
    })
    .join('&');
};

export const deserializeParams = (serialized: string, paramDefs?: ParamDef[]): Record<string, SerializableValue> => {
  if (!serialized) return {};

  const paramDefsMap = paramDefs ? Object.fromEntries(paramDefs.map((def) => [def.name, def])) : {};

  return serialized.split('&').reduce(
    (result, pair) => {
      if (!pair) return result;

      const separatorIndex = pair.indexOf('=');
      if (separatorIndex === -1) throw new Error(`Invalid parameter pair: ${pair}`);

      const key = pair.slice(0, separatorIndex);
      const paramDef = paramDefsMap[key];
      const value = deserializeValue(pair.slice(separatorIndex + 1), paramDef);

      result[key] = value;
      return result;
    },
    {} as Record<string, SerializableValue>
  );
};

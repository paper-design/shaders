import { hslToHex, hexToHsl } from './color-utils';
import type { ParamDef } from '../shader-defs/shader-def-types';

export type SerializableValue = string | number | boolean | string[] | number[];

export const serializeParams = (params: Record<string, SerializableValue>, paramDefs?: ParamDef[]): string => {
  const defsMap = paramDefs ? Object.fromEntries(paramDefs.map((def) => [def.name, def])) : {};

  const parts = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      const isColor = defsMap[key]?.isColor;
      let serialized: string;

      if (typeof value === 'boolean') {
        serialized = value ? 'true' : 'false';
        return `${key}=${serialized}`;
      }

      if (typeof value === 'number') {
        serialized = value.toString();
        return `${key}=${serialized}`;
      }

      if (typeof value === 'string') {
        serialized = isColor ? hslToHex(value).slice(1) : value;
        return `${key}=${serialized}`;
      }

      if (Array.isArray(value)) {
        serialized = value
          .map((v) => {
            const str = String(v);
            return isColor ? hslToHex(str).slice(1) : str;
          })
          .join(',');
        return `${key}=${serialized}`;
      }

      throw new Error(`Unsupported value type: ${typeof value}`);
    });

  return parts.join('&');
};

const deserializeValue = (str: string, def?: ParamDef): SerializableValue => {
  if (!def) {
    return str;
  }

  if (def.type === 'boolean') {
    return str === 'true';
  }

  if (def.type === 'number') {
    return Number(str);
  }

  if (def.type === 'string[]') {
    const elements = str.includes(',') ? str.split(',') : [str];
    if (def.isColor) {
      return elements.map((s) => {
        const cleanHex = s.startsWith('#') ? s.slice(1) : s;
        return /^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(cleanHex) ? hexToHsl('#' + cleanHex) : s;
      });
    }
    return elements;
  }

  if (def.type === 'number[]') {
    const elements = str.includes(',') ? str.split(',') : [str];
    return elements.map((s) => {
      return Number(s);
    });
  }

  if (def.type === 'string' || def.type === 'enum') {
    if (def.isColor && /^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(str)) {
      return hexToHsl('#' + str);
    }
    return str;
  }

  return str;
};

export const deserializeParams = (serialized: string, paramDefs?: ParamDef[]): Record<string, SerializableValue> => {
  const defsMap = paramDefs ? Object.fromEntries(paramDefs.map((def) => [def.name, def])) : {};

  return serialized.split('&').reduce(
    (result, pair) => {
      if (!pair) {
        return result;
      }

      const separatorIndex = pair.indexOf('=');
      if (separatorIndex === -1) {
        throw new Error(`Invalid parameter pair: ${pair}`);
      }

      const key = pair.slice(0, separatorIndex);
      const str = pair.slice(separatorIndex + 1);

      result[key] = deserializeValue(str, defsMap[key]);
      return result;
    },
    {} as Record<string, SerializableValue>
  );
};

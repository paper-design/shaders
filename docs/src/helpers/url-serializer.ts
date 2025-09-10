import { hslToHex, hexToHsl } from './color-utils';
import type { ParamDef } from '../shader-defs/shader-def-types';

export type SerializableValue = string | number | boolean | string[] | number[];

export const serializeParams = (params: Record<string, SerializableValue>, paramDefs: ParamDef[]): string => {
  const parts = Object.entries(params).map(([key, value]) => {
    const paramDef = paramDefs.find((def) => def.name === key);
    if (!paramDef) {
      throw new Error(`Parameter definition not found: ${key}`);
    }
    const isColor = paramDef.isColor;
    let serialized: string;

    if (typeof value === 'boolean') {
      serialized = value ? 'true' : 'false';
      return `${key}=${serialized}`;
    }

    if (typeof value === 'number') {
      const formattedNumber = Number.isInteger(value) ? value : parseFloat(value.toFixed(2));
      serialized = formattedNumber.toString();
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

const deserializeValue = (str: string, def: ParamDef): SerializableValue => {
  if (def.type === 'boolean') {
    return str === 'true';
  }

  if (def.type === 'number') {
    return Number(str);
  }

  if (def.type === 'string[]') {
    const items = str.includes(',') ? str.split(',') : [str];
    if (def.isColor) {
      return items.map((s) => hexToHsl(`#${s}`));
    }
    return items;
  }

  if (def.type === 'number[]') {
    const items = str.includes(',') ? str.split(',') : [str];
    return items.map((s) => Number(s));
  }

  if (def.type === 'string' && def.isColor) {
    return hexToHsl(`#${str}`);
  }

  return str;
};

export const deserializeParams = (serialized: string, paramDefs: ParamDef[]): Record<string, SerializableValue> =>
  serialized.split('&').reduce(
    (result, pair) => {
      const separatorIndex = pair.indexOf('=');
      if (separatorIndex === -1) {
        throw new Error(`Invalid parameter pair: ${pair}`);
      }
      const key = pair.slice(0, separatorIndex);
      const str = pair.slice(separatorIndex + 1);
      const paramDef = paramDefs.find((def) => def.name === key);
      if (!paramDef) {
        throw new Error(`Parameter definition not found: ${key}`);
      }
      result[key] = deserializeValue(str, paramDef);

      return result;
    },
    {} as Record<string, SerializableValue>
  );

import { getShaderColorFromString } from '@paper-design/shaders';
import {
  convertRgbToHsl as culoriConvertRgbToHsl,
  convertHslToRgb,
  parseHex,
  parseHsl,
  parseHslLegacy,
  serializeHex,
  serializeHex8,
} from 'culori/fn';

/**
 * Custom formatter that always outputs HSLA format (even when alpha=1)
 */
const formatHsla = (hslColor: any): string => {
  const h = Math.round(hslColor.h ?? 0);
  const s = Math.round((hslColor.s ?? 0) * 100);
  const l = Math.round((hslColor.l ?? 0) * 100);
  const alpha = Math.round((hslColor.alpha ?? 1) * 100) / 100; // Round to 2 decimal places

  return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
};

export const toHsla = (value: string): string => {
  // If already hsla, we still want to normalize it through our formatter
  // If hsl, we want to convert it to hsla
  if (value.startsWith('hsl')) {
    const hslColor = parseHsl(value) || parseHslLegacy(value);
    if (hslColor) {
      return formatHsla(hslColor);
    }
  }

  const rgbArray = getShaderColorFromString(value);
  const rgbColor = { mode: 'rgb' as const, r: rgbArray[0], g: rgbArray[1], b: rgbArray[2], alpha: rgbArray[3] };
  const hslColor = culoriConvertRgbToHsl(rgbColor);

  if (hslColor) {
    return formatHsla(hslColor);
  }

  return value;
};

export default function convertRgbToHsl([r, g, b, a = 1]: [number, number, number, number]): [
  number,
  number,
  number,
  number,
] {
  const rgbColor = { mode: 'rgb' as const, r: r ?? 0, g: g ?? 0, b: b ?? 0, alpha: a };
  const hslColor = culoriConvertRgbToHsl(rgbColor);

  if (hslColor) {
    return [hslColor.h ?? 0, hslColor.s ?? 0, hslColor.l ?? 0, hslColor.alpha ?? 1];
  }

  return [0, 0, 0, a];
}

export const hslToHex = (hslString: string): string => {
  try {
    const hslColor = parseHsl(hslString) || parseHslLegacy(hslString);
    if (hslColor) {
      const rgbColor = convertHslToRgb(hslColor);
      if (rgbColor) {
        // Use serializeHex8 if alpha is present and not 1, otherwise serializeHex
        const hasAlpha = rgbColor.alpha !== undefined && rgbColor.alpha !== 1;
        const hexString = hasAlpha ? serializeHex8(rgbColor) : serializeHex(rgbColor);
        return hexString.replace('#', '');
      }
    }
    return hslString;
  } catch {
    return hslString;
  }
};

export const hexToHsl = (hexString: string): string => {
  try {
    const normalizedHex = hexString.startsWith('#') ? hexString : `#${hexString}`;
    const rgbColor = parseHex(normalizedHex);
    if (rgbColor) {
      const hslColor = culoriConvertRgbToHsl(rgbColor);
      if (hslColor) {
        return formatHsla(hslColor);
      }
    }
    return hexString;
  } catch {
    return hexString;
  }
};

export const isHslColor = (str: string): boolean => {
  return /^hsla?\(/i.test(str);
};

export const isHexColor = (str: string): boolean => {
  return /^#?[0-9a-f]{3,8}$/i.test(str);
};

export const normalizeHex = (hexString: string): string => {
  const withHash = hexString.startsWith('#') ? hexString : `#${hexString}`;
  return withHash.toLowerCase();
};

export const normalizeColorString = (str: string): string => {
  if (isHslColor(str)) return normalizeHex(hslToHex(str));
  if (isHexColor(str)) return normalizeHex(str);
  return str;
};

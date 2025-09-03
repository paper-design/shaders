import { getShaderColorFromString } from '@paper-design/shaders';
import {
  convertRgbToHsl,
  convertHslToRgb,
  parseHex,
  parseHsl,
  parseHslLegacy,
  serializeHex,
  serializeHex8,
} from 'culori/fn';

const formatHsla = (hslColor: any): string => {
  const h = Math.round(hslColor.h ?? 0);
  const s = Math.round((hslColor.s ?? 0) * 100);
  const l = Math.round((hslColor.l ?? 0) * 100);
  const alpha = Math.round((hslColor.alpha ?? 1) * 100) / 100;
  return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
};

export const toHsla = (value: string): string => {
  if (value.startsWith('hsl')) {
    const hslColor = parseHsl(value) || parseHslLegacy(value);
    if (hslColor) {
      return formatHsla(hslColor);
    }
  }

  const rgbArray = getShaderColorFromString(value);
  const rgbColor = { mode: 'rgb' as const, r: rgbArray[0], g: rgbArray[1], b: rgbArray[2], alpha: rgbArray[3] };
  const hslColor = convertRgbToHsl(rgbColor);

  return hslColor ? formatHsla(hslColor) : value;
};

export const hslToHex = (hslString: string): string => {
  const hslColor = parseHsl(hslString) || parseHslLegacy(hslString);
  if (hslColor) {
    const rgbColor = convertHslToRgb(hslColor);
    if (rgbColor) {
      const hasAlpha = rgbColor.alpha !== undefined && rgbColor.alpha !== 1;
      return hasAlpha ? serializeHex8(rgbColor) : serializeHex(rgbColor);
    }
  }
  return hslString;
};

export const hexToHsl = (hexString: string): string => {
  const normalizedHex = hexString.startsWith('#') ? hexString : `#${hexString}`;
  const rgbColor = parseHex(normalizedHex);
  if (rgbColor) {
    const hslColor = convertRgbToHsl(rgbColor);
    if (hslColor) {
      return formatHsla(hslColor);
    }
  }
  return hexString;
};

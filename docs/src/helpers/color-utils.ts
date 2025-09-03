import { getShaderColorFromString } from '@paper-design/shaders';
import {
  convertRgbToHsl,
  convertHslToRgb,
  parseHex,
  parseHsl,
  parseHslLegacy,
  serializeHex,
  serializeHex8,
  Hsl,
} from 'culori/fn';

const formatHsla = (hslColor: Hsl): string => {
  const h = Math.round(hslColor.h ?? 0);
  const s = Math.round((hslColor.s ?? 0) * 100);
  const l = Math.round((hslColor.l ?? 0) * 100);
  const alpha = Math.round((hslColor.alpha ?? 1) * 100) / 100;
  return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
};

export const toHsla = (value: string): string => {
  if (value.startsWith('hsla')) {
    return value;
  }

  const [r, g, b, alpha] = getShaderColorFromString(value);
  const rgbColor = { mode: 'rgb' as const, r, g, b, alpha };
  const hslColor = convertRgbToHsl(rgbColor);

  if (!hslColor) {
    throw new Error(`Invalid RGB color: ${JSON.stringify(rgbColor)}`);
  }

  return formatHsla(hslColor);
};

export const hslToHex = (hslString: string): string => {
  const hslColor = parseHsl(hslString) || parseHslLegacy(hslString);
  if (!hslColor) {
    throw new Error(`Invalid HSL string: ${hslString}`);
  }
  const rgbColor = convertHslToRgb(hslColor);
  if (!rgbColor) {
    throw new Error(`Invalid HSL color: ${JSON.stringify(hslColor)}`);
  }
  const hasAlpha = rgbColor.alpha !== undefined && rgbColor.alpha !== 1;
  return hasAlpha ? serializeHex8(rgbColor) : serializeHex(rgbColor);
};

export const hexToHsl = (hex: string): string => {
  const rgbColor = parseHex(hex);
  if (!rgbColor) {
    throw new Error(`Invalid Hex string: ${hex}`);
  }
  const hslColor = convertRgbToHsl(rgbColor);
  if (!hslColor) {
    throw new Error(`Invalid RGB color: ${JSON.stringify(rgbColor)}`);
  }
  return formatHsla(hslColor);
};

import { getShaderColorFromString } from '@paper-design/shaders';

export function toHsla(value: string) {
  if (value.startsWith('hsla')) {
    return value;
  }

  const [h, s, l, a] = convertRgbToHsl(getShaderColorFromString(value));
  return `hsla(${h.toFixed(2)}, ${(s * 100).toFixed(2)}%, ${(l * 100).toFixed(2)}%, ${a.toFixed(2)})`;
}

export default function convertRgbToHsl([r, g, b, a = 1]: [number, number, number, number]) {
  if (r === undefined) r = 0;
  if (g === undefined) g = 0;
  if (b === undefined) b = 0;
  let h = 0;
  const M = Math.max(r, g, b),
    m = Math.min(r, g, b);
  const s = M === m ? 0 : (M - m) / (1 - Math.abs(M + m - 1));
  const l = 0.5 * (M + m);
  if (M - m !== 0)
    h = (M === r ? (g - b) / (M - m) + +(g < b) * 6 : M === g ? (b - r) / (M - m) + 2 : (r - g) / (M - m) + 4) * 60;
  return [h, s, l, a];
}

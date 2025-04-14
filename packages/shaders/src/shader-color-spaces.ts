export const ShaderColorSpaces = {
  rgb: 0,
  oklch: 1,
} as const;

export type ShaderColorSpace = keyof typeof ShaderColorSpaces;

import { folder, useControls } from 'leva';
import { setParamsSafe } from './use-reset-leva-params';
import { toHsla } from './to-hsla';
import { useEffect } from 'react';

interface UseColorsArgs {
  defaultColors: string[];
  maxColorCount: number;
}

export function useColors({ defaultColors, maxColorCount }: UseColorsArgs) {
  const [{ colorCount }, setColorCount] = useControls(() => ({
    Colors: folder({
      colorCount: {
        value: defaultColors.length,
        min: 1,
        max: maxColorCount,
        step: 1,
      },
    }),
  }));

  const [levaColors, setLevaColors] = useControls(() => {
    const colors: Record<string, { value: string }> = {};

    for (let i = 0; i < colorCount; i++) {
      colors[`color${i + 1}`] = {
        value: defaultColors[i] ? toHsla(defaultColors[i]) : `hsla(${(40 * i) % 360}, 60%, 50%, 1)`,
      };
    }

    return {
      Colors: folder(colors),
    };
  }, [colorCount]);

  // Reset colors to defaults when component mounts
  useEffect(() => {
    const defaultColorValues = Object.fromEntries(
      defaultColors.map((color: string, index: number) => {
        return [`color${index + 1}`, toHsla(color)];
      })
    );

    setColorCount({ colorCount: defaultColors.length });
    setParamsSafe(levaColors, setLevaColors, defaultColorValues);
  }, []);

  const setColors = (colors: string[]) => {
    const presetColors = Object.fromEntries(
      colors.map((color: string, index: number) => {
        return [`color${index + 1}`, toHsla(color)];
      })
    );

    setColorCount({ colorCount: colors.length });
    setParamsSafe(levaColors, setLevaColors, presetColors);
  };

  const colors = Object.values(levaColors) as unknown as string[];

  return { colors, setColors };
}

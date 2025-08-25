import { folder, useControls } from 'leva';
import { setParamsSafe } from './use-reset-leva-params';
import { toHsla } from './to-hsla';
import { useEffect, useLayoutEffect, useState } from 'react';

interface UseColorsArgs {
  defaultColors: string[];
  maxColorCount: number;
}

export function useColors({ defaultColors, maxColorCount }: UseColorsArgs) {
  const [presetColors, setPresetColors] = useState(() => {
    return Object.fromEntries(
      defaultColors.map((color: string, index: number) => {
        return [`color${index + 1}`, toHsla(color)];
      })
    );
  });

  const [{ colorCount }, setColorCount] = useControls(() => {
    return {
      Colors: folder({
        colorCount: {
          value: Object.values(presetColors).length,
          min: 1,
          max: maxColorCount,
          step: 1,
        },
      }),
    };
  });

  useLayoutEffect(() => {
    setColorCount({ colorCount: Object.values(presetColors).length });
  }, [presetColors, setColorCount]);

  const [levaColors, setLevaColors] = useControls(() => {
    console.log('useControls: leva colors');
    const colors: Record<string, { value: string }> = {};

    for (let i = 0; i < colorCount; i++) {
      colors[`color${i + 1}`] = {
        value: presetColors[i] ? toHsla(presetColors[i]) : `hsla(${(40 * i) % 360}, 60%, 50%, 1)`,
      };
    }

    return {
      Colors: folder(colors),
    };
  }, [colorCount]);

  useEffect(() => {
    if (Object.values(presetColors).length === colorCount) {
      setParamsSafe(presetColors, setLevaColors, presetColors);
    }
  }, [presetColors, colorCount, setLevaColors]);

  const setColors = (colors: string[]) => {
    setPresetColors(
      Object.fromEntries(
        colors.map((color: string, index: number) => {
          return [`color${index + 1}`, toHsla(color)];
        })
      )
    );
  };

  const colors = Object.values(levaColors) as unknown as string[];

  return { colors, setColors };
}

import { folder, useControls } from 'leva';
import { setParamsSafe } from './use-reset-leva-params';
import { toHsla } from './color-utils';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface UseColorsArgs {
  defaultColors: string[];
  maxColorCount: number;
}

// This cursed pile of garbage should be thrown away asap together with Leva
export function useColors({ defaultColors, maxColorCount }: UseColorsArgs) {
  const shouldRerenderInEffects = useRef(true);

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

  // Needed to not have a prev color flash when changing pages
  useLayoutEffect(() => {
    if (Object.values(presetColors).length === colorCount && shouldRerenderInEffects.current) {
      setParamsSafe(presetColors, setLevaColors, presetColors);
    }
  }, [presetColors, colorCount, setLevaColors]);

  // Needed to load in colors when loading page for the first time
  useEffect(() => {
    if (Object.values(presetColors).length === colorCount && shouldRerenderInEffects.current) {
      setParamsSafe(presetColors, setLevaColors, presetColors);
      shouldRerenderInEffects.current = false;
    }
  }, [presetColors, colorCount, setLevaColors]);

  const setColors = (colors: string[]) => {
    shouldRerenderInEffects.current = true;
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

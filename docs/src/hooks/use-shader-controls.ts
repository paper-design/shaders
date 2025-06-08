import { useState, useCallback } from 'react';
import { useColors } from '@/helpers/use-colors-standalone';

interface UseShaderControlsOptions<T> {
  defaultParams: T;
  defaultColors: string[];
  maxColorCount: number;
}

export const useShaderControls = <T extends Record<string, unknown>>({
  defaultParams,
  defaultColors,
  maxColorCount,
}: UseShaderControlsOptions<T>) => {
  const { colors, setColors } = useColors({
    defaultColors,
    maxColorCount,
  });

  const [params, setParams] = useState<T>(defaultParams);

  const updateParams = useCallback((updates: Partial<T>) => {
    setParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetToPreset = useCallback(
    (presetColors: string[], presetParams: T) => {
      setColors(presetColors);
      setParams(presetParams);
    },
    [setColors]
  );

  return {
    colors,
    setColors,
    params,
    updateParams,
    resetToPreset,
  };
};

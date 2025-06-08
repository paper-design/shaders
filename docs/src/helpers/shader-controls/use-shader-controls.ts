import { useState, useCallback } from 'react';
import { useColors } from '@/helpers/use-colors-standalone';

/**
 * Configuration options for shader controls
 * @template T - Type of shader-specific parameters
 */
interface UseShaderControlsOptions<T> {
  defaultParams: T;
  defaultColors: string[];
  maxColorCount: number;
}

/**
 * Custom hook for managing shader control state
 *
 * @template T - Type of shader-specific parameters (must be a record/object type)
 * @param options - Configuration object
 * @param options.defaultParams - Initial values for shader parameters
 * @param options.defaultColors - Initial color palette as array of color strings
 * @param options.maxColorCount - Maximum allowed colors in the palette
 * @returns Object containing:
 * - `colors`: Current color palette array
 * - `setColors`: Function to update the entire color palette
 * - `params`: Current shader parameters
 * - `updateParams`: Function to partially update shader parameters
 * - `resetToPreset`: Function to apply a complete preset (colors + params)
 */
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

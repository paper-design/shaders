import { useState } from 'react';

interface UseColorsArgs {
  defaultColors: string[];
  maxColorCount: number;
}

export const useColors = ({ defaultColors, maxColorCount }: UseColorsArgs) => {
  const [colors, setColorsState] = useState<string[]>(defaultColors);

  const setColors = (newColors: string[]) => {
    if (newColors.length <= maxColorCount) {
      setColorsState(newColors);
    }
  };

  return { colors, setColors };
};

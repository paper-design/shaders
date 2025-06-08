import React from 'react';
import { ColorPicker } from '@/components/color-picker';
import { hexToHsva, hslaStringToHsva } from '@uiw/color-convert';

interface ColorControlsProps {
  colors: string[];
  maxColorCount: number;
  onColorsChange: (colors: string[]) => void;
}

const getHueFromColor = (color: string): number => {
  if (color.startsWith('#')) {
    const hsva = hexToHsva(color);
    return hsva.h;
  } else if (color.includes('hsla') || color.includes('hsl')) {
    const hsva = hslaStringToHsva(color);
    return hsva.h;
  }
  return 0;
};

export const createColorControls = ({ colors, maxColorCount, onColorsChange }: ColorControlsProps) => {
  const handleColorCountChange = (value: number) => {
    const newColors = [...colors];
    if (value > colors.length) {
      const existingHues = colors.map(getHueFromColor).sort((a, b) => a - b);

      for (let i = colors.length; i < value; i++) {
        let maxGap = 0;
        let gapStart = 0;

        for (let j = 0; j < existingHues.length; j++) {
          const currentHue = existingHues[j];
          const nextHue = existingHues[(j + 1) % existingHues.length];
          const gap = (nextHue - currentHue + 360) % 360;

          if (gap > maxGap) {
            maxGap = gap;
            gapStart = currentHue;
          }
        }

        const newHue = (gapStart + maxGap / 2) % 360;
        existingHues.push(newHue);
        existingHues.sort((a, b) => a - b);

        const saturation = 70 + (i % 3) * 5;
        const lightness = 50 + (i % 2) * 10;

        newColors.push(`hsla(${Math.round(newHue)}, ${saturation}%, ${lightness}%, 1)`);
      }
    } else {
      newColors.length = value;
    }
    onColorsChange(newColors);
  };

  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    onColorsChange(newColors);
  };

  return {
    colorCount: {
      value: colors.length,
      min: 1,
      max: maxColorCount,
      step: 1,
      onChange: handleColorCountChange,
    },
    colorGrid: {
      type: 'custom' as const,
      render: () => (
        <div className="grid grid-cols-2 gap-1">
          {colors.map((color, index) => (
            <ColorPicker
              key={`color-${index}`}
              label=""
              value={color}
              onChange={(newColor) => handleColorChange(index, newColor)}
            />
          ))}
        </div>
      ),
    },
  };
};

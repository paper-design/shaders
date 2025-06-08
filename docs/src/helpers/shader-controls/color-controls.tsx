import React from 'react';
import { ColorPicker } from '@/components/color-picker';
import { hexToHsva, hslaStringToHsva } from '@uiw/color-convert';

interface ColorControlsProps {
  colors: string[];
  maxColorCount: number;
  onColorsChange: (colors: string[]) => void;
}

/**
 * Extracts the hue value from a color string (hex or HSL format)
 * @param color - Color string in hex (#RRGGBB) or HSL/HSLA format
 * @returns Hue value in degrees (0-360)
 */
const getHueFromColor = (color: string): number => {
  const hsva = color.startsWith('#') ? hexToHsva(color) : hslaStringToHsva(color);
  return hsva.h;
};

/**
 * Generates a new color that maximally contrasts with existing colors
 * by finding the largest gap in the color wheel and placing the new color
 * in the middle of that gap
 *
 * @param existingHues - Array of hue values from existing colors
 * @param index - Index of the new color (used for saturation/lightness variation)
 * @returns HSLA color string
 */
const generateNewColor = (existingHues: number[], index: number): string => {
  const sortedHues = [...existingHues].sort((a, b) => a - b);

  let maxGap = 0;
  let gapStart = 0;

  if (sortedHues.length === 1) {
    gapStart = sortedHues[0];
    maxGap = 360;
  } else {
    sortedHues.forEach((hue, i) => {
      const nextHue = sortedHues[(i + 1) % sortedHues.length];
      const gap = (nextHue - hue + 360) % 360;

      if (gap > maxGap) {
        maxGap = gap;
        gapStart = hue;
      }
    });
  }

  const newHue = (gapStart + maxGap / 2) % 360;
  const saturation = 70 + (index % 3) * 5;
  const lightness = 50 + (index % 2) * 10;

  return `hsla(${Math.round(newHue)}, ${saturation}%, ${lightness}%, 1)`;
};

/**
 * Creates color control configuration for shader UI
 * Provides controls for adjusting the number of colors and editing individual colors
 *
 * @param props - Configuration options
 * @param props.colors - Current array of color values
 * @param props.maxColorCount - Maximum number of colors allowed
 * @param props.onColorsChange - Callback when colors are modified
 * @returns Control configuration object for shader UI
 */
export const createColorControls = ({ colors, maxColorCount, onColorsChange }: ColorControlsProps) => {
  /**
   * Handles changes to the number of colors
   * - When increasing: generates new colors with optimal hue spacing
   * - When decreasing: truncates the color array
   */
  const handleColorCountChange = (value: number) => {
    if (value === colors.length) return;

    if (value > colors.length) {
      // Add new colors with optimal spacing
      const existingHues = colors.map(getHueFromColor);
      const newColors = [...colors];

      for (let i = colors.length; i < value; i++) {
        const newColor = generateNewColor(existingHues, i);
        existingHues.push(getHueFromColor(newColor));
        newColors.push(newColor);
      }

      onColorsChange(newColors);
    } else {
      // Remove colors from the end
      onColorsChange(colors.slice(0, value));
    }
  };

  /**
   * Updates a specific color at the given index
   */
  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    onColorsChange(newColors);
  };

  return {
    /** Slider control for adjusting the number of colors */
    colorCount: {
      value: colors.length,
      min: 1,
      max: maxColorCount,
      step: 1,
      onChange: handleColorCountChange,
    },
    /** Custom grid display of color pickers */
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

'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Colorful from '@uiw/react-color-colorful';
import {
  hexToHsva,
  hsvaToHex,
  hsvaToHsla,
  hslStringToHsva,
  hslaStringToHsva,
  rgbStringToHsva,
  rgbaStringToHsva,
  validHex,
  type HsvaColor,
} from '@uiw/color-convert';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const PICKER_SIZE = 280;
const DEFAULT_COLOR: HsvaColor = { h: 0, s: 0, v: 0, a: 1 };

/**
 * ColorPicker component that provides a compact color selection interface with a color swatch button, hex input field, and popup color picker.
 *
 * @example
 * ```tsx
 * <ColorPicker
 *   label="Background"
 *   value="#ff0000"
 *   onChange={(color) => console.log(color)} // hsla(0, 100%, 50%, 1)
 * />
 * ```
 */
export const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localHsva, setLocalHsva] = useState<HsvaColor | null>(null);
  const [hexInputValue, setHexInputValue] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /**
   * Parses a color string in various formats to HSVA color object.
   * Supports: hex (#rgb, #rrggbb), hsl/hsla, rgb/rgba formats.
   *
   * @param colorStr - Color string in any supported format
   * @returns HSVA color object, or DEFAULT_COLOR if parsing fails
   */
  const parseColorString = (colorStr: string): HsvaColor => {
    try {
      if (colorStr.startsWith('#')) return hexToHsva(colorStr);
      if (colorStr.includes('hsla')) return hslaStringToHsva(colorStr);
      if (colorStr.includes('hsl')) return hslStringToHsva(colorStr);
      if (colorStr.includes('rgba')) return rgbaStringToHsva(colorStr);
      if (colorStr.includes('rgb')) return rgbStringToHsva(colorStr);
    } catch {
      console.error('Error parsing color string:', colorStr);
    }
    return DEFAULT_COLOR;
  };

  const hsva = parseColorString(value);
  const currentHsva = localHsva || hsva;
  const displayHex = hsvaToHex(currentHsva);

  /**
   * Handles color changes from the picker.
   * Updates local state and calls onChange with hsla format.
   *
   * @param color - New color in HSVA format
   */
  const handleColorChange = (color: HsvaColor) => {
    setLocalHsva(color);
    setHexInputValue(null); // Reset hex input to use displayHex
    const { h, s, l, a } = hsvaToHsla(color);
    onChange(`hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`);
  };

  /**
   * Handles manual hex input changes.
   * Allows typing any value, but only updates color when valid.
   *
   * @param e - Input change event
   */
  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setHexInputValue(hex);

    // Only update the color if the hex is valid
    if (validHex(hex)) {
      handleColorChange(hexToHsva(hex));
    }
  };

  /**
   * Handles blur event on hex input.
   * Resets to valid hex if current value is invalid.
   */
  const handleHexBlur = () => {
    if (hexInputValue !== null && !validHex(hexInputValue)) {
      setHexInputValue(null); // Reset to displayHex
    }
  };

  /**
   * Calculates the optimal position for the color picker popup.
   * Ensures the popup stays within the viewport boundaries.
   *
   * @returns CSS position properties for the popup
   */
  const getPickerPosition = () => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    const top = rect.bottom + 4;
    const left = rect.left;

    return {
      position: 'fixed' as const,
      top: Math.min(top, window.innerHeight - PICKER_SIZE - 8),
      left: Math.min(left, window.innerWidth - PICKER_SIZE - 8),
      zIndex: 9999,
    };
  };

  return (
    <div className="mt-2 flex items-center gap-1">
      {label && <span className="text-xs text-gray-400">{label}</span>}

      <button
        ref={buttonRef}
        className="relative h-4 w-4 cursor-pointer rounded-sm"
        style={{ backgroundColor: displayHex }}
        onClick={() => setIsOpen(!isOpen)}
      />

      <input
        type="text"
        value={hexInputValue ?? displayHex}
        onChange={handleHexInput}
        onBlur={handleHexBlur}
        className="w-16 rounded-sm bg-white/10 px-1.5 py-0.5 font-mono text-xs outline-none hover:bg-white/20 focus:bg-white/20 focus:ring-1 focus:ring-white/50"
        placeholder="#000000"
      />

      {isOpen &&
        createPortal(
          <>
            {/* Backdrop - click to close */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => {
                setIsOpen(false);
                setLocalHsva(null);
              }}
            />

            {/* Color picker popup */}
            <div className="rounded-lg border border-gray-700 bg-[#1a1a1a] p-3 shadow-xl" style={getPickerPosition()}>
              <Colorful
                color={currentHsva}
                onChange={(result) => handleColorChange('hsva' in result ? result.hsva : result)}
                disableAlpha={true}
              />
            </div>
          </>,
          document.body
        )}
    </div>
  );
};

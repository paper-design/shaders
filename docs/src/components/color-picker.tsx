'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Colorful from '@uiw/react-color-colorful';
import { hexToHsva, hsvaToHex, hsvaToHsla, hslaToHsva, hslStringToHsla, type HsvaColor } from '@uiw/color-convert';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const parseColorString = (colorStr: string) => {
    const stringValue = typeof colorStr === 'string' ? colorStr : String(colorStr);

    // Handle hex colors
    if (stringValue.startsWith('#')) {
      const hsva = hexToHsva(stringValue);
      return hsvaToHsla(hsva);
    }

    if (stringValue.includes('hsla')) {
      const result = hslStringToHsla(stringValue);
      return result;
    }

    const hslMatch = stringValue.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
      const hslaStr = `hsla(${hslMatch[1]}, ${hslMatch[2]}%, ${hslMatch[3]}%, 1)`;
      const result = hslStringToHsla(hslaStr);
      return result;
    }
    const result = hslStringToHsla(stringValue);
    return result;
  };

  const colorValue = typeof value === 'string' ? value : String(value);
  const hsla = parseColorString(colorValue);
  const hsva = hslaToHsva(hsla);

  const [localHsva, setLocalHsva] = useState<HsvaColor | null>(null);
  const [hexInputValue, setHexInputValue] = useState('');
  const [isHexInputFocused, setIsHexInputFocused] = useState(false);

  const currentHsva = localHsva || hsva;
  const displayHex = hsvaToHex(currentHsva);

  const handleColorChange = (colorResult: { hsva: HsvaColor } | HsvaColor) => {
    const newHsva = 'hsva' in colorResult ? colorResult.hsva : colorResult;
    setLocalHsva(newHsva);

    const hsla = hsvaToHsla(newHsva);
    const sValue = hsla.s > 1 ? Math.round(hsla.s) : Math.round(hsla.s * 100);
    const lValue = hsla.l > 1 ? Math.round(hsla.l) : Math.round(hsla.l * 100);
    const hslaString = `hsla(${Math.round(hsla.h)}, ${sValue}%, ${lValue}%, ${hsla.a})`;
    onChange(hslaString);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    setHexInputValue(newValue);

    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      const hsva = hexToHsva(newValue);

      setLocalHsva(hsva);
      const hsla = hsvaToHsla(hsva);
      const sValue = hsla.s > 1 ? Math.round(hsla.s) : Math.round(hsla.s * 100);
      const lValue = hsla.l > 1 ? Math.round(hsla.l) : Math.round(hsla.l * 100);
      const hslaString = `hsla(${Math.round(hsla.h)}, ${sValue}%, ${lValue}%, ${hsla.a})`;

      onChange(hslaString);
    }
  };

  const getPickerPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 4,
      left: rect.left,
    };
  };

  return (
    <div className="mt-2 flex items-center gap-1">
      {label && <span className="text-xs text-gray-400">{label}</span>}
      <button
        ref={buttonRef}
        className="relative h-4 w-4 cursor-pointer rounded-sm"
        style={{ backgroundColor: displayHex }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) {
            setLocalHsva(null);
          }
        }}
      />
      <input
        type="text"
        value={isHexInputFocused ? hexInputValue : displayHex}
        onChange={handleInputChange}
        onFocus={() => {
          setIsHexInputFocused(true);
          setHexInputValue(displayHex);
        }}
        onBlur={() => {
          setIsHexInputFocused(false);
          setHexInputValue('');
          setLocalHsva(null);
        }}
        className="w-16 rounded-sm bg-white/10 px-1.5 py-0.5 font-mono text-xs outline-none hover:bg-white/20 focus:bg-white/20 focus:ring-1 focus:ring-white/50"
        placeholder="#000000"
      />
      {isOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => {
                setIsOpen(false);
                setLocalHsva(null);
              }}
            />
            <div
              className="color-picker-portal fixed z-[9999] rounded-lg border border-gray-700 bg-[#1a1a1a] p-3 shadow-xl"
              style={getPickerPosition()}
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                  .color-picker-portal div[style*="--colorful-pointer-background-color"] {
                    width: 16px !important;
                    height: 16px !important;
                    transform: translate(-8px, -8px) !important;
                  }
                  .color-picker-portal .w-color-hue > div > div[style*="position: absolute"] {
                    width: 16px !important;
                    height: 16px !important;
                    transform: translateX(-8px) !important;
                    top: 50% !important;
                    margin-top: -8px !important;
                  }
                `,
                }}
              />
              <Colorful color={currentHsva} onChange={handleColorChange} disableAlpha={true} />
            </div>
          </>,
          document.body
        )}
    </div>
  );
};

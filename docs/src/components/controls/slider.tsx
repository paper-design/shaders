'use client';

import React, { useState, memo } from 'react';
import type { BaseControl } from './types';
import { createId } from './utils';

export type SliderControl = BaseControl<number> & {
  type?: 'slider';
  min: number;
  max: number;
  step?: number;
  displayValue?: string;
};

type SliderProps = SliderControl & { label: string };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const Slider = memo(({ label, value, onChange, min, max, step = 0.01, displayValue }: SliderProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;
  const inputId = createId('slider', label);

  const getDisplayValue = () => {
    if (displayValue) return displayValue;
    return step >= 1 ? value.toString() : value.toFixed(2);
  };

  const displayedValue = isFocused && inputValue !== '' ? inputValue : getDisplayValue();

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(clamp(newValue, min, max));
    }
  };

  return (
    <div className="block last:mb-0">
      <label htmlFor={inputId} className="line-clamp-1 text-xs opacity-80">
        {label}
      </label>
      <div className="flex items-center gap-3 pr-0.5">
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="h-0.5 flex-1 appearance-none rounded-sm bg-[#484848] outline-none [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-[#f2f2f2] [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:active:scale-95 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#f2f2f2] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95"
          style={{
            background: `linear-gradient(to right, #f2f2f2 0%, #f2f2f2 ${percentage}%, #484848 ${percentage}%, #484848 100%)`,
          }}
          aria-label={label}
        />
        <input
          type="number"
          value={displayedValue}
          onChange={handleTextChange}
          onFocus={() => {
            setIsFocused(true);
            setInputValue(value.toString());
          }}
          onBlur={() => {
            setIsFocused(false);
            setInputValue('');
          }}
          min={min}
          max={max}
          step={step}
          className="w-[46px] rounded-sm bg-white/10 px-2 py-0.5 text-right text-xs outline-none [-moz-appearance:textfield] focus:bg-white/20 focus:ring-1 focus:ring-white/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label={`${label} value`}
        />
      </div>
    </div>
  );
});

Slider.displayName = 'Slider';

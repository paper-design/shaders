'use client';

import React, { memo } from 'react';
import type { BaseControl } from './types';
import { createId } from './utils';

export type SelectControl = BaseControl<string> & {
  type: 'select';
  options: string[];
};

type SelectProps = SelectControl & { label: string };

export const Select = memo(({ label, value, options, onChange }: SelectProps) => {
  const selectId = createId('select', label);

  return (
    <div className="mb-2 block">
      <label htmlFor={selectId} className="text-xs opacity-70">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-sm bg-white/10 px-2 py-1 pr-8 text-xs outline-none hover:bg-white/20 focus:bg-white/20 focus:ring-1 focus:ring-white/50"
          aria-label={label}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
});

Select.displayName = 'Select';

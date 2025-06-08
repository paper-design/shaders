'use client';

import React, { memo } from 'react';
import type { BaseControl } from './types';
import { createId } from './utils';

export type CheckboxControl = BaseControl<boolean> & {
  type: 'checkbox';
};

type CheckboxProps = CheckboxControl & { label: string };

export const Checkbox = memo(({ label, value, onChange }: CheckboxProps) => {
  const checkboxId = createId('checkbox', label);

  return (
    <div className="mb-2 block">
      <label htmlFor={checkboxId} className="flex cursor-pointer items-center gap-2 text-xs">
        <input
          id={checkboxId}
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-3.5 w-3.5 cursor-pointer rounded-sm border border-white/30 bg-white/10 text-white accent-white transition-colors hover:bg-white/20 focus:ring-1 focus:ring-white/50 focus:ring-offset-0"
          aria-label={label}
        />
        <span className="opacity-70">{label}</span>
      </label>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

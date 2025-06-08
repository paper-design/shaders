'use client';

import React, { useState, ReactNode, memo, useCallback, useMemo } from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  displayValue?: string;
}

export const Slider = memo(({ label, value, onChange, min, max, step = 0.01, displayValue }: SliderProps) => {
  const percentage = useMemo(() => ((value - min) / (max - min)) * 100, [value, min, max]);
  const inputId = useMemo(() => `slider-${label.replace(/\s+/g, '-').toLowerCase()}`, [label]);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const getDisplayValue = useCallback(() => {
    if (displayValue) return displayValue;
    if (step >= 1) return value.toString();
    return value.toFixed(2);
  }, [displayValue, step, value]);

  const displayedValue = isFocused && inputValue !== '' ? inputValue : getDisplayValue();

  const handleRangeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    },
    [onChange]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      const newValue = parseFloat(e.target.value);
      if (!isNaN(newValue)) {
        onChange(Math.min(Math.max(newValue, min), max));
      }
    },
    [onChange, min, max]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setInputValue(value.toString());
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setInputValue('');
  }, []);

  const sliderStyle = useMemo(
    () => ({
      background: `linear-gradient(to right, #f2f2f2 0%, #f2f2f2 ${percentage}%, #484848 ${percentage}%, #484848 100%)`,
    }),
    [percentage]
  );

  return (
    <div className="block last:mb-0">
      <label htmlFor={inputId} className="line-clamp-1 text-xs opacity-80">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleRangeChange}
          className="h-0.5 flex-1 appearance-none rounded-sm bg-[#484848] outline-none [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-[#f2f2f2] [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:active:scale-95 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#f2f2f2] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95"
          style={sliderStyle}
          aria-label={label}
        />
        <input
          type="text"
          value={displayedValue}
          onChange={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-[46px] rounded-sm bg-white/10 px-2 py-0.5 text-right text-xs outline-none [appearance:textfield] focus:bg-white/20 focus:ring-1 focus:ring-white/50"
          aria-label={`${label} value`}
        />
      </div>
    </div>
  );
});

Slider.displayName = 'Slider';

interface SelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export const Select = memo(({ label, value, options, onChange }: SelectProps) => {
  const selectId = useMemo(() => `select-${label.replace(/\s+/g, '-').toLowerCase()}`, [label]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="mb-2 block">
      <label htmlFor={selectId} className="text-xs opacity-70">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={handleChange}
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

interface CheckboxProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const Checkbox = memo(({ label, value, onChange }: CheckboxProps) => {
  const checkboxId = useMemo(() => `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`, [label]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.checked);
    },
    [onChange]
  );

  return (
    <div className="mb-2 block">
      <label htmlFor={checkboxId} className="flex cursor-pointer items-center gap-2 text-xs">
        <input
          id={checkboxId}
          type="checkbox"
          checked={value}
          onChange={handleChange}
          className="h-3.5 w-3.5 cursor-pointer rounded-sm border border-white/30 bg-white/10 text-white accent-white transition-colors hover:bg-white/20 focus:ring-1 focus:ring-white/50 focus:ring-offset-0"
          aria-label={label}
        />
        <span className="opacity-70">{label}</span>
      </label>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

interface ControlGroupProps {
  title: string;
  children: ReactNode;
  className?: string;
  defaultCollapsed?: boolean;
  spacing?: string;
}

export const ControlGroup = memo(
  ({ title, children, className, defaultCollapsed = false, spacing = 'space-y-0.5' }: ControlGroupProps) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    const toggleCollapse = useCallback(() => {
      setIsCollapsed((prev) => !prev);
    }, []);

    return (
      <div className={className}>
        <button
          type="button"
          onClick={toggleCollapse}
          className="mb-1 flex w-full items-center gap-1 text-xs font-medium hover:opacity-80"
          aria-expanded={!isCollapsed}
          aria-controls={`control-group-${title}`}
        >
          <svg
            className={`h-3 w-3 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>{title}</span>
        </button>
        <div
          id={`control-group-${title}`}
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
          }`}
        >
          <div className="relative ml-1.5 mt-1">
            <div className="absolute bottom-0 left-0 top-0 w-px bg-white/10" style={{ marginTop: '-0.375rem' }} />
            <div className={`ml-2.5 ${spacing} pl-1`}>{children}</div>
          </div>
        </div>
      </div>
    );
  }
);

ControlGroup.displayName = 'ControlGroup';

interface ControllersProps {
  children: ReactNode;
}

export const Controllers = memo(({ children }: ControllersProps) => {
  return (
    <div className="fixed right-5 top-5 z-[1000] rounded bg-black/70 text-white">
      <div className="min-w-[220px] max-w-[240px] divide-y divide-white/20">
        {React.Children.map(children, (child, index) => (
          <div className="p-3" key={index}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
});

Controllers.displayName = 'Controllers';

type SliderControl = {
  type?: 'slider';
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

type SelectControl = {
  type: 'select';
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

type CheckboxControl = {
  type: 'checkbox';
  value: boolean;
  onChange: (value: boolean) => void;
};

type CustomControl = {
  type: 'custom';
  render: () => ReactNode;
};

type ButtonControl = {
  type: 'button';
  onClick: () => void;
};

export type Control = SliderControl | SelectControl | CheckboxControl | CustomControl | ButtonControl;

type SimpleSliderControl = {
  min: number;
  max: number;
  step?: number;
};

type SimpleSelectControl = {
  options: string[];
};

type SimpleCheckboxControl = {
  value?: boolean;
};

type SimpleControl = SimpleSliderControl | SimpleSelectControl | SimpleCheckboxControl | CustomControl | ButtonControl;

type SimpleFolderConfig = {
  [key: string]: SimpleControl;
};

type FolderConfig = {
  [key: string]: Control;
};

type FolderOptions = {
  collapsed?: boolean;
  spacing?: string;
};

type FolderDefinition = {
  _isFolder: true;
  config: FolderConfig;
  options: FolderOptions;
};

export type ControlSchema = {
  [key: string]: Control | FolderDefinition;
};

export const createFolder = <T extends Record<string, unknown>>(
  simpleConfig: SimpleFolderConfig,
  params: T,
  setParams: (updates: Partial<T>) => void,
  options: FolderOptions = {}
): FolderDefinition => {
  const config: FolderConfig = {};

  for (const [key, control] of Object.entries(simpleConfig)) {
    if ('type' in control && (control.type === 'custom' || control.type === 'button')) {
      config[key] = control as CustomControl | ButtonControl;
    } else if ('options' in control) {
      config[key] = {
        type: 'select',
        value: params[key as keyof T] as string,
        options: control.options,
        onChange: (v) => setParams({ [key]: v } as Partial<T>),
      };
    } else if ('min' in control && 'max' in control) {
      config[key] = {
        value: params[key as keyof T] as number,
        min: control.min,
        max: control.max,
        step: control.step,
        onChange: (v) => setParams({ [key]: v } as Partial<T>),
      };
    } else if (typeof params[key as keyof T] === 'boolean') {
      config[key] = {
        type: 'checkbox',
        value: params[key as keyof T] as boolean,
        onChange: (v) => setParams({ [key]: v } as Partial<T>),
      };
    }
  }

  return {
    _isFolder: true,
    config,
    options,
  };
};

export const customButton = (onClick: () => void): ButtonControl => ({
  type: 'button',
  onClick,
});

export const renderControl = (key: string, control: Control) => {
  if (control.type === 'button') {
    return (
      <button
        key={key}
        onClick={control.onClick}
        className="w-full rounded-sm bg-white/10 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/20 active:bg-white/30"
      >
        {key}
      </button>
    );
  }

  if (control.type === 'custom') {
    return <div key={key}>{control.render()}</div>;
  }

  if (control.type === 'select') {
    return <Select key={key} label={key} value={control.value} options={control.options} onChange={control.onChange} />;
  }

  if (control.type === 'checkbox') {
    return <Checkbox key={key} label={key} value={control.value} onChange={control.onChange} />;
  }

  return (
    <Slider
      key={key}
      label={key}
      value={control.value}
      onChange={control.onChange}
      min={control.min}
      max={control.max}
      step={control.step}
    />
  );
};

export const renderFolder = (title: string, folder: FolderDefinition) => {
  return (
    <ControlGroup
      key={title}
      title={title}
      defaultCollapsed={folder.options?.collapsed}
      spacing={folder.options?.spacing}
    >
      {Object.entries(folder.config).map(([key, control]) => renderControl(key, control))}
    </ControlGroup>
  );
};

export const renderControlSchema = (schema: ControlSchema) => {
  return Object.entries(schema).map(([key, item]) => {
    if ('_isFolder' in item) {
      return renderFolder(key, item);
    }
    return <div key={key}>{renderControl(key, item as Control)}</div>;
  });
};

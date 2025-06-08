'use client';

import React, { useState, ReactNode } from 'react';
import { SimplexNoise, type SimplexNoiseParams, simplexNoisePresets } from '@paper-design/shaders-react';
import { ColorPicker } from '@/components/color-picker';

import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { simplexNoiseMeta, ShaderFit, ShaderFitOptions } from '@paper-design/shaders';

/**
 * You can copy/paste this example to use SimplexNoise in your app
 */
const SimplexNoiseExample = () => {
  return <SimplexNoise style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const firstPreset = simplexNoisePresets[0].params;
const { worldWidth, worldHeight, ...defaults } = firstPreset;

const useColors = ({ defaultColors, maxColorCount }: { defaultColors: string[]; maxColorCount: number }) => {
  const [colors, setColorsState] = useState<string[]>(defaultColors);

  const setColors = (newColors: string[]) => {
    if (newColors.length <= maxColorCount) {
      setColorsState(newColors);
    }
  };

  return { colors, setColors };
};

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  displayValue?: string;
}

const Slider = ({ label, value, onChange, min, max, step = 0.01, displayValue }: SliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const inputId = `slider-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const getDisplayValue = () => {
    if (displayValue) return displayValue;
    if (step >= 1) return value.toString();
    return value.toFixed(2);
  };

  const displayedValue = isFocused && inputValue !== '' ? inputValue : getDisplayValue();

  return (
    <div className="block last:mb-0">
      <label htmlFor={inputId} className="line-clamp-1 text-xs opacity-70">
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
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="h-0.5 flex-1 appearance-none rounded-sm bg-[#484848] outline-none [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-[#f2f2f2] [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:active:scale-95 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#f2f2f2] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95"
          style={{
            background: `linear-gradient(to right, #f2f2f2 0%, #f2f2f2 ${percentage}%, #484848 ${percentage}%, #484848 100%)`,
          }}
          aria-label={label}
        />
        <input
          type="text"
          value={displayedValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            const newValue = parseFloat(e.target.value);
            if (!isNaN(newValue)) {
              onChange(Math.min(Math.max(newValue, min), max));
            }
          }}
          onFocus={() => {
            setIsFocused(true);
            setInputValue(value.toString());
          }}
          onBlur={() => {
            setIsFocused(false);
            setInputValue('');
          }}
          className="w-[46px] rounded-sm bg-white/10 px-2 py-0.5 text-right text-xs outline-none [appearance:textfield] focus:bg-white/20 focus:ring-1 focus:ring-white/50"
          aria-label={`${label} value`}
        />
      </div>
    </div>
  );
};

interface SelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const Select = ({ label, value, options, onChange }: SelectProps) => {
  const selectId = `select-${label.replace(/\s+/g, '-').toLowerCase()}`;

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
};

interface ControlGroupProps {
  title: string;
  children: ReactNode;
  className?: string;
  defaultCollapsed?: boolean;
}

const ControlGroup = ({ title, children, className, defaultCollapsed = false }: ControlGroupProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mb-1 flex w-full items-center gap-1 text-xs font-medium hover:opacity-80"
      >
        <svg
          className={`h-3 w-3 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>{title}</span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
        }`}
      >
        <div className="relative ml-1.5 mt-1">
          <div className="absolute bottom-0 left-0 top-0 w-px bg-white/10" style={{ marginTop: '-0.375rem' }} />
          <div className="ml-2.5 space-y-0.5 pl-1">{children}</div>
        </div>
      </div>
    </div>
  );
};

interface ControllersProps {
  children: ReactNode;
}

const Controllers = ({ children }: ControllersProps) => {
  return (
    <div className="fixed right-5 top-5 z-[1000] rounded bg-black/70 text-white">
      <div className="min-w-[220px] divide-y divide-white/20">
        {React.Children.map(children, (child, index) => (
          <div className="p-3" key={index}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

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

type CustomControl = {
  type: 'custom';
  render: () => ReactNode;
};

type ButtonControl = {
  type: 'button';
  onClick: () => void;
};

type Control = SliderControl | SelectControl | CustomControl | ButtonControl;

type SimpleSliderControl = {
  min: number;
  max: number;
  step?: number;
};

type SimpleSelectControl = {
  options: string[];
};

type SimpleControl = SimpleSliderControl | SimpleSelectControl | CustomControl | ButtonControl;

type FolderConfig = {
  [key: string]: Control;
};

type SimpleFolderConfig = {
  [key: string]: SimpleControl;
};

type FolderOptions = {
  collapsed?: boolean;
};

type FolderDefinition = {
  _isFolder: true;
  config: FolderConfig;
  options: FolderOptions;
};

type ControlSchema = {
  [key: string]: Control | FolderDefinition;
};

const createFolder = <T extends Record<string, unknown>>(
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
    }
  }

  return {
    _isFolder: true,
    config,
    options,
  };
};

const customButton = (onClick: () => void): ButtonControl => ({
  type: 'button',
  onClick,
});

const renderControl = (key: string, control: Control) => {
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

const renderFolder = (title: string, folder: FolderDefinition) => {
  return (
    <ControlGroup key={title} title={title} defaultCollapsed={folder.options?.collapsed}>
      {Object.entries(folder.config).map(([key, control]) => renderControl(key, control))}
    </ControlGroup>
  );
};

const renderControlSchema = (schema: ControlSchema) => {
  return Object.entries(schema).map(([key, item]) => {
    if ('_isFolder' in item) {
      return renderFolder(key, item);
    }
    return <div key={key}>{renderControl(key, item as Control)}</div>;
  });
};

const SimplexNoiseWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: firstPreset.colors,
    maxColorCount: simplexNoiseMeta.maxColorCount,
  });

  // Independent state for custom controls
  const [customParams, setCustomParams] = useState({
    stepsPerColor: defaults.stepsPerColor,
    softness: defaults.softness,
    speed: defaults.speed,
    scale: defaults.scale,
    rotation: defaults.rotation,
    offsetX: defaults.offsetX,
    offsetY: defaults.offsetY,
    fit: defaults.fit,
    worldWidth: worldWidth || 1000,
    worldHeight: worldHeight || 500,
    originX: defaults.originX,
    originY: defaults.originY,
  });

  const updateCustomParams = (updates: Partial<typeof customParams>) => {
    setCustomParams((prev) => ({ ...prev, ...updates }));
  };

  const controlSchema: ControlSchema = {
    Colors: {
      _isFolder: true,
      config: {
        colorCount: {
          value: colors.length,
          min: 1,
          max: simplexNoiseMeta.maxColorCount,
          step: 1,
          onChange: (value) => {
            const newColors = [...colors];
            if (value > colors.length) {
              for (let i = colors.length; i < value; i++) {
                newColors.push(`hsla(${(40 * i) % 360}, 100%, 50%, 1)`);
              }
            } else {
              newColors.length = value;
            }
            setColors(newColors);
          },
        },
        colorGrid: {
          type: 'custom',
          render: () => (
            <div className="grid grid-cols-2">
              {colors.map((color, index) => (
                <ColorPicker
                  key={index}
                  label=""
                  value={color}
                  onChange={(newColor) => {
                    const newColors = [...colors];
                    newColors[index] = newColor;
                    setColors(newColors);
                  }}
                />
              ))}
            </div>
          ),
        },
      },
      options: {},
    },
    Parameters: createFolder(
      {
        stepsPerColor: { min: 1, max: 10, step: 1 },
        softness: { min: 0, max: 1 },
        speed: { min: 0, max: 2 },
      },
      customParams,
      updateCustomParams
    ),
    Transform: createFolder(
      {
        scale: { min: 0.01, max: 4 },
        rotation: { min: 0, max: 360, step: 1 },
        offsetX: { min: -1, max: 1 },
        offsetY: { min: -1, max: 1 },
      },
      customParams,
      updateCustomParams
    ),
    Fit: createFolder(
      {
        fit: { options: Object.keys(ShaderFitOptions) as ShaderFit[] },
        worldWidth: { min: 0, max: 5120, step: 1 },
        worldHeight: { min: 0, max: 5120, step: 1 },
        originX: { min: 0, max: 1 },
        originY: { min: 0, max: 1 },
      },
      customParams,
      updateCustomParams,
      { collapsed: true }
    ),
    Presets: createFolder(
      Object.fromEntries(
        simplexNoisePresets.map(
          ({ name, params: { worldWidth: presetWorldWidth, worldHeight: presetWorldHeight, ...preset } }) => [
            name,
            {
              type: 'button' as const,
              onClick: () => {
                const { colors, ...presetParams } = preset;
                setColors(colors);
                updateCustomParams({
                  ...presetParams,
                  worldWidth: presetWorldWidth || 1000,
                  worldHeight: presetWorldHeight || 500,
                });
              },
            },
          ]
        )
      ),
      customParams,
      updateCustomParams
    ),
  };

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>

      <Controllers>{renderControlSchema(controlSchema)}</Controllers>

      <SimplexNoise {...customParams} colors={colors} className="fixed size-full" />
    </>
  );
};

export default SimplexNoiseWithControls;

'use client';

import React, { useState } from 'react';
import { SimplexNoise, type SimplexNoiseParams, simplexNoisePresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { simplexNoiseMeta, ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';

/**
 * You can copy/paste this example to use SimplexNoise in your app
 */
const SimplexNoiseExample = () => {
  return <SimplexNoise style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = simplexNoisePresets[0].params;

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

  const getDisplayValue = () => {
    if (displayValue) return displayValue;
    return step >= 1 || value % 1 === 0 ? value.toString() : value.toFixed(2);
  };

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
          type="number"
          min={min}
          max={max}
          step={step}
          value={getDisplayValue()}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            if (!isNaN(newValue)) {
              onChange(Math.min(Math.max(newValue, min), max));
            }
          }}
          className="min-w-[3rem] rounded-sm bg-white/10 px-2 py-0.5 text-center text-xs outline-none [appearance:textfield] focus:bg-white/20 focus:ring-1 focus:ring-white/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-sm bg-white/10 px-2 py-1 text-xs outline-none hover:bg-white/20 focus:bg-white/20 focus:ring-1 focus:ring-white/50"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

interface ControlGroupProps {
  title: string;
  children: React.ReactNode;
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
  children: React.ReactNode;
}

const Controllers = ({ children }: ControllersProps) => {
  return (
    <div className="fixed left-5 top-5 z-[1000] rounded bg-black/70 text-white">
      <div className="min-w-[260px] divide-y divide-white/20">
        {React.Children.map(children, (child, index) => (
          <div className="py-3 pl-2 pr-3" key={index}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

const SimplexNoiseWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: simplexNoiseMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          stepsPerColor: { value: defaults.stepsPerColor, min: 1, max: 10, step: 1, order: 300 },
          softness: { value: defaults.softness, min: 0, max: 1, order: 301 },
          speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
        },
        { order: 1 }
      ),
      Transform: folder(
        {
          scale: { value: defaults.scale, min: 0.01, max: 4, order: 400 },
          rotation: { value: defaults.rotation, min: 0, max: 360, order: 401 },
          offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 402 },
          offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 403 },
        },
        {
          order: 2,
          collapsed: false,
        }
      ),
      Fit: folder(
        {
          fit: { value: defaults.fit, options: Object.keys(ShaderFitOptions) as ShaderFit[], order: 404 },
          worldWidth: { value: 1000, min: 0, max: 5120, order: 405 },
          worldHeight: { value: 500, min: 0, max: 5120, order: 406 },
          originX: { value: defaults.originX, min: 0, max: 1, order: 407 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 408 },
        },
        {
          order: 3,
          collapsed: true,
        }
      ),
    };
  }, [colors.length]);

  const [customScale, setCustomScale] = useState(defaults.scale);
  const [customRotation, setCustomRotation] = useState(defaults.rotation);
  const [customOffsetX, setCustomOffsetX] = useState(defaults.offsetX);
  const [customOffsetY, setCustomOffsetY] = useState(defaults.offsetY);
  const [customStepsPerColor, setCustomStepsPerColor] = useState(defaults.stepsPerColor);
  const [customSoftness, setCustomSoftness] = useState(defaults.softness);
  const [customSpeed, setCustomSpeed] = useState(defaults.speed);
  const [customFit, setCustomFit] = useState<ShaderFit>(defaults.fit);
  const [customWorldWidth, setCustomWorldWidth] = useState(1000);
  const [customWorldHeight, setCustomWorldHeight] = useState(500);
  const [customOriginX, setCustomOriginX] = useState(defaults.originX);
  const [customOriginY, setCustomOriginY] = useState(defaults.originY);

  useControls(() => {
    const presets = Object.fromEntries(
      simplexNoisePresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => {
          const { colors, ...presetParams } = preset;
          setColors(colors);
          setParamsSafe(params, setParams, presetParams);
        }),
      ])
    );
    return {
      Presets: folder(presets, { order: 10 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(simplexNoisePresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>

      <Controllers>
        <ControlGroup title="Parameters">
          <Slider
            label="stepsPerColor"
            value={customStepsPerColor}
            onChange={(value) => {
              setCustomStepsPerColor(value);
              setParams({ stepsPerColor: value });
            }}
            min={1}
            max={10}
            step={1}
            displayValue={customStepsPerColor.toString()}
          />
          <Slider
            label="softness"
            value={customSoftness}
            onChange={(value) => {
              setCustomSoftness(value);
              setParams({ softness: value });
            }}
            min={0}
            max={1}
          />
          <Slider
            label="speed"
            value={customSpeed}
            onChange={(value) => {
              setCustomSpeed(value);
              setParams({ speed: value });
            }}
            min={0}
            max={2}
          />
        </ControlGroup>

        <ControlGroup title="Transform">
          <Slider
            label="scale"
            value={customScale}
            onChange={(value) => {
              setCustomScale(value);
              setParams({ scale: value });
            }}
            min={0.01}
            max={4}
          />
          <Slider
            label="rotation"
            value={customRotation}
            onChange={(value) => {
              setCustomRotation(value);
              setParams({ rotation: value });
            }}
            min={0}
            max={360}
            step={1}
            displayValue={customRotation.toString()}
          />
          <Slider
            label="offsetX"
            value={customOffsetX}
            onChange={(value) => {
              setCustomOffsetX(value);
              setParams({ offsetX: value });
            }}
            min={-1}
            max={1}
          />
          <Slider
            label="offsetY"
            value={customOffsetY}
            onChange={(value) => {
              setCustomOffsetY(value);
              setParams({ offsetY: value });
            }}
            min={-1}
            max={1}
          />
        </ControlGroup>

        <ControlGroup title="Fit" defaultCollapsed={true}>
          <Select
            label="fit"
            value={customFit}
            options={Object.keys(ShaderFitOptions) as ShaderFit[]}
            onChange={(value) => {
              setCustomFit(value as ShaderFit);
              setParams({ fit: value as ShaderFit });
            }}
          />
          <Slider
            label="worldWidth"
            value={customWorldWidth}
            onChange={(value) => {
              setCustomWorldWidth(value);
              setParams({ worldWidth: value });
            }}
            min={0}
            max={5120}
            step={1}
          />
          <Slider
            label="worldHeight"
            value={customWorldHeight}
            onChange={(value) => {
              setCustomWorldHeight(value);
              setParams({ worldHeight: value });
            }}
            min={0}
            max={5120}
            step={1}
          />
          <Slider
            label="originX"
            value={customOriginX}
            onChange={(value) => {
              setCustomOriginX(value);
              setParams({ originX: value });
            }}
            min={0}
            max={1}
          />
          <Slider
            label="originY"
            value={customOriginY}
            onChange={(value) => {
              setCustomOriginY(value);
              setParams({ originY: value });
            }}
            min={0}
            max={1}
          />
        </ControlGroup>
      </Controllers>

      <SimplexNoise
        {...params}
        colors={colors}
        scale={customScale}
        rotation={customRotation}
        offsetX={customOffsetX}
        offsetY={customOffsetY}
        stepsPerColor={customStepsPerColor}
        softness={customSoftness}
        speed={customSpeed}
        fit={customFit}
        worldWidth={customWorldWidth}
        worldHeight={customWorldHeight}
        originX={customOriginX}
        originY={customOriginY}
        className="fixed size-full"
      />
    </>
  );
};

export default SimplexNoiseWithControls;

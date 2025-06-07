'use client';

import { SimplexNoise, type SimplexNoiseParams, simplexNoisePresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { simplexNoiseMeta, ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { useState } from 'react';

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

  return (
    <>
      <style jsx>{`
        .custom-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 2px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          background: #484848;
        }

        /* WebKit browsers - use gradient for progress */
        .custom-slider::-webkit-slider-runnable-track {
          height: 2px;
          background: linear-gradient(
            to right,
            #f2f2f2 0%,
            #f2f2f2 var(--progress),
            #484848 var(--progress),
            #484848 100%
          );
          border-radius: 2px;
        }

        /* Firefox - native progress support */
        .custom-slider::-moz-range-progress {
          height: 2px;
          background: #f2f2f2;
          border-radius: 2px;
        }

        .custom-slider::-moz-range-track {
          height: 2px;
          background: #f2f2f2;
          border-radius: 2px;
        }

        /* Chrome, Safari, Edge - Thumb */
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: #f2f2f2;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.15s ease;
          margin-top: -5px;
        }

        .custom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .custom-slider::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }

        /* Firefox - Thumb */
        .custom-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: #f2f2f2;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .custom-slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }

        .custom-slider::-moz-range-thumb:active {
          transform: scale(0.95);
        }

        /* Style for number input */
        .custom-number-input {
          -webkit-appearance: none;
          -moz-appearance: textfield;
        }
        .custom-number-input::-webkit-inner-spin-button,
        .custom-number-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>

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
            className="custom-slider flex-1"
            style={{ '--progress': `${percentage}%` } as React.CSSProperties}
            aria-label={label}
          />
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={displayValue || value.toFixed(2)}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value);
              if (!isNaN(newValue)) {
                onChange(Math.min(Math.max(newValue, min), max));
              }
            }}
            className="custom-number-input min-w-[3rem] rounded-sm bg-white/10 px-2 py-0.5 text-center text-xs outline-none focus:bg-white/20 focus:ring-1 focus:ring-blue-500"
            aria-label={`${label} value`}
          />
        </div>
      </div>
    </>
  );
};

interface ControllersProps {
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  onScaleChange: (scale: number) => void;
  onRotationChange: (rotation: number) => void;
  onOffsetXChange: (offsetX: number) => void;
  onOffsetYChange: (offsetY: number) => void;
}

const Controllers = ({
  scale,
  rotation,
  offsetX,
  offsetY,
  onScaleChange,
  onRotationChange,
  onOffsetXChange,
  onOffsetYChange,
}: ControllersProps) => {
  return (
    <div className="fixed bottom-5 left-5 z-[1000] rounded bg-black/70 p-5 text-white">
      <p className="mb-3 text-xs font-medium">Transform</p>

      <Slider label="scale" value={scale} onChange={onScaleChange} min={0.01} max={4} />
      <Slider
        label="rotation"
        value={rotation}
        onChange={onRotationChange}
        min={0}
        max={360}
        step={1}
        displayValue={rotation.toString()}
      />
      <Slider label="offsetX" value={offsetX} onChange={onOffsetXChange} min={-1} max={1} />
      <Slider label="offsetY" value={offsetY} onChange={onOffsetYChange} min={-1} max={1} />
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

      <Controllers
        scale={customScale}
        rotation={customRotation}
        offsetX={customOffsetX}
        offsetY={customOffsetY}
        onScaleChange={(scale) => {
          setCustomScale(scale);
          setParams({ scale });
        }}
        onRotationChange={(rotation) => {
          setCustomRotation(rotation);
          setParams({ rotation });
        }}
        onOffsetXChange={(offsetX) => {
          setCustomOffsetX(offsetX);
          setParams({ offsetX });
        }}
        onOffsetYChange={(offsetY) => {
          setCustomOffsetY(offsetY);
          setParams({ offsetY });
        }}
      />

      <SimplexNoise
        {...params}
        colors={colors}
        scale={customScale}
        rotation={customRotation}
        offsetX={customOffsetX}
        offsetY={customOffsetY}
        className="fixed size-full"
      />
    </>
  );
};

export default SimplexNoiseWithControls;

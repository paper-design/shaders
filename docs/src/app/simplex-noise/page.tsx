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

interface CustomControlsProps {
  scale: number;
  onScaleChange: (scale: number) => void;
}

const CustomControls = ({ scale, onScaleChange }: CustomControlsProps) => {
  return (
    <div className="fixed bottom-5 left-5 z-[1000] rounded-lg bg-black/80 p-5 text-white">
      <label className="mb-2.5 block">
        <span className="text-sm">Scale: {scale.toFixed(2)}</span>
        <input
          type="range"
          min="0.01"
          max="4"
          step="0.01"
          value={scale}
          onChange={(e) => onScaleChange(parseFloat(e.target.value))}
          className="mt-1.5 block w-[200px] cursor-pointer"
        />
      </label>
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

      <CustomControls
        scale={customScale}
        onScaleChange={(scale) => {
          setCustomScale(scale);
          setParams({ scale });
        }}
      />

      <SimplexNoise {...params} colors={colors} scale={customScale} className="fixed size-full" />
    </>
  );
};

export default SimplexNoiseWithControls;

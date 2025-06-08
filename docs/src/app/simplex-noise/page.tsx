'use client';

import React, { useMemo } from 'react';
import { SimplexNoise, type SimplexNoiseParams, simplexNoisePresets } from '@paper-design/shaders-react';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { simplexNoiseMeta, ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { Controllers, ControlSchema, createFolder, renderControlSchema } from '@/components/controllers';
import { useShaderControls } from '@/helpers/shader-controls/use-shader-controls';
import { createColorControls } from '@/helpers/shader-controls/color-controls';
import { createPresetControls } from '@/helpers/shader-controls/preset-controls';

const FIRST_PRESET = simplexNoisePresets[0].params;
const { colors: defaultColors, ...defaultParams } = FIRST_PRESET;

/**
 * You can copy/paste this example to use SimplexNoise in your app
 */
const SimplexNoiseExample = () => {
  return <SimplexNoise style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */
const SimplexNoiseWithControls = () => {
  const { colors, setColors, params, updateParams, resetToPreset } = useShaderControls({
    defaultParams: {
      ...defaultParams,
      worldWidth: defaultParams.worldWidth || 1000,
      worldHeight: defaultParams.worldHeight || 500,
    },
    defaultColors,
    maxColorCount: simplexNoiseMeta.maxColorCount,
  });

  const controlSchema = useMemo<ControlSchema>(() => {
    const handlePresetSelect = (presetColors: string[], presetParams: Partial<typeof params>) => {
      resetToPreset(presetColors, {
        ...presetParams,
        worldWidth: presetParams.worldWidth || 1000,
        worldHeight: presetParams.worldHeight || 500,
      } as typeof params);
    };

    return {
      Colors: {
        _isFolder: true,
        config: createColorControls({
          colors,
          maxColorCount: simplexNoiseMeta.maxColorCount,
          onColorsChange: setColors,
        }),
        options: {},
      },
      Parameters: createFolder(
        {
          stepsPerColor: { min: 1, max: 10, step: 1 },
          softness: { min: 0, max: 1 },
          speed: { min: 0, max: 2 },
        },
        params,
        updateParams
      ),
      Transform: createFolder(
        {
          scale: { min: 0.01, max: 4 },
          rotation: { min: 0, max: 360, step: 1 },
          offsetX: { min: -1, max: 1 },
          offsetY: { min: -1, max: 1 },
        },
        params,
        updateParams
      ),
      Fit: createFolder(
        {
          fit: { options: Object.keys(ShaderFitOptions) as ShaderFit[] },
          worldWidth: { min: 0, max: 5120, step: 1 },
          worldHeight: { min: 0, max: 5120, step: 1 },
          originX: { min: 0, max: 1 },
          originY: { min: 0, max: 1 },
        },
        params,
        updateParams,
        { collapsed: true }
      ),
      Presets: createFolder(
        createPresetControls({
          presets: simplexNoisePresets,
          onPresetSelect: handlePresetSelect,
        }),
        params,
        updateParams,
        { spacing: 'space-y-1' }
      ),
    };
  }, [colors, params, updateParams, setColors, resetToPreset]);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>

      <Controllers>{renderControlSchema(controlSchema)}</Controllers>

      <SimplexNoise {...params} colors={colors} className="fixed size-full" />
    </>
  );
};

export default SimplexNoiseWithControls;

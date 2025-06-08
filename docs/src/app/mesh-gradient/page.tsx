'use client';

import React, { useMemo } from 'react';
import { MeshGradient, meshGradientPresets } from '@paper-design/shaders-react';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { meshGradientMeta, ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { Controllers, ControlSchema, createFolder, renderControlSchema } from '@/components/controllers';
import { useShaderControls } from '@/hooks/use-shader-controls';
import { createColorControls } from '@/helpers/shader-controls/color-controls';
import { createPresetControls } from '@/helpers/shader-controls/preset-controls';

const FIRST_PRESET = meshGradientPresets[0].params;
const { worldWidth, worldHeight, colors: defaultColors, ...defaultParams } = FIRST_PRESET;

const DEFAULT_WORLD_DIMENSIONS = {
  worldWidth: worldWidth || 1000,
  worldHeight: worldHeight || 500,
};

type MeshGradientControlParams = typeof defaultParams & {
  worldWidth: number;
  worldHeight: number;
};

/**
 * You can copy/paste this example to use MeshGradient in your app
 */
const MeshGradientExample = () => {
  return <MeshGradient style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */
const MeshGradientWithControls = () => {
  const { colors, setColors, params, updateParams, resetToPreset } = useShaderControls<MeshGradientControlParams>({
    defaultParams: {
      ...defaultParams,
      ...DEFAULT_WORLD_DIMENSIONS,
    } as MeshGradientControlParams,
    defaultColors,
    maxColorCount: meshGradientMeta.maxColorCount,
  });

  const controlSchema = useMemo<ControlSchema>(() => {
    const handlePresetSelect = (presetColors: string[], presetParams: Partial<MeshGradientControlParams>) => {
      resetToPreset(presetColors, {
        ...presetParams,
        worldWidth: presetParams.worldWidth || DEFAULT_WORLD_DIMENSIONS.worldWidth,
        worldHeight: presetParams.worldHeight || DEFAULT_WORLD_DIMENSIONS.worldHeight,
      } as MeshGradientControlParams);
    };

    return {
      Colors: {
        _isFolder: true,
        config: createColorControls({
          colors,
          maxColorCount: meshGradientMeta.maxColorCount,
          onColorsChange: setColors,
        }),
        options: {},
      },
      Parameters: createFolder(
        {
          distortion: { min: 0, max: 1 },
          swirl: { min: 0, max: 1 },
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
        updateParams,
        { collapsed: false }
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
          presets: meshGradientPresets,
          onPresetSelect: handlePresetSelect,
        }),
        params,
        updateParams,
        { spacing: 'space-y-1' }
      ),
    };
  }, [colors, params, updateParams, setColors, resetToPreset]);

  const { worldWidth: _, worldHeight: __, ...shaderParams } = params;

  return (
    <>
      <Link href="/" className="relative z-10">
        <BackButton />
      </Link>

      <Controllers>{renderControlSchema(controlSchema)}</Controllers>

      <MeshGradient
        {...shaderParams}
        worldWidth={params.worldWidth}
        worldHeight={params.worldHeight}
        colors={colors}
        className="fixed size-full"
      />
    </>
  );
};

export default MeshGradientWithControls;

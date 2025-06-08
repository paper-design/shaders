'use client';

import React, { useMemo } from 'react';
import { Spiral, type SpiralParams, spiralPresets } from '@paper-design/shaders-react';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { Controllers, ControlSchema, createFolder, renderControlSchema, customButton } from '@/components/controllers';
import { useShaderControls } from '@/hooks/use-shader-controls';
import { ColorPicker } from '@/components/color-picker';

const FIRST_PRESET = spiralPresets[0].params;
const { worldWidth, worldHeight, colorBack, colorFront, ...defaultParams } = FIRST_PRESET;

const DEFAULT_WORLD_DIMENSIONS = {
  worldWidth: worldWidth || 1000,
  worldHeight: worldHeight || 500,
};

type SpiralControlParams = Omit<SpiralParams, 'colorBack' | 'colorFront'> & {
  worldWidth: number;
  worldHeight: number;
  reverse: boolean;
};

/**
 * You can copy/paste this example to use Spiral in your app
 */
const SpiralExample = () => {
  return <Spiral style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */
const SpiralWithControls = () => {
  const { colors, setColors, params, updateParams, resetToPreset } = useShaderControls<SpiralControlParams>({
    defaultParams: {
      ...defaultParams,
      ...DEFAULT_WORLD_DIMENSIONS,
      speed: Math.abs(defaultParams.speed || 0),
      reverse: (defaultParams.speed || 0) < 0,
    } as SpiralControlParams,
    defaultColors: [colorBack, colorFront],
    maxColorCount: 2,
  });

  const controlSchema = useMemo<ControlSchema>(() => {
    const handlePresetSelect = (preset: (typeof spiralPresets)[0]) => {
      const { colorBack, colorFront, speed, ...otherParams } = preset.params;
      resetToPreset([colorBack, colorFront], {
        ...otherParams,
        speed: Math.abs(speed || 0),
        reverse: (speed || 0) < 0,
        worldWidth: preset.params.worldWidth || DEFAULT_WORLD_DIMENSIONS.worldWidth,
        worldHeight: preset.params.worldHeight || DEFAULT_WORLD_DIMENSIONS.worldHeight,
      } as SpiralControlParams);
    };

    const handleColorChange = (index: number, newColor: string) => {
      const newColors = [...colors];
      newColors[index] = newColor;
      setColors(newColors);
    };

    return {
      Colors: {
        _isFolder: true,
        config: {
          colorGrid: {
            type: 'custom' as const,
            render: () => (
              <div className="grid grid-cols-2 gap-1">
                <ColorPicker label="" value={colors[0]} onChange={(newColor) => handleColorChange(0, newColor)} />
                <ColorPicker label="" value={colors[1]} onChange={(newColor) => handleColorChange(1, newColor)} />
              </div>
            ),
          },
        },
        options: {},
      },
      Parameters: createFolder(
        {
          density: { min: 0, max: 1 },
          distortion: { min: 0, max: 1 },
          strokeWidth: { min: 0, max: 1 },
          strokeTaper: { min: 0, max: 1 },
          strokeCap: { min: 0, max: 1 },
          noiseFrequency: { min: 0, max: 30 },
          noisePower: { min: 0, max: 1 },
          softness: { min: 0, max: 1 },
          speed: { min: 0, max: 2 },
          reverse: {},
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
        Object.fromEntries(
          spiralPresets.map((preset) => [preset.name, customButton(() => handlePresetSelect(preset))])
        ),
        params,
        updateParams,
        { spacing: 'space-y-1' }
      ),
    };
  }, [colors, params, updateParams, setColors, resetToPreset]);

  const { worldWidth: _, worldHeight: __, reverse, ...shaderParams } = params;

  return (
    <>
      <Link href="/" className="relative z-10">
        <BackButton />
      </Link>

      <Controllers>{renderControlSchema(controlSchema)}</Controllers>

      <Spiral
        {...shaderParams}
        worldWidth={params.worldWidth}
        worldHeight={params.worldHeight}
        colorBack={colors[0]}
        colorFront={colors[1]}
        speed={(params.speed || 0) * (params.reverse ? -1 : 1)}
        className="fixed size-full"
      />
    </>
  );
};

export default SpiralWithControls;

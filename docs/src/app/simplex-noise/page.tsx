'use client';

import React, { useState } from 'react';
import { SimplexNoise, type SimplexNoiseParams, simplexNoisePresets } from '@paper-design/shaders-react';
import { ColorPicker } from '@/components/color-picker';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { simplexNoiseMeta, ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { Controllers, ControlSchema, createFolder, renderControlSchema } from '@/components/controllers';
import { useColors } from '@/helpers/use-colors-standalone';

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

const SimplexNoiseWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: firstPreset.colors,
    maxColorCount: simplexNoiseMeta.maxColorCount,
  });

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

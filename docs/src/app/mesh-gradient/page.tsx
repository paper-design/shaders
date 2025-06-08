'use client';

import { useState } from 'react';
import { MeshGradient, meshGradientPresets } from '@paper-design/shaders-react';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { meshGradientMeta, ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { Controllers, ControlSchema, createFolder, renderControlSchema } from '@/components/controllers';
import { ColorPicker } from '@/components/color-picker';
import { useColors } from '@/helpers/use-colors-standalone';

/**
 * You can copy/paste this example to use MeshGradient in your app
 */
const MeshGradientExample = () => {
  return <MeshGradient style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = meshGradientPresets[0].params;

const MeshGradientWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: meshGradientMeta.maxColorCount,
  });

  const [params, setParams] = useState({
    distortion: defaults.distortion,
    swirl: defaults.swirl,
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

  const updateParams = (updates: Partial<typeof params>) => {
    setParams((prev) => ({ ...prev, ...updates }));
  };

  const controlSchema: ControlSchema = {
    Colors: {
      _isFolder: true,
      config: {
        colorCount: {
          value: colors.length,
          min: 1,
          max: meshGradientMeta.maxColorCount,
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
      Object.fromEntries(
        meshGradientPresets.map(
          ({ name, params: { worldWidth: presetWorldWidth, worldHeight: presetWorldHeight, ...preset } }) => [
            name,
            {
              type: 'button' as const,
              onClick: () => {
                const { colors, ...presetParams } = preset;
                setColors(colors);
                updateParams({
                  ...presetParams,
                  worldWidth: presetWorldWidth || 1000,
                  worldHeight: presetWorldHeight || 500,
                });
              },
            },
          ]
        )
      ),
      params,
      updateParams
    ),
  };

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>

      <Controllers>{renderControlSchema(controlSchema)}</Controllers>

      <MeshGradient {...params} colors={colors} className="fixed size-full" />
    </>
  );
};

export default MeshGradientWithControls;

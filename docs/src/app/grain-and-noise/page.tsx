'use client';

import { GrainAndNoise, grainAndNoisePresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, ShaderFitOptions, grainAndNoiseNoiseMeta } from '@paper-design/shaders';
import { useState, useEffect, useCallback } from 'react';
import { useColors } from '@/helpers/use-colors';

/**
 * You can copy/paste this example to use GrainAndNoise in your app
 */
const GrainAndNoiseExample = () => {
  return <GrainAndNoise style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = grainAndNoisePresets[0].params;

const GrainAndNoiseWithControls = () => {
  const [imageIdx, setImageIdx] = useState(0);

  const imageFiles = [
    '001.webp',
    '002.webp',
    '003.webp',
    '004.webp',
    '005.webp',
    '006.webp',
    '007.webp',
    '008.webp',
    '009.webp',
    '0010.webp',
    '0011.webp',
    '0012.webp',
  ] as const;

  const fileName = imageIdx >= 0 ? imageFiles[imageIdx] : null;

  const handleClick = useCallback(() => {
    const randomIdx = Math.floor(Math.random() * imageFiles.length);
    setImageIdx(randomIdx);
  }, []);

  const blendModes = [
    'normal',
    'darken',
    'multiply',
    'color-burn',
    'lighten',
    'screen',
    'color-dodge',
    'overlay',
    'soft-light',
    'hard-light',
    'difference',
    'exclusion',
    'hue',
    'saturation',
    'color',
    'luminosity',
  ] as const satisfies ReadonlyArray<React.CSSProperties['mixBlendMode']>;

  type BlendMode = (typeof blendModes)[number];

  const { blendMode } = useControls('Blend', {
    blendMode: {
      value: 'overlay',
      options: blendModes,
    },
  }) as { blendMode: BlendMode };

  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: grainAndNoiseNoiseMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          grain: { value: defaults.grain, min: 0, max: 1, order: 300 },
          fiber: { value: defaults.fiber, min: 0, max: 1, order: 300 },
          speed: { value: defaults.speed, min: 0, max: 10, order: 351 },
          scale: { value: defaults.scale, min: 0.02, max: 4, order: 400 },
        },
        { order: 1 }
      ),
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      grainAndNoisePresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => {
          const { colors, ...presetParams } = preset;
          setColors(colors);
          setParamsSafe(params, setParams, presetParams);
        }),
      ])
    );
    return {
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(grainAndNoisePresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <img
        src={fileName ? `/images/image-filters/${fileName}` : ''}
        className="fixed left-0 top-0 z-0 h-full w-full object-cover"
      />
      <GrainAndNoise
        onClick={handleClick}
        {...params}
        colors={colors}
        className="fixed size-full"
        style={{ mixBlendMode: blendMode }}
      />
    </>
  );
};

export default GrainAndNoiseWithControls;

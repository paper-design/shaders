'use client';

import { GrainAndNoise, grainAndNoisePresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { toHsla } from '@/helpers/to-hsla';
import { useState, useEffect, useCallback } from 'react';

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
    '068.jpg',
    '086.png',
    '040.jpg',
    '049.jpg',
    '059.jpg',
    '06.jpg',
    '030.jpg',
    '063.jpg',
    '023.jpg',
    '048.jpg',

    '085.png',
    '072.jpg',
    '073.jpg',
    '074.jpg',
    '083.jpg',

    '060.jpg',

    '02.jpg',
    '031.jpg',
    '032.jpg',
    '034.jpg',

    '051.jpg',
    '052.jpg',
    '053.jpg',
    '055.jpg',
    '057.jpg',
    '058.jpg',
    '061.jpg',
    '065.jpg',
    '066.jpg',
    '03.jpg',
    '09.jpg',
    '010.jpg',
    '013.jpg',
    '019.jpg',
    '020.jpg',
    '022.jpg',
    '024.jpg',
    '025.jpg',
    '027.jpg',
    '028.jpg',
    '029.jpg',
    '035.jpg',
    '037.jpg',
    '039.jpg',
    '041.jpg',
    '046.jpg',
    '047.jpg',
  ] as const;

  const fileName = imageIdx >= 0 ? imageFiles[imageIdx] : null;

  const handleClick = useCallback(() => {
    const randomIdx = Math.floor(Math.random() * imageFiles.length);
    setImageIdx(randomIdx);
  }, []);

  const { blendMode } = useControls('Blend', {
    blendMode: {
      value: 'normal',
      options: [
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
      ],
    },
  });

  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      grainAndNoisePresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Parameters: folder(
        {
          colorGrain: { value: toHsla(defaults.colorGrain), order: 100 },
          colorFiber: { value: toHsla(defaults.colorFiber), order: 101 },
          colorDrops: { value: toHsla(defaults.colorDrops), order: 102 },
          grain: { value: defaults.grain, min: 0, max: 1, order: 300 },
          fiber: { value: defaults.fiber, min: 0, max: 1, order: 300 },
          drops: { value: defaults.drops, min: 0, max: 1, order: 300 },
          dropsSeed: { value: defaults.dropsSeed, min: 0, max: 10, order: 351 },
        },
        { order: 1 }
      ),
      Transform: folder(
        {
          scale: { value: defaults.scale, min: 0.5, max: 2, order: 400 },
          rotation: { value: defaults.rotation, min: 0, max: 360, order: 401 },
          offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 402 },
          offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 403 },
        },
        {
          order: 2,
          collapsed: true,
        }
      ),
      Fit: folder(
        {
          fit: { value: defaults.fit, options: Object.keys(ShaderFitOptions) as ShaderFit[], order: 404 },
          worldWidth: { value: 0, min: 0, max: 5120, order: 405 },
          worldHeight: { value: 0, min: 0, max: 5120, order: 406 },
          originX: { value: defaults.originX, min: 0, max: 1, order: 407 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 408 },
        },
        {
          order: 3,
          collapsed: true,
        }
      ),
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
      <img src={fileName ? `/images/${fileName}` : ''} className="fixed left-0 top-0 z-0 h-full w-full object-cover" />
      <GrainAndNoise
        onClick={handleClick}
        {...params}
        className="fixed inset-0 size-full"
        style={{ mixBlendMode: blendMode }}
      />
    </>
  );
};

export default GrainAndNoiseWithControls;

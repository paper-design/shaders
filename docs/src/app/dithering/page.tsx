'use client';

import { Dithering, type DitheringParams, ditheringPresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use Dithering in your app
 */
const DitheringExample = () => {
  return (
    <Dithering
      color1="#56758f"
      color2="#91be6f"
      scale={1}
      ditheringRes={13}
      speed={0.5}
      seed={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = ditheringPresets[0].params;

const DitheringWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: DitheringParams = Object.fromEntries(
      ditheringPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 100 },
          color2: { value: defaults.color2, order: 101 },
          scale: { value: defaults.scale, min: 0.1, max: 1.9, order: 200 },
          ditheringRes: { value: defaults.ditheringRes, min: 1, max: 5, step: 1, order: 300 },
          numColors: { value: defaults.numColors, min: 1, max: 15, step: 1, order: 300 },
          pxSize: { value: defaults.pxSize, min: 1, max: 100,  order: 300 },
          speed: { value: defaults.speed, min: 0, max: 1, order: 400 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(ditheringPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Dithering {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default DitheringWithControls;

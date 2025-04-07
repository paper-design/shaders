'use client';

import { BorderGradient, type BorderGradientParams, borderGradientPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use BorderGradient in your app
 */
const BorderGradientExample = () => {
  return <BorderGradient style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = borderGradientPresets[0].params;

const BorderGradientWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: BorderGradientParams = Object.fromEntries(
      borderGradientPresets.map((preset) => [
        preset.name,
        button(() => setParamsSafe(params, setParams, preset.params)),
      ])
    );

    return {
      Parameters: folder(
        {
          colorBack: { value: defaults.colorBack, order: 100 },
          color1: { value: defaults.color1, order: 101 },
          color2: { value: defaults.color2, order: 102 },
          color3: { value: defaults.color3, order: 103 },
          blur: { value: defaults.blur, min: 0, max: 0.5, order: 206 },
          grainDistortion: { value: defaults.grainDistortion, min: 0, max: 1, order: 206 },
          sandGrain: { value: defaults.sandGrain, min: 0, max: 1, order: 206 },
          shape: { value: defaults.shape, min: 1, max: 8, step: 1, order: 303 },
          speed: {value: defaults.speed, min: 0, max: 6, order: 400},
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(borderGradientPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <BorderGradient {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default BorderGradientWithControls;

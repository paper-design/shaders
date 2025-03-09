'use client';

import { BorderPulsing, type BorderPulsingParams, borderPulsingPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use BorderPulsing in your app
 */
const BorderPulsingExample = () => {
  return <BorderPulsing style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = borderPulsingPresets[0].params;

const BorderPulsingWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: BorderPulsingParams = Object.fromEntries(
      borderPulsingPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );

    return {
      Parameters: folder(
        {
          colorBack: { value: defaults.colorBack, order: 100 },
          color1: { value: defaults.color1, order: 101 },
          color2: { value: defaults.color2, order: 102 },
          color3: { value: defaults.color3, order: 103 },
          pxSize: { value: defaults.pxSize, min: 0, max: 250, order: 200 },
          intensity: { value: defaults.intensity, min: 0, max: 5, order: 201 },
          pulsing: { value: defaults.pulsing, min: 0, max: 1, order: 202 },
          spotsNumber: { value: defaults.spotsNumber, min: 1, max: 10, order: 203 },
          innerShapeIntensity: { value: defaults.innerShapeIntensity, min: 0, max: 1, order: 204 },
          grain: { value: defaults.grain, min: 0, max: 1, order: 206 },
          speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
          seed: { value: defaults.seed, min: 0, max: 10000, order: 401 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(borderPulsingPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <BorderPulsing {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default BorderPulsingWithControls;

'use client';

import { RadialSwirl, type RadialSwirlParams, radialSwirlPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use RadialSwirl in your app
 */
const RadialSwirlExample = () => {
  return (
    <RadialSwirl
      color1="#6a5496"
      color2="#9b8ab8"
      color3="#f5d03b"
      radialSwirl={1}
      speed={1}
      seed={0}
      dotSize={1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = radialSwirlPresets[0].params;

const RadialSwirlWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: RadialSwirlParams = Object.fromEntries(
      radialSwirlPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1 },
          color2: { value: defaults.color2 },
          color3: { value: defaults.color3 },
          seed: { value: defaults.seed, min: 0, max: 9999 },
          speed: { value: defaults.speed, min: -1, max: 1 },
          density: { value: defaults.density, min: 0, max: 2 },
          dotSize: { value: defaults.dotSize, min: -1, max: 2 },
          focus: { value: defaults.focus, min: 0, max: 2 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(radialSwirlPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <RadialSwirl {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default RadialSwirlWithControls;

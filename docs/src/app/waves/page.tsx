'use client';

import {
  Waves,
  type WavesParams,
  wavesPresets,
} from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use Waves in your app
 */
// const WavesExample = () => {
//   return (
//     <Waves
//       color1="#577590"
//       color2="#90BE6D"
//       style={{ position: 'fixed', width: '100%', height: '100%' }}
//     />
//   );
// };

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = wavesPresets[0].params;

const WavesWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: WavesParams = Object.fromEntries(
      wavesPresets.map((preset) => [
        preset.name,
        button(() => setParamsSafe(params, setParams, preset.params)),
      ])
    );
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1 },
          color2: { value: defaults.color2 },
          speed: { value: defaults.speed, min: -1.5, max: 1.5 },
          scale: { value: defaults.scale, min: .1, max: 4 },
          frequency: { value: defaults.frequency, min: 0, max: 2 },
          amplitude: { value: defaults.amplitude, min: 0, max: 1 },
          dutyCycle: { value: defaults.dutyCycle, min: 0, max: 1 },
          spacing: { value: defaults.spacing, min: 0, max: 16 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(wavesPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Waves {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default WavesWithControls;

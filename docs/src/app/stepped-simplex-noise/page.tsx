'use client';

import {
  SteppedSimplexNoise,
  type SteppedSimplexNoiseParams,
  steppedSimplexNoisePresets,
} from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use SteppedSimplexNoise in your app
 */
// const SteppedSimplexNoiseExample = () => {
//   return (
//     <SteppedSimplexNoise
//       color1="#577590"
//       color2="#90BE6D"
//       color3="#F94144"
//       color4="#F9C74F"
//       color5="#ffffff"
//       scale={0.5}
//       speed={1}
//       stepsNumber={12}
//       style={{ position: 'fixed', width: '100%', height: '100%' }}
//     />
//   );
// };

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = steppedSimplexNoisePresets[0].params;

const SteppedSimplexNoiseWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: SteppedSimplexNoiseParams = Object.fromEntries(
      steppedSimplexNoisePresets.map((preset) => [
        preset.name,
        button(() => setParamsSafe(params, setParams, preset.params)),
      ])
    );
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 1 },
          color2: { value: defaults.color2, order: 2 },
          color3: { value: defaults.color3, order: 3 },
          color4: { value: defaults.color4, order: 4 },
          color5: { value: defaults.color5, order: 5 },
          speed: { value: defaults.speed, order: 6, min: -1.5, max: 1.5 },
          scale: { value: defaults.scale, order: 7, min: .1, max: 1.9 },
          stepsNumber: { value: defaults.stepsNumber, order: 8, min: 2, max: 40 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(steppedSimplexNoisePresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <SteppedSimplexNoise {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default SteppedSimplexNoiseWithControls;

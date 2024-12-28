'use client';

import { SmokeRing, type SmokeRingParams, smokeRingPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use SmokeRing in your app
 */
// const SmokeRingExample = () => {
//   return (
//     <SmokeRing
//       colorBack="#6a5496"
//       color1="#9b8ab8"
//       color2="#f5d03b"
//       scale={1}
//       noiseScale={1}
//       speed={1.2}
//       thickness={0.3}
//       style={{ position: 'fixed', width: '100%', height: '100%' }}
//     />
//   );
// };

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = smokeRingPresets[0].params;

const SmokeRingWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: SmokeRingParams = Object.fromEntries(
      smokeRingPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder(
        {
          colorBack: { value: defaults.colorBack, order: 1 },
          color1: { value: defaults.color1, order: 2 },
          color2: { value: defaults.color2, order: 3 },
          scale: { value: defaults.scale, order: 4, min: .5, max: 1.5 },
          speed: { value: defaults.speed, order: 5, min: -4, max: 4 },
          thickness: { value: defaults.thickness, order: 6, min: 0.1, max: 2 },
          noiseScale: { value: defaults.thickness, order: 7, min: 0.01, max: 5 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(smokeRingPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <SmokeRing {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default SmokeRingWithControls;

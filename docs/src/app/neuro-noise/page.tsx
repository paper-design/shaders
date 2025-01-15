'use client';

import { NeuroNoise, type NeuroNoiseParams, neuroNoisePresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use NeuroNoise in your app
 */
// const NeuroNoiseExample = () => {
//   return (
//     <NeuroNoise
//       colorFront="#c3a3ff"
//       colorBack="#030208"
//       speed={1}
//       scale={1}
//       brightness={1.3}
//       style={{ position: 'fixed', width: '100%', height: '100%' }}
//     />
//   );
// };

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = neuroNoisePresets[0].params;

const NeuroNoiseWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: NeuroNoiseParams = Object.fromEntries(
      neuroNoisePresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );

    return {
      Parameters: folder(
        {
          colorFront: { value: defaults.colorFront, order: 1 },
          colorBack: { value: defaults.colorBack, order: 2 },
          scale: { value: defaults.scale, order: 3, min: 0.3, max: 2 },
          speed: { value: defaults.speed, order: 4, min: -3, max: 3 },
          brightness: { value: defaults.brightness, order: 5, min: 0.8, max: 2 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(neuroNoisePresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <NeuroNoise {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default NeuroNoiseWithControls;

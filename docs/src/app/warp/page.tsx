'use client';

import { Warp, type WarpParams, warpPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use Warp in your app
 */
// <Warp
//     color1="#577590"
//     color2="#90BE6D"
//     scale={1}
//     speed={1}
//     octaveCount={10}
//     persistence={0.5}
//     lacunarity={2}
//     contour={.5}
//     proportion={.5}
//     style={{position: 'fixed', width: '100%', height: '100%'}}
// />

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = warpPresets[0].params;

const WarpWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: WarpParams = Object.fromEntries(
      warpPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );

    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 1 },
          color2: { value: defaults.color2, order: 2 },
          speed: { value: defaults.speed, order: 3, min: 0, max: 0.5 },
          seed: { value: defaults.seed, order: 4, min: 0, max: 9999 },
          scale: { value: defaults.scale, order: 5, min: 0, max: 2 },
          octaveCount: { value: defaults.octaveCount, order: 6, min: 1, step: 1, max: 8 },
          persistence: { value: defaults.persistence, order: 7, min: 0.3, max: 1 },
          lacunarity: { value: defaults.lacunarity, order: 8, min: 1.5, max: 3 },
          contour: { value: defaults.contour, order: 9, min: 0, max: 1 },
          proportion: { value: defaults.contour, order: 10, min: 0, max: 1 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(warpPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Warp {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default WarpWithControls;

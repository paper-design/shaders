'use client';

import { MeshGradient, type MeshGradientParams, meshGradientPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';

/**
 * You can copy/paste this example to use MeshGradient in your app
 */
// const MeshGradientExample = () => {
//   return (
//     <MeshGradient
//       color1="#6a5496"
//       color2="#9b8ab8"
//       color3="#f5d03b"
//       color4="#e48b97"
//       speed={0.2}
//       style={{ position: 'fixed', width: '100%', height: '100%' }}
//     />
//   );
// };

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = meshGradientPresets[0].params;

const MeshGradientWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: MeshGradientParams = Object.fromEntries(
      meshGradientPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );

    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 1 },
          color2: { value: defaults.color2, order: 2 },
          color3: { value: defaults.color3, order: 3 },
          color4: { value: defaults.color4, order: 4 },
          speed: { value: defaults.speed, order: 5, min: -1, max: 1 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(meshGradientPresets, params);

  return (
    <>
      <Link href="/">
        <button className="fixed top-2 left-2 bg-white z-10 px-2 py-1 rounded-md">Back</button>
      </Link>
      <MeshGradient {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default MeshGradientWithControls;

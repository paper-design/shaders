'use client';

import { BackButton } from '@/components/back-button';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { Voronoi, type VoronoiParams, voronoiPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import Link from 'next/link';

/**
 * You can copy/paste this example to use Voronoi in your app
 */
// const VoronoiExample = () => {
//     return (
//         <Voronoi
//             colorEdges="#6a5496"
//             colorCell1="#9b8ab8"
//             colorCell2="#9b8ab8"
//             colorMid1="#9b8ab8"
//             colorMid2="#f5d03b"
//             scale={11}
//             distance={0.25}
//             edgesSize={0.2}
//             edgesSharpness={0.}
//             middleSize={0.2}
//             middleSharpness={0.2}
//             speed={1}
//             seed={0}
//             style={{position: 'fixed', width: '100%', height: '100%'}}
//         />
//     );
// };

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = voronoiPresets[0].params;

const VoronoiWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: VoronoiParams = Object.fromEntries(
      voronoiPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder(
        {
            colorEdges: {value: defaults.colorEdges},
            colorCell1: {value: defaults.colorCell1},
            colorCell2: {value: defaults.colorCell2},
            colorMid1: {value: defaults.colorMid1},
            colorMid2: {value: defaults.colorMid2},
            scale: {value: defaults.scale, min: .15, max: 3},
            distance: {value: defaults.distance, min: 0, max: .5},
            edgesSize: {value: defaults.edgesSize, min: 0, max: 1},
            edgesSharpness: {value: defaults.edgesSharpness, min: 0, max: 1},
            middleSize: {value: defaults.middleSize, min: 0, max: 1},
            middleSharpness: {value: defaults.middleSharpness, min: 0, max: 1},
            seed: {value: defaults.seed, min: 0, max: 9999},
            speed: {value: defaults.speed, min: 0, max: 1},
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(voronoiPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Voronoi {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default VoronoiWithControls;

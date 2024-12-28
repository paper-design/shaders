import { Voronoi, type VoronoiParams, voronoiPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { useEffect } from 'react';
import { setParamsSafe, useResetLevaParams } from '../example-helpers/use-reset-leva-params';
import { usePresetHighlight } from '../example-helpers/use-preset-highlight';

/**
 * You can copy/paste this example to use Voronoi in your app
 */
const VoronoiExample = () => {
  return (
    <Voronoi
      colorEdges="#6a5496"
      colorCell1="#9b8ab8"
      colorCell2="#9b8ab8"
      colorMid1="#9b8ab8"
      colorMid2="#f5d03b"
      scale={11}
      edgeWidth={0.2}
      midSize={0.2}
      dotSharpness={0.2}
      speed={1}
      seed={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = voronoiPresets[0].params;

export const VoronoiWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: VoronoiParams = Object.fromEntries(
      voronoiPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder(
        {
          colorEdges: { value: defaults.colorEdges, order: 1 },
          colorCell1: { value: defaults.colorCell1, order: 1 },
          colorCell2: { value: defaults.colorCell2, order: 1 },
          colorMid1: { value: defaults.colorMid1, order: 1 },
          colorMid2: { value: defaults.colorMid2, order: 1 },
          scale: { value: defaults.scale, order: 4, min: 1, max: 20 },
          edgeWidth: { value: defaults.edgeWidth, order: 5, min: 0, max: 1 },
          midSize: { value: defaults.midSize, order: 6, min: 0, max: 1 },
          dotSharpness: { value: defaults.dotSharpness, order: 7, min: 0, max: 1 },
          seed: { value: defaults.seed, order: 8, min: 0, max: 9999 },
          speed: { value: defaults.speed, order: 9, min: 0, max: 1 },
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

  return <Voronoi {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

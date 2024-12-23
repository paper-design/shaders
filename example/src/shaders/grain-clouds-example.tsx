import { GrainClouds, type GrainCloudsParams, grainCloudsPresets } from '@paper-design/shaders-react';
import { button, folder, useControls } from 'leva';
import { setParamsSafe, useResetLevaParams } from '../example-helpers/use-reset-leva-params';

/**
 * You can copy/paste this example to use GrainClouds in your app
 */
const GrainCloudsExample = () => {
  return <GrainClouds color1="#000" color2="#fff" style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = grainCloudsPresets[0].params;

export const GrainCloudsWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: GrainCloudsParams = Object.fromEntries(
      grainCloudsPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 1 },
          color2: { value: defaults.color2, order: 2 },
          scale: { value: defaults.scale, order: 3, min: 0, max: 1 },
          grainAmount: { value: defaults.grainAmount, order: 4, min: 0, max: 1 },
          speed: { value: defaults.speed, order: 5, min: 0, max: 2 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  return <GrainClouds {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

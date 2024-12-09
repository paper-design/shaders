import { GrainClouds, type GrainCloudsParams, grainCloudsPresets } from '@paper-design/shaders-react';
import { button, folder, useControls } from 'leva';
import { useEffect } from 'react';

/**
 * You can copy/paste this example to use GrainClouds in your app
 */
const GrainCloudsExample = () => {
  return <GrainClouds color1="#000" color2="#fff" style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaultParams = grainCloudsPresets[0].params;

export const GrainCloudsWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: GrainCloudsParams = Object.fromEntries(
      grainCloudsPresets.map((preset) => [preset.name, button(() => setParams(preset.params))])
    );
    return {
      Parameters: folder(
        {
          color1: { value: defaultParams.color1, order: 1 },
          color2: { value: defaultParams.color2, order: 2 },
          noiseScale: { value: defaultParams.noiseScale, order: 3, min: 0, max: 1 },
          noiseSpeed: { value: defaultParams.noiseSpeed, order: 4, min: 0, max: 1 },
          grainAmount: { value: defaultParams.grainAmount, order: 5, min: 0, max: 1 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useEffect(() => {
    setParams(defaultParams);
  }, []);

  return <GrainClouds {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

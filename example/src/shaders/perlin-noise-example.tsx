import {
  PerlinNoise,
  type PerlinNoiseParams,
  perlinNoisePresets,
} from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { useEffect } from 'react';

/**
 * You can copy/paste this example to use PerlinNoise in your app
 */
const PerlinNoiseExample = () => {
  return (
    <PerlinNoise
      color1="#577590"
      color2="#90BE6D"
      scale={0.5}
      speed={1}
      frequency={12}
      octaveCount={10}
      persistence={0.5}
      lacunarity={2}
      perlinSeed={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = perlinNoisePresets[0].params;

export const PerlinNoiseWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: PerlinNoiseParams = Object.fromEntries(
      perlinNoisePresets.map((preset) => [preset.name, button(() => setParams(preset.params))])
    );
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 1 },
          color2: { value: defaults.color2, order: 2 },
          speed: { value: defaults.speed, order: 4, min: -0.5, max: 0.5 },
          scale: { value: defaults.scale, order: 5, min: 0, max: 2 },
          frequency: { value: defaults.frequency, order: 6, min: .1, max: 10 },
          octaveCount: { value: defaults.octaveCount, order: 7, min: 1, step: 1, max: 16 },
          persistence: { value: defaults.persistence, order: 8, min: .3, max: 1 },
          lacunarity: { value: defaults.lacunarity, order: 9, min: 1.5, max: 3 },
          perlinSeed: { value: defaults.perlinSeed, order: 10, min: 0, max: 100 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useEffect(() => {
    setParams(defaults);
  }, []);

  return <PerlinNoise {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

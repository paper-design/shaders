import { Metaballs, type MetaballsParams, metaballsPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { useEffect } from 'react';

/**
 * You can copy/paste this example to use Metaballs in your app
 */
const MetaballsExample = () => {
  return (
    <Metaballs
      color1="#6a5496"
      color2="#9b8ab8"
      color3="#f5d03b"
      scale={11}
      speed={1}
      seed={0}
      visibilityRange={0}
      dotSize={1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = metaballsPresets[0].params;

export const MetaballsWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: MetaballsParams = Object.fromEntries(
      metaballsPresets.map((preset) => [preset.name, button(() => setParams(preset.params))])
    );
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 1 },
          color2: { value: defaults.color2, order: 2 },
          color3: { value: defaults.color3, order: 3 },
          speed: { value: defaults.speed, order: 4, min: 0, max: 1 },
          seed: { value: defaults.speed, order: 5, min: 0, max: 10 },
          scale: { value: defaults.scale, order: 6, min: 1, max: 20 },
          dotSize: { value: defaults.scale, order: 7, min: 0, max: 1 },
          visibilityRange: { value: defaults.scale, order: 8, min: .05, max: 1 },
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

  return <Metaballs {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

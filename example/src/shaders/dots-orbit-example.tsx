import { DotsOrbit, type DotsOrbitParams, dotsOrbitPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { useEffect } from 'react';

/**
 * You can copy/paste this example to use DotsOrbit in your app
 */
const DotsOrbitExample = () => {
  return (
    <DotsOrbit
      color1="#6a5496"
      color2="#9b8ab8"
      color3="#f5d03b"
      color4="#e48b97"
      scale={11}
      dotSize={0.15}
      dotSizeRange={0.01}
      speed={3}
      spreading={0.1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = dotsOrbitPresets[0].params;

export const DotsOrbitWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: DotsOrbitParams = Object.fromEntries(
      dotsOrbitPresets.map((preset) => [preset.name, button(() => setParams(preset.params))])
    );
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 1 },
          color2: { value: defaults.color2, order: 2 },
          color3: { value: defaults.color3, order: 3 },
          color4: { value: defaults.color4, order: 4 },
          speed: { value: defaults.speed, order: 5, min: 0, max: 6 },
          scale: { value: defaults.scale, order: 6, min: 1, max: 20 },
          dotSize: { value: defaults.dotSize, order: 7, min: 0.001, max: 0.5 },
          dotSizeRange: { value: defaults.dotSizeRange, order: 8, min: 0, max: 0.3 },
          spreading: { value: defaults.dotSizeRange, order: 9, min: 0, max: 0.5 },
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

  return <DotsOrbit {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

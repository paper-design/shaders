import { SmokeRing, type SmokeRingParams, smokeRingPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { useEffect } from 'react';

/**
 * You can copy/paste this example to use SmokeRing in your app
 */
const SmokeRingExample = () => {
  return (
    <SmokeRing
      colorBack="#6a5496"
      color1="#9b8ab8"
      color2="#f5d03b"
      noiseScale={1}
      speed={1.2}
      thickness={0.3}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaultParams = smokeRingPresets[0].params;

export const SmokeRingWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: SmokeRingParams = Object.fromEntries(
      smokeRingPresets.map((preset) => [preset.name, button(() => setParams(preset.params))])
    );
    return {
      Parameters: folder(
        {
          colorBack: { value: defaultParams.colorBack, order: 1 },
          color1: { value: defaultParams.color1, order: 2 },
          color2: { value: defaultParams.color2, order: 3 },
          speed: { value: defaultParams.speed, order: 4, min: 0, max: 1 },
          thickness: { value: defaultParams.thickness, order: 5, min: 0.1, max: 2 },
          noiseScale: { value: defaultParams.thickness, order: 6, min: 0.01, max: 5 },
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

  return <SmokeRing {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

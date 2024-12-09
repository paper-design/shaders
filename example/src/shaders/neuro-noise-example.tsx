import { NeuroNoise, type NeuroNoiseParams, neuroNoisePresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { useEffect } from 'react';

/**
 * You can copy/paste this example to use NeuroNoise in your app
 */
const NeuroNoiseExample = () => {
  return (
    <NeuroNoise
      colorFront="#c3a3ff"
      colorBack="#030208"
      speed={1}
      scale={1}
      brightness={1.3}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaultParams = neuroNoisePresets[0].params;

export const NeuroNoiseWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: NeuroNoiseParams = Object.fromEntries(
      neuroNoisePresets.map((preset) => [preset.name, button(() => setParams(preset.params))])
    );

    return {
      Parameters: folder(
        {
          colorFront: { value: defaultParams.colorFront, order: 1 },
          colorBack: { value: defaultParams.colorBack, order: 2 },
          scale: { value: defaultParams.scale, order: 3, min: 0.5, max: 3 },
          speed: { value: defaultParams.speed, order: 4, min: 0, max: 3 },
          brightness: { value: defaultParams.brightness, order: 5, min: 0.8, max: 2 },
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

  return <NeuroNoise {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

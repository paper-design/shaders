import { useControls, buttonGroup } from 'leva';
import { NeuroNoise, neuroNoisePresets } from '@paper-design/shaders-react';

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
  const [params, setParams] = useControls(() => ({
    colorFront: defaultParams.colorFront,
    colorBack: defaultParams.colorBack,
    scale: { min: 0.5, max: 3, value: defaultParams.scale },
    speed: { min: 0, max: 3, value: defaultParams.speed },
    brightness: { min: 0.8, max: 2, value: defaultParams.brightness },
    Presets: buttonGroup(
      Object.fromEntries(neuroNoisePresets.map((preset) => [preset.name, () => setParams(preset.params)]))
    ),
  }));

  return <NeuroNoise {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

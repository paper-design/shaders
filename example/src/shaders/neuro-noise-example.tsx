import { useState, useEffect } from 'react';
import GUI from 'lil-gui';
import { NeuroNoise, neuroNoisePresets, type NeuroNoiseParams } from '@paper-design/shaders-react';

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
export const NeuroNoiseWithControls = () => {
  const [params, setParams] = useState<NeuroNoiseParams>({ ...neuroNoisePresets[0].params });

  useEffect(() => {
    const gui = new GUI({ title: 'Neuro Noise' });

    const updateParam = (key: string, value: any) => {
      setParams((prev) => ({ ...prev, [key]: value }));
    };

    const presetsFolder = gui.addFolder('Presets');
    const paramsFolder = gui.addFolder('Parameters');

    const presets = Object.fromEntries(
      neuroNoisePresets.map((preset) => [
        preset.name,
        () => {
          Object.entries(preset.params).forEach(([key, value]) => {
            const controller = paramsFolder.controllers.find((c) => c.property === key);
            controller?.setValue(value);
          });
        },
      ])
    );

    Object.keys(presets).forEach((presetName) => {
      presetsFolder.add(presets, presetName);
    });

    paramsFolder.add(params, 'scale', 0.5, 3).onChange((value: number) => updateParam('scale', value));
    paramsFolder.add(params, 'speed', 0, 3).onChange((value: number) => updateParam('speed', value));
    paramsFolder.add(params, 'brightness', 0.8, 2).onChange((value: number) => updateParam('brightness', value));

    const colorKeys = ['colorFront', 'colorBack'] as const;
    colorKeys.forEach((colorKey) => {
      paramsFolder.addColor(params, colorKey).onChange((value: string) => updateParam(colorKey, value));
    });

    return () => {
      gui.destroy();
    };
  }, []);

  return <NeuroNoise {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

import {useState, useEffect} from 'react';
import GUI from 'lil-gui';
import {NeuroNoise, neuroNoiseDefaults, type NeuroNoiseProps} from '@paper-design/shaders-react';

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
          style={{position: 'fixed', width: '100%', height: '100%'}}
      />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */
export const NeuroNoiseWithControls = () => {
  const [uniforms, setUniforms] = useState<NeuroNoiseProps>(neuroNoiseDefaults);

  // Add controls
  useEffect(() => {
    const gui = new GUI();

    const updateUniforms = (key: string, value: any) => {
      setUniforms((prev) => ({...prev, [key]: value}));
    };

    gui.add(uniforms, 'scale', .5, 2).onChange((value: number) => updateUniforms('scale', value));
    gui.add(uniforms, 'speed', 0, 3).onChange((value: number) => updateUniforms('speed', value));
    gui.add(uniforms, 'brightness', .8, 2).onChange((value: number) => updateUniforms('brightness', value));

    const colorKeys = ['colorFront', 'colorBack'] as const;
    colorKeys.forEach((colorKey) => {
      gui.addColor(uniforms, colorKey).onChange((value: string) => updateUniforms(colorKey, value));
    });

    return () => {
      gui.destroy();
    };
  }, []);

  return <NeuroNoise {...uniforms} style={{position: 'fixed', width: '100%', height: '100%'}}/>;
};
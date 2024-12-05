import { useState, useEffect } from 'react';
import GUI from 'lil-gui';
import {
  SteppedSimplexNoise,
  steppedSimplexNoiseDefaults,
  type SteppedSimplexNoiseProps,
} from '@paper-design/shaders-react';

/**
 * You can copy/paste this example to use SteppedSimplexNoise in your app
 */
const SteppedSimplexNoiseExample = () => {
  return (
    <SteppedSimplexNoise
      color1="#577590"
      color2="#90BE6D"
      color3="#F94144"
      color4="#F9C74F"
      color5="#ffffff"
      scale={.5}
      speed={1}
      stepsNumber={12}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */
export const SteppedSimplexNoiseWithControls = () => {
  const [uniforms, setUniforms] = useState<SteppedSimplexNoiseProps>(steppedSimplexNoiseDefaults);

  // Add controls
  useEffect(() => {
    const gui = new GUI();

    const updateUniforms = (key: string, value: any) => {
      setUniforms((prev) => ({ ...prev, [key]: value }));
    };

    gui.add(uniforms, 'scale', 0.2, 2.5).onChange((value: number) => updateUniforms('scale', value));
    gui.add(uniforms, 'speed', 0, 3).onChange((value: number) => updateUniforms('speed', value));
    gui.add(uniforms, 'stepsNumber', 2, 40, 1).onChange((value: number) => updateUniforms('stepsNumber', value));

    const colorKeys = ['color1', 'color2', 'color3', 'color4', 'color5'] as const;
    colorKeys.forEach((colorKey) => {
      gui.addColor(uniforms, colorKey).onChange((value: string) => updateUniforms(colorKey, value));
    });

    return () => {
      gui.destroy();
    };
  }, []);

  return <SteppedSimplexNoise {...uniforms} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

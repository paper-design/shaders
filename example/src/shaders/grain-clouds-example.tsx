import { GrainClouds, grainCloudsDefaults, type GrainCloudsProps } from '@paper-design/shaders-react';
import { useState, useEffect } from 'react';
import GUI from 'lil-gui';

/**
 * You can copy/paste this example to use GrainClouds in your app
 */
const GrainCloudsExample = () => {
  return <GrainClouds color1="#000" color2="#fff" style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */
export const GrainCloudsWithControls = () => {
  const [uniforms, setUniforms] = useState<GrainCloudsProps>({ ...grainCloudsDefaults });

  // Add controls
  useEffect(() => {
    const gui = new GUI();

    const updateUniforms = (key: string, value: any) => {
      setUniforms((prev) => ({ ...prev, [key]: value }));
    };

    // Noise scale
    gui.add(uniforms, 'noiseScale', 0, 1).onChange((value: number) => updateUniforms('noiseScale', value));

    // Noise speed
    gui.add(uniforms, 'noiseSpeed', 0, 1).onChange((value: number) => updateUniforms('noiseSpeed', value));

    // Grain amount
    gui.add(uniforms, 'grainAmount', 0, 1).onChange((value: number) => updateUniforms('grainAmount', value));

    // Colors
    const colorKeys = ['color1', 'color2'] as const;
    colorKeys.forEach((colorKey) => {
      gui.addColor(uniforms, colorKey).onChange((value: string) => updateUniforms(colorKey, value));
    });

    return () => {
      gui.destroy();
    };
  }, []);

  return <GrainClouds {...uniforms} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

import { useState, useEffect } from 'react';
import GUI from 'lil-gui';
import { CloudyRing, cloudyRingDefaults, type CloudyRingProps } from '@paper-design/shaders-react';

/**
 * You can copy/paste this example to use CloudyRing in your app
 */
const CloudyRingExample = () => {
  return (
    <CloudyRing
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
export const CloudyRingWithControls = () => {
  const [uniforms, setUniforms] = useState<CloudyRingProps>(cloudyRingDefaults);

  // Add controls
  useEffect(() => {
    const gui = new GUI();

    const updateUniforms = (key: string, value: any) => {
      setUniforms((prev) => ({ ...prev, [key]: value }));
    };

    gui.add(uniforms, 'noiseScale', 0.01, 5).onChange((value: number) => updateUniforms('noiseScale', value));
    gui.add(uniforms, 'speed', 0, 5).onChange((value: number) => updateUniforms('speed', value));
    gui.add(uniforms, 'thickness', 0.1, 0.6).onChange((value: number) => updateUniforms('thickness', value));

    const colorKeys = ['colorBack', 'color1', 'color2'] as const;
    colorKeys.forEach((colorKey) => {
      gui.addColor(uniforms, colorKey).onChange((value: string) => updateUniforms(colorKey, value));
    });

    return () => {
      gui.destroy();
    };
  }, []);

  return <CloudyRing {...uniforms} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

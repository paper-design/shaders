import { useState, useEffect } from 'react';
import GUI from 'lil-gui';
import { DotsPattern, dotsPatternDefaults, type DotsPatternProps } from '@paper-design/shaders-react';

/**
 * You can copy/paste this example to use DotsPattern in your app
 */
const DotsPatternExample = () => {
  return (
    <DotsPattern
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
export const DotsPatternWithControls = () => {
  const [uniforms, setUniforms] = useState<DotsPatternProps>(dotsPatternDefaults);

  // Add controls
  useEffect(() => {
    const gui = new GUI();

    const updateUniforms = (key: string, value: any) => {
      setUniforms((prev) => ({ ...prev, [key]: value }));
    };

    gui.add(uniforms, 'scale', 1, 20).onChange((value: number) => updateUniforms('scale', value));
    gui.add(uniforms, 'dotSize', 0.001, 0.5).onChange((value: number) => updateUniforms('dotSize', value));
    gui.add(uniforms, 'dotSizeRange', 0, 0.3).onChange((value: number) => updateUniforms('dotSizeRange', value));
    gui.add(uniforms, 'speed', 0, 6).onChange((value: number) => updateUniforms('speed', value));
    gui.add(uniforms, 'spreading', 0, 0.5).onChange((value: number) => updateUniforms('spreading', value));

    const colorKeys = ['color1', 'color2', 'color3', 'color4'] as const;
    colorKeys.forEach((colorKey) => {
      gui.addColor(uniforms, colorKey).onChange((value: string) => updateUniforms(colorKey, value));
    });

    return () => {
      gui.destroy();
    };
  }, []);

  return <DotsPattern {...uniforms} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

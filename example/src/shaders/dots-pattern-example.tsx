import { useState, useEffect } from 'react';
import GUI from 'lil-gui';
import { DotsPattern, dotsPatternDefaults, type DotsPatternProps } from '@paper-design/shaders-react';

/**
 * You can copy/paste this example to use DotsPattern in your app
 */
const DotsPatternExample = () => {
  return (
    <DotsPattern
      hue={0.5}
      hueRange={0.1}
      saturation={0.6}
      brightness={0.6}
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

    gui.add(uniforms, 'hue', 0, 1).onChange((value: number) => updateUniforms('hue', value));
    gui.add(uniforms, 'hueRange', 0, 1).onChange((value: number) => updateUniforms('hueRange', value));
    gui.add(uniforms, 'saturation', 0, 1).onChange((value: number) => updateUniforms('saturation', value));
    gui.add(uniforms, 'brightness', 0, 1).onChange((value: number) => updateUniforms('brightness', value));
    gui.add(uniforms, 'scale', 1, 100).onChange((value: number) => updateUniforms('scale', value));
    gui.add(uniforms, 'dotSize', 0.001, 0.5).onChange((value: number) => updateUniforms('dotSize', value));
    gui.add(uniforms, 'dotSizeRange', 0, 0.3).onChange((value: number) => updateUniforms('dotSizeRange', value));
    gui.add(uniforms, 'speed', 0, 6).onChange((value: number) => updateUniforms('speed', value));
    gui.add(uniforms, 'spreading', 0, 0.5).onChange((value: number) => updateUniforms('spreading', value));

    return () => {
      gui.destroy();
    };
  }, []);

  return <DotsPattern {...uniforms} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

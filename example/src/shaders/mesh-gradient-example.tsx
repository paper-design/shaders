import { useState, useEffect } from 'react';
import GUI from 'lil-gui';
import { MeshGradient, meshGradientDefaults, type MeshGradientProps } from '@paper-design/shaders-react';

/**
 * You can copy/paste this example to use MeshGradient in your app
 */
const MeshGradientExample = () => {
  return (
    <MeshGradient
      color1="#6a5496"
      color2="#9b8ab8"
      color3="#f5d03b"
      color4="#e48b97"
      speed={0.2}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */
export const MeshGradientWithControls = () => {
  const [uniforms, setUniforms] = useState<MeshGradientProps>(meshGradientDefaults);

  // Add controls
  useEffect(() => {
    const gui = new GUI();

    const updateUniforms = (key: string, value: any) => {
      setUniforms((prev) => ({ ...prev, [key]: value }));
    };

    // Speed
    gui.add(uniforms, 'speed', 0, 1).onChange((value: number) => updateUniforms('speed', value));

    // Colors
    const colorKeys = ['color1', 'color2', 'color3', 'color4'] as const;
    colorKeys.forEach((colorKey) => {
      gui.addColor(uniforms, colorKey).onChange((value: string) => updateUniforms(colorKey, value));
    });

    return () => {
      gui.destroy();
    };
  }, []);

  return <MeshGradient {...uniforms} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

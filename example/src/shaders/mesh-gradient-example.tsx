import { MeshGradient, MeshGradientParams, meshGradientPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { useEffect } from 'react';

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

const defaultParams = meshGradientPresets[0].params;

export const MeshGradientWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: MeshGradientParams = Object.fromEntries(
      meshGradientPresets.map((preset) => [preset.name, button(() => setParams(preset.params))])
    );
    return {
      Parameters: folder(
        {
          color1: { value: defaultParams.color1, order: 1 },
          color2: { value: defaultParams.color2, order: 2 },
          color3: { value: defaultParams.color3, order: 3 },
          color4: { value: defaultParams.color4, order: 4 },
          speed: { value: defaultParams.speed, order: 5, min: 0, max: 1 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to default params on mount, so that Leva doesn't show param values from
  // other shaders when navigating (if two shaders have a color1 param for example)
  useEffect(() => {
    setParams(defaultParams);
  }, []);

  return <MeshGradient {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

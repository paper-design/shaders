import { DotsGrid, type DotsGridParams, dotsGridPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { useEffect } from 'react';

/**
 * You can copy/paste this example to use DotsGrid in your app
 */
const DotsGridExample = () => {
  return (
    <DotsGrid
      scale={11}
      dotSize={0.15}
      gridSpacingX={2}
      gridSpacingY={1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = dotsGridPresets[0].params;

export const DotsGridWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: DotsGridParams = Object.fromEntries(
      dotsGridPresets.map((preset) => [preset.name, button(() => setParams(preset.params))])
    );
    return {
      Parameters: folder(
        {
          scale: { value: defaults.scale, order: 1, min: 1, max: 80 },
          dotSize: { value: defaults.dotSize, order: 2, min: 0.001, max: 0.5 },
          gridSpacingX: { value: defaults.gridSpacingX, order: 3, min: .1, max: 2 },
          gridSpacingY: { value: defaults.gridSpacingY, order: 4, min: .1, max: 2 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useEffect(() => {
    setParams(defaults);
  }, []);

  return <DotsGrid {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

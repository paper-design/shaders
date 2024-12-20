import { DotsGrid, type DotsGridParams, dotsGridPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { useEffect } from 'react';

/**
 * You can copy/paste this example to use DotsGrid in your app
 */
const DotsGridExample = () => {
  return (
    <DotsGrid
      colorBack="#222222"
      colorFill="#e48b97"
      colorStroke="#f5d03b"
      dotSize={4}
      gridSpacingX={50}
      gridSpacingY={50}
      strokeWidth={2}
      sizeRange={0}
      opacityRange={0}
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
          colorBack: {value: defaults.colorBack, order: 1},
          colorFill: {value: defaults.colorFill, order: 2},
          colorStroke: {value: defaults.colorStroke, order: 3},
          dotSize: { value: defaults.dotSize, order: 4, min: .1, max: 100 },
          gridSpacingX: { value: defaults.gridSpacingX, order: 5, min: 2, max: 500 },
          gridSpacingY: { value: defaults.gridSpacingY, order: 6, min: 2, max: 500 },
          strokeWidth: { value: defaults.dotSize, order: 7, min: 0, max: 50 },
          sizeRange: { value: defaults.gridSpacingY, order: 8, min: 0, max: 1 },
          opacityRange: { value: defaults.gridSpacingY, order: 9, min: 0, max: 1 },
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

'use client';

import { DotsGrid, type DotsGridParams, dotsGridPresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { DotsGridShapes } from '@paper-design/shaders';

/**
 * You can copy/paste this example to use DotsGrid in your app
 */
const DotsGridExample = () => {
  return (
    <DotsGrid
      colorBack="#00000000"
      colorFill="#122118"
      colorStroke="#f0a519"
      dotSize={2}
      gridSpacingX={50}
      gridSpacingY={50}
      strokeWidth={0}
      sizeRange={0}
      opacityRange={0}
      shape={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = dotsGridPresets[0].params;

const DotsGridWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: DotsGridParams = Object.fromEntries(
      dotsGridPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder({
        colorBack: { value: defaults.colorBack, order: 100 },
        colorFill: { value: defaults.colorFill, order: 101 },
        colorStroke: { value: defaults.colorStroke, order: 102 },
        dotSize: { value: defaults.dotSize, min: 1, max: 100, order: 300 },
        gridSpacingX: { value: defaults.gridSpacingX, min: 2, max: 500, order: 300 },
        gridSpacingY: { value: defaults.gridSpacingY, min: 2, max: 500, order: 300 },
        strokeWidth: { value: defaults.dotSize, min: 0, max: 50, order: 300 },
        sizeRange: { value: defaults.gridSpacingY, min: 0, max: 1, order: 300 },
        opacityRange: { value: defaults.gridSpacingY, min: 0, max: 2, order: 300 },
        shape: { value: defaults.shape, options: DotsGridShapes, order: 350 },
      }),
      Presets: folder(presets),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(dotsGridPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <DotsGrid {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default DotsGridWithControls;

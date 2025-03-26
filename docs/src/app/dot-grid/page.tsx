'use client';

import { DotGrid, type DotGridParams, dotGridPresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { DotGridShapes } from '@paper-design/shaders';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';

/**
 * You can copy/paste this example to use DotGrid in your app
 */
const DotGridExample = () => {
  return (
    <DotGrid
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

const defaults = { ...dotGridPresets[0].params, style: { background: 'hsla(0, 0%, 0%, 0)' } };

const DotGridWithControls = () => {
  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          colorFill: { value: defaults.colorFill, order: 101 },
          colorStroke: { value: defaults.colorStroke, order: 102 },
          dotSize: { value: defaults.dotSize, min: 1, max: 100, order: 301 },
          gridSpacingX: { value: defaults.gridSpacingX, min: 2, max: 500, order: 302 },
          gridSpacingY: { value: defaults.gridSpacingY, min: 2, max: 500, order: 303 },
          strokeWidth: { value: defaults.dotSize, min: 0, max: 50, order: 304 },
          sizeRange: { value: defaults.gridSpacingY, min: 0, max: 1, order: 305 },
          opacityRange: { value: defaults.gridSpacingY, min: 0, max: 1, order: 306 },
          shape: { value: defaults.shape, options: DotGridShapes, order: 350 },
        },
        { order: 1 }
      ),
    };
  });

  const [style, setStyle] = useControls(() => {
    return {
      Parameters: folder({
        background: { value: 'hsla(0, 0%, 0%, 0)', order: 100 },
      }),
    };
  });

  useControls(() => {
    const presets: DotGridParams = Object.fromEntries(
      dotGridPresets.map((preset) => [
        preset.name,
        button(() => {
          setParamsSafe(params, setParams, preset.params);
          setStyle({ background: String(preset.style?.background || 'hsla(0, 0%, 0%, 0)') });
        }),
      ])
    );
    return {
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  useResetLevaParams(style, setStyle, defaults.style);
  usePresetHighlight(dotGridPresets, { ...params, style });
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <DotGrid {...params} style={{ position: 'fixed', width: '100%', height: '100%', ...style }} />
    </>
  );
};

export default DotGridWithControls;

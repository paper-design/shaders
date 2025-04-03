'use client';

import { DotGrid, dotGridPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { DotGridShape, DotGridShapes, ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';

/**
 * You can copy/paste this example to use DotGrid in your app
 */
const DotGridExample = () => {
  return (
    <DotGrid
      colorBack="#000000"
      colorFill="#ffffff"
      colorStroke="#f0a519"
      dotSize={2}
      gridSpacingX={50}
      gridSpacingY={50}
      strokeWidth={0}
      sizeRange={0}
      opacityRange={0}
      shape="circle"
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = dotGridPresets[0].params;

const DotGridWithControls = () => {
  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          colorBack: { value: defaults.colorBack, order: 100 },
          colorFill: { value: defaults.colorFill, order: 101 },
          colorStroke: { value: defaults.colorStroke, order: 102 },
          dotSize: { value: defaults.dotSize, min: 1, max: 100, order: 301 },
          gridSpacingX: { value: defaults.gridSpacingX, min: 2, max: 500, order: 302 },
          gridSpacingY: { value: defaults.gridSpacingY, min: 2, max: 500, order: 303 },
          strokeWidth: { value: defaults.dotSize, min: 0, max: 50, order: 304 },
          sizeRange: { value: defaults.gridSpacingY, min: 0, max: 1, order: 305 },
          opacityRange: { value: defaults.gridSpacingY, min: 0, max: 1, order: 306 },
          shape: {
            value: defaults.shape,
            options: Object.keys(DotGridShapes) as DotGridShape[],
            order: 350,
          },
        },
        { order: 1 }
      ),
      Size: folder(
        {
          fit: { value: defaults.fit, options: Object.keys(ShaderFitOptions) as ShaderFit[], order: 400 },
          scale: { value: defaults.scale, min: 0.01, max: 4, order: 401 },
          worldWidth: { value: 1000, min: 1, max: 5120, order: 406 },
          worldHeight: { value: 500, min: 1, max: 5120, order: 407 },
        },
        {
          order: 2,
          collapsed: false,
        }
      ),
      Position: folder(
        {
          originX: { value: defaults.originX, min: 0, max: 1, order: 402 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 403 },
          offsetX: { value: defaults.offsetX, min: -2, max: 2, order: 404 },
          offsetY: { value: defaults.offsetY, min: -2, max: 2, order: 405 },
        },
        {
          order: 3,
          collapsed: true,
        }
      ),
    };
  });

  useControls(() => {
    const presets = Object.fromEntries(
      dotGridPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Presets: folder(presets, { order: 10 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(dotGridPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <DotGrid className="fixed size-full" {...params} />
    </>
  );
};

export default DotGridWithControls;

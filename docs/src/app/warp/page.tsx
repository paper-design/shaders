'use client';

import { Warp, WarpPattern, warpPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { warpMeta, ShaderFit, ShaderFitOptions, WarpPatterns, simplexNoiseMeta } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';

/**
 * You can copy/paste this example to use Warp in your app
 */
const WarpExample = () => {
  return <Warp style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = warpPresets[0].params;

const WarpWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: warpMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          proportion: { value: defaults.proportion, min: 0, max: 1, order: 300 },
          softness: { value: defaults.softness, min: 0, max: 1, order: 301 },
          distortion: { value: defaults.distortion, min: 0, max: 1, order: 302 },
          swirl: { value: defaults.swirl, min: 0, max: 1, order: 303 },
          swirlIterations: { value: defaults.swirlIterations, min: 0, max: 20, order: 304 },
          shape: { value: defaults.shape, options: Object.keys(WarpPatterns) as WarpPattern[], order: 305 },
          shapeScale: { value: defaults.shapeScale, min: 0, max: 1, order: 306 },
          speed: { value: defaults.speed, min: 0, max: 20, order: 400 },
        },
        { order: 1 }
      ),
      Transform: folder(
        {
          scale: { value: defaults.scale, min: 0.01, max: 5, order: 400 },
          rotation: { value: defaults.rotation, min: 0, max: 360, order: 401 },
          offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 402 },
          offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 403 },
        },
        {
          order: 2,
          collapsed: false,
        }
      ),
      Fit: folder(
        {
          fit: { value: defaults.fit, options: Object.keys(ShaderFitOptions) as ShaderFit[], order: 404 },
          worldWidth: { value: 1000, min: 0, max: 5120, order: 405 },
          worldHeight: { value: 500, min: 0, max: 5120, order: 406 },
          originX: { value: defaults.originX, min: 0, max: 1, order: 407 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 408 },
        },
        {
          order: 3,
          collapsed: true,
        }
      ),
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      warpPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => {
          const { colors, ...presetParams } = preset;
          setColors(colors);
          setParamsSafe(params, setParams, presetParams);
        }),
      ])
    );
    return {
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(warpPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Warp {...params} colors={colors} className="fixed size-full" />
    </>
  );
};

export default WarpWithControls;

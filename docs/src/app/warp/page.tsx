'use client';

import { Warp, WarpPattern, warpPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, ShaderFitOptions, WarpPatterns } from '@paper-design/shaders';

/**
 * You can copy/paste this example to use Warp in your app
 */
const WarpExample = () => {
  return (
    <Warp
      color1="#262626"
      color2="#75c1f0"
      color3="#ffffff"
      scale={1}
      rotation={0}
      proportion={0.5}
      softness={1}
      distortion={0.25}
      swirl={0.9}
      swirlIterations={10}
      shape="checks"
      shapeScale={0.5}
      speed={0.3}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = warpPresets[0].params;

const WarpWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      warpPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );

    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 100 },
          color2: { value: defaults.color2, order: 101 },
          color3: { value: defaults.color3, order: 102 },
          proportion: { value: defaults.proportion, min: 0, max: 1, order: 300 },
          softness: { value: defaults.softness, min: 0, max: 1, order: 301 },
          distortion: { value: defaults.distortion, min: 0, max: 1, order: 302 },
          swirl: { value: defaults.swirl, min: 0, max: 1, order: 303 },
          swirlIterations: { value: defaults.swirlIterations, min: 0, max: 20, order: 304 },
          shape: { value: defaults.shape, options: Object.keys(WarpPatterns) as WarpPattern[], order: 305 },
          shapeScale: { value: defaults.shapeScale, min: 0, max: 1, order: 306 },
          speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
        },
        { order: 1 }
      ),
      Transform: folder(
        {
          scale: { value: defaults.scale, min: 0.01, max: 4, order: 400 },
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
          worldWidth: { value: 1000, min: 1, max: 5120, order: 405 },
          worldHeight: { value: 500, min: 1, max: 5120, order: 406 },
          originX: { value: defaults.originX, min: 0, max: 1, order: 407 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 408 },
        },
        {
          order: 3,
          collapsed: true,
        }
      ),
      Presets: folder(presets, { order: 10 }),
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
      <Warp className="fixed size-full" {...params} />
    </>
  );
};

export default WarpWithControls;

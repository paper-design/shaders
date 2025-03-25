'use client';

import { Warp, type WarpParams, warpPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { PatternShapes } from '@paper-design/shaders';

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
      shape={0}
      shapeScale={0.5}
      speed={0.3}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = warpPresets[0].params;

const WarpWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: WarpParams = Object.fromEntries(
      warpPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );

    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 100 },
          color2: { value: defaults.color2, order: 101 },
          color3: { value: defaults.color3, order: 102 },
          scale: { value: defaults.scale, min: 0, max: 2, order: 200 },
          rotation: { value: defaults.rotation, min: 0, max: 2, order: 201 },
          proportion: { value: defaults.proportion, min: 0, max: 1, order: 300 },
          softness: { value: defaults.softness, min: 0, max: 1, order: 301 },
          distortion: { value: defaults.distortion, min: 0, max: 1, order: 302 },
          swirl: { value: defaults.swirl, min: 0, max: 1, order: 303 },
          swirlIterations: { value: defaults.swirlIterations, min: 0, max: 20, order: 304 },
          shape: { value: defaults.shape, options: PatternShapes, order: 305 },
          shapeScale: { value: defaults.shapeScale, min: 0, max: 1, order: 306 },
          speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(warpPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Warp {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default WarpWithControls;

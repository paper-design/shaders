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
      scale={1}
      speed={1}
      color1="#262626"
      color2="#75c1f0"
      color3="#ffffff"
      proportion={0.5}
      softness={1}
      distortion={1}
      swirl={0.9}
      swirlIterations={10}
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
      Parameters: folder({
        color1: { value: defaults.color1 },
        color2: { value: defaults.color2 },
        color3: { value: defaults.color3 },
        scale: {value: defaults.scale, min: 0, max: 2},
        proportion: { value: defaults.proportion, min: 0, max: 1 },
        softness: { value: defaults.softness, min: 0, max: 1 },
        speed: { value: defaults.speed, min: 0, max: 2 },
        distortion: { value: defaults.distortion, min: 0, max: 3 },
        swirl: { value: defaults.swirl, min: 0, max: 1 },
        swirlIterations: { value: defaults.swirlIterations, min: 0, max: 20 },
        shape: { value: defaults.shape, options: PatternShapes },
        shapeScale: {value: defaults.shapeScale, min: 0, max: 1},
        rotation: {value: defaults.rotation, min: 0, max: 2},
      }),
      Presets: folder(presets),
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

'use client';

import {
  SteppedSimplexNoise,
  type SteppedSimplexNoiseParams,
  steppedSimplexNoisePresets,
} from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, ShaderFitOptions } from '@paper-design/shaders';

/**
 * You can copy/paste this example to use SteppedSimplexNoise in your app
 */
const SteppedSimplexNoiseExample = () => {
  return (
    <SteppedSimplexNoise
      color1="#56758f"
      color2="#91be6f"
      color3="#f94346"
      color4="#f9c54e"
      color5="#ffffff"
      scale={1}
      stepsNumber={13}
      speed={0.5}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = steppedSimplexNoisePresets[0].params;

const SteppedSimplexNoiseWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      steppedSimplexNoisePresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
          color4: { value: defaults.color4, order: 103 },
          color5: { value: defaults.color5, order: 104 },
          stepsNumber: { value: defaults.stepsNumber, min: 2, max: 40, order: 300 },
          speed: { value: defaults.speed, min: 0, max: 1, order: 400 },
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
  usePresetHighlight(steppedSimplexNoisePresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <SteppedSimplexNoise className="fixed size-full" {...params} />
    </>
  );
};

export default SteppedSimplexNoiseWithControls;

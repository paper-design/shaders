'use client';

import { Waves, type WavesParams, wavesPresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit } from '@paper-design/shaders';
import { ShaderFitOptions } from '@paper-design/shaders';

/**
 * You can copy/paste this example to use Waves in your app
 */
const WavesExample = () => {
  return (
    <Waves
      color1="#90BE6D"
      color2="#000000"
      scale={1}
      rotation={0}
      frequency={0.5}
      amplitude={0.5}
      spacing={0.75}
      dutyCycle={0.2}
      softness={0}
      shape={1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = {
  ...wavesPresets[0].params,
  style: { background: 'hsla(0, 0%, 0%, 0)' },
};

const WavesWithControls = () => {
  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 101 },
          color2: { value: defaults.color2, order: 102 },
          rotation: { value: defaults.rotation, min: 0, max: 1, order: 201 },
          frequency: { value: defaults.frequency, min: 0, max: 2, order: 300 },
          amplitude: { value: defaults.amplitude, min: 0, max: 1, order: 301 },
          spacing: { value: defaults.spacing, min: 0, max: 2, order: 302 },
          dutyCycle: { value: defaults.dutyCycle, min: 0, max: 1, order: 303 },
          softness: { value: defaults.softness, min: 0, max: 1, order: 304 },
          shape: { value: defaults.shape, min: 0, max: 3, order: 350 },
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
      wavesPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  usePresetHighlight(wavesPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Waves className="fixed size-full" {...params} />
    </>
  );
};

export default WavesWithControls;

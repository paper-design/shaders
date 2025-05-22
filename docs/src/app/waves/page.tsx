'use client';

import { Waves, type WavesParams, wavesPresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { DEFAULT_MAX_PIXEL_COUNT, ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { toHsla } from '@/helpers/to-hsla';

/**
 * You can copy/paste this example to use Waves in your app
 */
const WavesExample = () => {
  return <Waves style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = {
  ...wavesPresets[0].params,
  style: { background: 'hsla(0, 0%, 0%, 0)' },
};

const WavesWithControls = () => {
  const [{ logMaxPixelCount, ...params }, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          color1: { value: toHsla(defaults.color1), order: 101 },
          color2: { value: toHsla(defaults.color2), order: 102 },
          frequency: { value: defaults.frequency, min: 0, max: 2, order: 300 },
          amplitude: { value: defaults.amplitude, min: 0, max: 1, order: 301 },
          spacing: { value: defaults.spacing, min: 0, max: 2, order: 302 },
          proportion: { value: defaults.proportion, min: 0, max: 1, order: 303 },
          softness: { value: defaults.softness, min: 0, max: 1, order: 304 },
          shape: { value: defaults.shape, min: 0, max: 3, order: 350 },
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
      Resolution: folder(
        {
          logMaxPixelCount: {
            value: Math.log(DEFAULT_MAX_PIXEL_COUNT),
            min: 0,
            max: Math.log(DEFAULT_MAX_PIXEL_COUNT),
            order: 409,
          },
        },
        { order: 4, collapsed: true }
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
      <Waves className="fixed size-full" {...params} maxPixelCount={Math.exp(logMaxPixelCount)} />
    </>
  );
};

export default WavesWithControls;

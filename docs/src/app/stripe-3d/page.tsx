'use client';

import { Stripe3D, type Stripe3DParams, stripe3DPresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use Stripe3D in your app
 */
const Stripe3DExample = () => {
  return (
    <Stripe3D colorBack="#56758f" speed={0.5} seed={0} style={{ position: 'fixed', width: '100%', height: '100%' }} />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = stripe3DPresets[0].params;

const Stripe3DWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: Stripe3DParams = Object.fromEntries(
      stripe3DPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder({
        colorBack: { value: defaults.colorBack, order: 100 },
        color1: { value: defaults.color1, order: 101 },
        color2: { value: defaults.color2, order: 102 },
        length: { value: defaults.length, min: 0, max: 3, order: 200 },
        incline: { value: defaults.incline, min: 0, max: 0.5, order: 201 },
        rotation: { value: defaults.rotation, min: 0, max: 2, order: 202 },
        amplitude1: { value: defaults.amplitude1, min: 0, max: 0.2, order: 203 },
        frequency1: { value: defaults.frequency1, min: 0, max: 15, order: 204 },
        amplitude2: { value: defaults.amplitude2, min: 0, max: 0.1, order: 205 },
        frequency2: { value: defaults.frequency2, min: 0, max: 4, order: 206 },
        speed: { value: defaults.speed, min: 0, max: 1.5, order: 400 },
      }),
      Presets: folder(presets),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a colorBack param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(stripe3DPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Stripe3D {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default Stripe3DWithControls;

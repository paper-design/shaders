'use client';

import { Waves3D, type Waves3DParams, waves3DPresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use Waves3D in your app
 */
const Waves3DExample = () => {
  return (
    <Waves3D colorBack="#56758f" speed={0.5} seed={0} style={{ position: 'fixed', width: '100%', height: '100%' }} />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = waves3DPresets[0].params;

const Waves3DWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: Waves3DParams = Object.fromEntries(
      waves3DPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder({
        colorBack: { value: defaults.colorBack, order: 100 },
        color1: { value: defaults.color1, order: 101 },
        color2: { value: defaults.color2, order: 102 },
        amplitude1: { value: defaults.amplitude1, min: 0, max: 0.2, order: 203 },
        frequency1: { value: defaults.frequency1, min: 0, max: 8, order: 204 },
        amplitude2: { value: defaults.amplitude2, min: 0, max: 0.1, order: 205 },
        frequency2: { value: defaults.frequency2, min: 0, max: 8, order: 206 },
        grain: { value: defaults.grain, min: 0, max: 8, order: 206 },
        speed: { value: defaults.speed, min: 0, max: 1.5, order: 400 },
        seed: { value: defaults.seed, min: 0, max: 9999, order: 400 },
      }),
      Presets: folder(presets),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a colorBack param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(waves3DPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Waves3D {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default Waves3DWithControls;

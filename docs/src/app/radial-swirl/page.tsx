'use client';

import { RadialSwirl, type RadialSwirlParams, radialSwirlPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use RadialSwirl in your app
 */
const RadialSwirlExample = () => {
  return (
    <RadialSwirl
      colorBack="#6a5496"
      colorFront="#00d03b"
      colorStripe1="#9b8ab8"
      colorStripe2="#f5d03b"
      radialSwirl={1}
      speed={1}
      seed={0}
      proportion={0}
      stripe1={.8}
      stripe2={.8}
      noiseFreq={1}
      noisePower={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = radialSwirlPresets[0].params;

const RadialSwirlWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: RadialSwirlParams = Object.fromEntries(
      radialSwirlPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder(
        {
          colorBack: { value: defaults.colorBack },
          colorFront: {value: defaults.colorFront},
          colorStripe1: { value: defaults.colorStripe1 },
          colorStripe2: { value: defaults.colorStripe2 },
          seed: { value: defaults.seed, min: 0, max: 9999 },
          speed: { value: defaults.speed, min: 0, max: 1 },
          density: { value: defaults.density, min: 0, max: 2 },
          proportion: { value: defaults.proportion, min: 0, max: 1 },
          stripe1: { value: defaults.stripe1, min: 0, max: 1 },
          stripe2: { value: defaults.stripe2, min: 0, max: 1 },
          focus: { value: defaults.focus, min: 0, max: 1 },
          noiseFreq: { value: defaults.noiseFreq, min: 0, max: 2 },
          noisePower: { value: defaults.noisePower, min: 0, max: 2 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a colorBack param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(radialSwirlPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <RadialSwirl {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default RadialSwirlWithControls;

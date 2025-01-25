'use client';

import { Spiral, type SpiralParams, spiralPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use Spiral in your app
 */
const SpiralExample = () => {
  return (
    <Spiral
      colorBack="#6a5496"
      colorFront="#00d03b"
      colorStripe1="#9b8ab8"
      colorStripe2="#f5d03b"
      proportion={0}
      stripe1={0.8}
      stripe2={0.8}
      noiseFreq={1}
      noisePower={0}
      speed={1}
      seed={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = spiralPresets[0].params;

const SpiralWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: SpiralParams = Object.fromEntries(
      spiralPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder(
        {
          colorBack: { value: defaults.colorBack, order: 100 },
          colorFront: { value: defaults.colorFront, order: 101 },
          colorStripe1: { value: defaults.colorStripe1, order: 102 },
          colorStripe2: { value: defaults.colorStripe2, order: 103 },
          density: { value: defaults.density, min: 0, max: 2 },
          proportion: { value: defaults.proportion, min: 0, max: 1 },
          stripe1: { value: defaults.stripe1, min: 0, max: 1 },
          stripe2: { value: defaults.stripe2, min: 0, max: 1 },
          focus: { value: defaults.focus, min: 0, max: 1 },
          noiseFreq: { value: defaults.noiseFreq, min: 0, max: 2 },
          noisePower: { value: defaults.noisePower, min: 0, max: 2 },
          speed: { value: defaults.speed, min: 0, max: 1, order: 400 },
          // Speed reverse to be added after leva-review branch merge
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a colorBack param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(spiralPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Spiral {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default SpiralWithControls;

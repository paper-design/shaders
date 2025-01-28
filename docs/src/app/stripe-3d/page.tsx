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
    <Stripe3D
      colorBack="#56758f"
      color2="#91be6f"
      color3="#f94346"
      color4="#f9c54e"
      color5="#ffffff"
      scale={1}
      speed={0.5}
      seed={0}
      stepsNumber={13}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
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
        colorBack: { value: defaults.colorBack },
        color2: { value: defaults.color2 },
        // color3: { value: defaults.color3 },
        // color4: { value: defaults.color4 },
        // color5: { value: defaults.color5 },
        scale: { value: defaults.scale, min: 0.1, max: 1.9 },
        speed: { value: defaults.speed, min: -1.5, max: 1.5 },
        // stepsNumber: { value: defaults.stepsNumber, min: -6, max: 6 },
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

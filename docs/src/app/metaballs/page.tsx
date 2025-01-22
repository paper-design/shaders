'use client';

import { Metaballs, type MetaballsParams, metaballsPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use Metaballs in your app
 */
const MetaballsExample = () => {
  return (
    <Metaballs
      scale={1}
      speed={1}
      seed={0}
      color1="#f42547"
      color2="#eb4763"
      color3="#f49d71"
      ballSize={1}
      visibilityRange={0.4}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = metaballsPresets[0].params;

const MetaballsWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: MetaballsParams = Object.fromEntries(
      metaballsPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder({
        color1: { value: defaults.color1 },
        color2: { value: defaults.color2 },
        color3: { value: defaults.color3 },
        scale: { value: defaults.scale, min: 0, max: 2 },
        speed: { value: defaults.speed, min: 0, max: 1 },
        seed: { value: defaults.seed, min: 0, max: 9999 },
        ballSize: { value: defaults.ballSize, min: 0, max: 1 },
        visibilityRange: { value: defaults.visibilityRange, min: 0.05, max: 1 },
      }),
      Presets: folder(presets),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(metaballsPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Metaballs {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default MetaballsWithControls;

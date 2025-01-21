'use client';

import { SmokeRing, type SmokeRingParams, smokeRingPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use SmokeRing in your app
 */
const SmokeRingExample = () => {
  return (
    <SmokeRing
      colorBack="#08121b"
      colorInner="#ffffff"
      colorOuter="#47a0ff"
      scale={1}
      speed={1}
      noiseScale={1.4}
      thickness={0.33}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = smokeRingPresets[0].params;

const SmokeRingWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: SmokeRingParams = Object.fromEntries(
      smokeRingPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder({
        colorBack: { value: defaults.colorBack },
        colorInner: { value: defaults.colorInner },
        colorOuter: { value: defaults.colorOuter },
        scale: { value: defaults.scale, min: 0.5, max: 1.5 },
        speed: { value: defaults.speed, min: -4, max: 4 },
        noiseScale: { value: defaults.thickness, min: 0.01, max: 5 },
        thickness: { value: defaults.thickness, min: 0.1, max: 2 },
      }),
      Presets: folder(presets),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a colorInner param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(smokeRingPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <SmokeRing {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default SmokeRingWithControls;

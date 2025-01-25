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
      scale={1}
      speed={1}
      colorBack="#08121b"
      colorInner="#ffffff"
      colorOuter="#47a0ff"
      noiseScale={1.4}
      thickness={0.33}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const firstPresetParams = smokeRingPresets[0].params;
const levaDefaults = {
  ...firstPresetParams,
  speed: Math.abs(firstPresetParams.speed),
  reverse: firstPresetParams.speed < 0,
};

const SmokeRingWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: SmokeRingParams = Object.fromEntries(
      smokeRingPresets.map((preset) => [
        preset.name,
        button(() => {
          setParamsSafe(params, setParams, {
            ...preset.params,
            speed: Math.abs(preset.params.speed),
            reverse: preset.params.speed < 0,
          });
        }),
      ])
    );
    return {
      Parameters: folder({
        colorBack: { value: levaDefaults.colorBack },
        colorInner: { value: levaDefaults.colorInner },
        colorOuter: { value: levaDefaults.colorOuter },
        scale: { value: levaDefaults.scale, min: 0.5, max: 1.5 },
        seed: { value: levaDefaults.seed, min: 0, max: 9999 },
        noiseScale: { value: levaDefaults.noiseScale, min: 0.01, max: 5 },
        thickness: { value: levaDefaults.thickness, min: 0.1, max: 2 },
        speed: { value: levaDefaults.speed, min: 0, max: 4 },
        reverse: { value: levaDefaults.reverse },
      }),
      Presets: folder(presets),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a colorInner param for example)
  useResetLevaParams(params, setParams, levaDefaults);

  usePresetHighlight(smokeRingPresets, params);

  const { reverse, ...shaderParams } = { ...params, speed: params.speed * (params.reverse ? -1 : 1) };

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <SmokeRing {...shaderParams} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default SmokeRingWithControls;

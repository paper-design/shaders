'use client';

import { SmokeRing, type SmokeRingParams, smokeRingPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';

/**
 * You can copy/paste this example to use SmokeRing in your app
 */
const SmokeRingExample = () => {
  return (
    <SmokeRing
      colorBack="#000000"
      colorInner="#ffffff"
      colorOuter="#4f566a"
      scale={1}
      noiseScale={1.4}
      thickness={0.33}
      speed={1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const firstPresetParams = smokeRingPresets[0].params;
const defaults = {
  ...firstPresetParams,
  speed: Math.abs(firstPresetParams.speed),
  reverse: firstPresetParams.speed < 0,
};

const SmokeRingWithControls = () => {
  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          colorBack: { value: defaults.colorBack, order: 100 },
          colorInner: { value: defaults.colorInner, order: 101 },
          colorOuter: { value: defaults.colorOuter, order: 102 },
          scale: { value: defaults.scale, min: 0.5, max: 1.5, order: 200 },
          noiseScale: { value: defaults.noiseScale, min: 0.01, max: 5, order: 300 },
          thickness: { value: defaults.thickness, min: 0.1, max: 2, order: 301 },
          speed: { value: defaults.speed, min: 0, max: 4, order: 400 },
          reverse: { value: defaults.reverse, order: 401 },
        },
        { order: 1 }
      ),
    };
  });

  useControls(() => {
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
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a colorInner param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(smokeRingPresets, params);
  cleanUpLevaParams(params);

  const { reverse, ...shaderParams } = { ...params, speed: params.speed * (params.reverse ? -1 : 1) };

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <SmokeRing className="fixed size-full" {...shaderParams} />
    </>
  );
};

export default SmokeRingWithControls;

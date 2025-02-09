'use client';

import { Swirl, type SwirlParams, swirlPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use Swirl in your app
 */
const SwirlExample = () => {
  return <Swirl color1="#6a5496" color2="#00d03b" style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const firstPresetParams = swirlPresets[0].params;
const defaults = {
  ...firstPresetParams,
  speed: Math.abs(firstPresetParams.speed),
  reverse: firstPresetParams.speed < 0,
};

const SwirlWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: SwirlParams = Object.fromEntries(
      swirlPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 100 },
          color2: { value: defaults.color2, order: 101 },
          color3: { value: defaults.color3, order: 102 },
          scale: { value: defaults.scale, min: 0, max: 4, order: 200 },
          offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 201 },
          offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 202 },
          frequency: { value: defaults.frequency, min: 0, max: 8, order: 203 },
          twist: { value: defaults.twist, min: 0, max: 2, order: 204 },
          depth: { value: defaults.depth, min: 0, max: 5, order: 205 },
          noiseFreq: { value: defaults.noiseFreq, min: 0, max: 30, order: 350 },
          noisePower: { value: defaults.noisePower, min: 0, max: 1, order: 351 },
          blur: { value: defaults.blur, min: 0, max: 1, order: 352 },
          speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
          reverse: { value: defaults.reverse, order: 401 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a colorBack param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(swirlPresets, params);

  const { reverse, ...shaderParams } = { ...params, speed: params.speed * (params.reverse ? -1 : 1) };

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Swirl {...shaderParams} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default SwirlWithControls;

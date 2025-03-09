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
      color1="#90e32b"
      color2="#2c8618"
      scale={1.3}
      offsetX={0}
      offsetY={0}
      spiralDensity={0.5}
      spiralDistortion={0}
      strokeWidth={0.5}
      strokeTaper={0}
      strokeCap={0.5}
      noiseFreq={0.1}
      noisePower={1}
      blur={0}
      speed={1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const firstPresetParams = spiralPresets[0].params;
const defaults = {
  ...firstPresetParams,
  speed: Math.abs(firstPresetParams.speed),
  reverse: firstPresetParams.speed < 0,
};

const SpiralWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: SpiralParams = Object.fromEntries(
      spiralPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 100 },
          color2: { value: defaults.color2, order: 101 },
          scale: { value: defaults.scale, min: 0, max: 4, order: 200 },
          offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 201 },
          offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 202 },
          spiralDensity: { value: defaults.spiralDensity, min: 0, max: 1, order: 203 },
          spiralDistortion: { value: defaults.spiralDistortion, min: 0, max: 1, order: 204 },
          strokeWidth: { value: defaults.strokeWidth, min: 0, max: 1, order: 205 },
          strokeTaper: { value: defaults.strokeTaper, min: 0, max: 1, order: 206 },
          strokeCap: { value: defaults.strokeCap, min: 0, max: 1, order: 207 },
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

  usePresetHighlight(spiralPresets, params);

  const { reverse, ...shaderParams } = { ...params, speed: params.speed * (params.reverse ? -1 : 1) };

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Spiral {...shaderParams} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default SpiralWithControls;

'use client';

import { PulsingBorder, type PulsingBorderParams, pulsingBorderPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use PulsingBorder in your app
 */
const PulsingBorderExample = () => {
  return <PulsingBorder style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = pulsingBorderPresets[0].params;

const PulsingBorderWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: PulsingBorderParams = Object.fromEntries(
      pulsingBorderPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );

    return {
      Parameters: folder(
        {
          colorBack: { value: defaults.colorBack, order: 100 },
          color1: { value: defaults.color1, order: 101 },
          color2: { value: defaults.color2, order: 102 },
          color3: { value: defaults.color3, order: 103 },
          color4: { value: defaults.color4, order: 104 },
          size: { value: defaults.size, min: 0, max: 500, order: 200 },
          power: { value: defaults.power, min: 0, max: 2, order: 201 },
            frequency: { value: defaults.frequency, min: 0, max: 10, order: 202 },
          borderLine: { value: defaults.borderLine, min: 0, max: 1, order: 202 },
          inner: { value: defaults.inner, min: 0, max: 1, order: 203 },
          grain: { value: defaults.grain, min: 0, max: 1, order: 204 },
          spotty: { value: defaults.spotty, min: 0, max: 1, order: 205 },
          speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(pulsingBorderPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <PulsingBorder {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default PulsingBorderWithControls;

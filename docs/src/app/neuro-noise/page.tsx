'use client';

import { NeuroNoise, type NeuroNoiseParams, neuroNoisePresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use NeuroNoise in your app
 */
const NeuroNoiseExample = () => {
  return (
    <NeuroNoise
      style={{ position: 'fixed', width: '100%', height: '100%' }}
      scale={1}
      speed={1}
      seed={0}
      colorBack="hsla(200, 100%, 5%, 1)"
      colorFront="hsla(200, 100%, 25%, 1)"
      brightness={1.3}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = neuroNoisePresets[0].params;

const NeuroNoiseWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: NeuroNoiseParams = Object.fromEntries(
      neuroNoisePresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );

    return {
      Parameters: folder({
        scale: { value: defaults.scale, min: 0.3, max: 2 },
        speed: { value: defaults.speed, min: -3, max: 3 },
        colorFront: { value: defaults.colorFront },
        colorBack: { value: defaults.colorBack },
        brightness: { value: defaults.brightness, min: 0.8, max: 2 },
      }),
      Presets: folder(presets),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(neuroNoisePresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <NeuroNoise {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default NeuroNoiseWithControls;

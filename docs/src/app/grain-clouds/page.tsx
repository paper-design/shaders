'use client';

import { GrainClouds, type GrainCloudsParams, grainCloudsPresets, NeuroNoise } from '@paper-design/shaders-react';
import { button, folder, useControls } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use GrainClouds in your app
 */
const GrainCloudsExample = () => {
  return (
    <GrainClouds
      color1="#000000"
      color2="#ffffff"
      scale={1}
      grainAmount={0.5}
      speed={0.2}
      seed={0}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = grainCloudsPresets[0].params;

const GrainCloudsWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: GrainCloudsParams = Object.fromEntries(
      grainCloudsPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder({
        color1: { value: defaults.color1, order: 100 },
        color2: { value: defaults.color2, order: 101 },
        scale: { value: defaults.scale, min: 0.2, max: 1.8, order: 200 },
        grainAmount: { value: defaults.grainAmount, min: 0, max: 1, order: 300 },
        speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
      }),
      Presets: folder(presets),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(grainCloudsPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <GrainClouds {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default GrainCloudsWithControls;

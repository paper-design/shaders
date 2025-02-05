'use client';

import { BackButton } from '@/components/back-button';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { GodRays, type GodRaysParams, godRaysPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import Link from 'next/link';

/**
 * You can copy/paste this example to use GodRays in your app
 */
const GodRaysExample = () => {
  return <GodRays colorBack="#1ae6e6" color1="#e64d1a" style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = godRaysPresets[0].params;

const GodRaysWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: GodRaysParams = Object.fromEntries(
      godRaysPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder(
        {
          colorBack: { value: defaults.colorBack, order: 100 },
          color1: { value: defaults.color1, order: 101 },
          color2: { value: defaults.color2, order: 102 },
          color3: { value: defaults.color2, order: 103 },
          offsetX: { value: defaults.offsetX, min: -1.5, max: 1.5, order: 301 },
          offsetY: { value: defaults.offsetY, min: -1.5, max: 1.5, order: 302 },
          spotty: { value: defaults.spotty, min: 0, max: 1, order: 303 },
          midShape: { value: defaults.midShape, min: 0, max: 3, order: 304 },
          midIntensity: { value: defaults.midIntensity, min: 0, max: 1, order: 305 },
          density: { value: defaults.density, min: 0, max: 1, order: 306 },
          blending: { value: defaults.blending, min: 0, max: 1, order: 306 },
          frequency: { value: defaults.frequency, min: 0, max: 30, order: 307 },
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

  usePresetHighlight(godRaysPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <GodRays {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default GodRaysWithControls;

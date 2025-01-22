'use client';

import { BackButton } from '@/components/back-button';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { DotsOrbit, type DotsOrbitParams, dotsOrbitPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import Link from 'next/link';

/**
 * You can copy/paste this example to use DotsOrbit in your app
 */
const DotsOrbitExample = () => {
  return (
    <DotsOrbit
      scale={1}
      speed={2}
      color1="#cf2a30"
      color2="#3b6d50"
      color3="#f0a519"
      color4="#5d3e74"
      dotSize={0.7}
      dotSizeRange={0.2}
      spreading={1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = dotsOrbitPresets[0].params;

const DotsOrbitWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: DotsOrbitParams = Object.fromEntries(
      dotsOrbitPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder({
        color1: { value: defaults.color1 },
        color2: { value: defaults.color2 },
        color3: { value: defaults.color3 },
        color4: { value: defaults.color4 },
        scale: { value: defaults.scale, min: 0.5, max: 2 },
        speed: { value: defaults.speed, min: 0, max: 6 },
        dotSize: { value: defaults.dotSize, min: 0, max: 1 },
        dotSizeRange: { value: defaults.dotSizeRange, min: 0, max: 1 },
        spreading: { value: defaults.spreading, min: 0, max: 1 },
      }),
      Presets: folder(presets),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(dotsOrbitPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <DotsOrbit {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default DotsOrbitWithControls;

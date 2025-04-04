'use client';

import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { DotOrbit, type DotOrbitParams, dotOrbitPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import Link from 'next/link';

/**
 * You can copy/paste this example to use DotOrbit in your app
 */
const DotOrbitExample = () => {
  return (
    <DotOrbit
      color1="#cf2a30"
      color2="#3b6d50"
      color3="#f0a519"
      color4="#5d3e74"
      scale={1}
      dotSize={0.7}
      dotSizeRange={0.2}
      spreading={1}
      speed={2}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = dotOrbitPresets[0].params;

const DotOrbitWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: DotOrbitParams = Object.fromEntries(
      dotOrbitPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 100 },
          color2: { value: defaults.color2, order: 101 },
          color3: { value: defaults.color3, order: 102 },
          color4: { value: defaults.color4, order: 103 },
          scale: { value: defaults.scale, min: 0.5, max: 2, order: 200 },
          dotSize: { value: defaults.dotSize, min: 0, max: 1, order: 300 },
          dotSizeRange: { value: defaults.dotSizeRange, min: 0, max: 1, order: 301 },
          spreading: { value: defaults.spreading, min: 0, max: 1, order: 302 },
          speed: { value: defaults.speed, min: 0, max: 6, order: 400 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(dotOrbitPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <DotOrbit className="fixed size-full" {...params} />
    </>
  );
};

export default DotOrbitWithControls;

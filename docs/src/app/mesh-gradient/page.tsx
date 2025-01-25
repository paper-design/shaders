'use client';

import { MeshGradient, type MeshGradientParams, meshGradientPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use MeshGradient in your app
 */
const MeshGradientExample = () => {
  return (
    <MeshGradient
      speed={0.15}
      seed={0}
      color1="#b3a6ce"
      color2="#562b9c"
      color3="#f4e8b8"
      color4="#c79acb"
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = meshGradientPresets[0].params;

const MeshGradientWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: MeshGradientParams = Object.fromEntries(
      meshGradientPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );

    return {
      Parameters: folder({
        color1: { value: defaults.color1 },
        color2: { value: defaults.color2 },
        color3: { value: defaults.color3 },
        color4: { value: defaults.color4 },
        speed: { value: defaults.speed, min: 0, max: 1 },
      }),
      Presets: folder(presets),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(meshGradientPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <MeshGradient {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default MeshGradientWithControls;

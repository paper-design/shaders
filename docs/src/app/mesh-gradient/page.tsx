'use client';

import { MeshGradient, type MeshGradientParams, meshGradientPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use MeshGradient in your app
 */
const MeshGradientExample = () => {
  return (
    <MeshGradient
      colors={['#b3a6ce', '#562b9c', '#f4e8b8', '#c79acb']}
      speed={0.15}
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
      Parameters: folder(
        {
          // colors: { value: defaults.colors, order: 100 },
          speed: { value: defaults.speed, min: 0, max: 1, order: 400 },
        },
        { order: 1 }
      ),
      // Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(meshGradientPresets, params);
  cleanUpLevaParams(params);

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

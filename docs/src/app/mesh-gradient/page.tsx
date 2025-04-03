'use client';

import { MeshGradient, meshGradientPresets } from '@paper-design/shaders-react';
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
      color1="#b3a6ce"
      color2="#562b9c"
      color3="#f4e8b8"
      color4="#c79acb"
      speed={0.15}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

// const { worldWidth, worldHeight, ...defaults } = meshGradientPresets[0].params;
const defaults = meshGradientPresets[0].params;

const MeshGradientWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      // meshGradientPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
      meshGradientPresets.map(({ name, params: preset }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );

    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 100 },
          color2: { value: defaults.color2, order: 101 },
          color3: { value: defaults.color3, order: 102 },
          color4: { value: defaults.color4, order: 103 },
          speed: { value: defaults.speed, min: 0, max: 1, order: 400 },
        },
        { order: 1 }
      ),
      // Size: folder(
      //   {
      //     fit: { value: defaults.fit, options: Object.keys(ShaderFitOptions) as ShaderFit[], order: 400 },
      //     scale: { value: defaults.scale, min: 0.01, max: 4, order: 401 },
      //     worldWidth: { value: 1000, min: 1, max: 5120, order: 406 },
      //     worldHeight: { value: 500, min: 1, max: 5120, order: 407 },
      //   },
      //   {
      //     order: 2,
      //     collapsed: false,
      //   }
      // ),
      // Position: folder(
      //   {
      //     originX: { value: defaults.originX, min: 0, max: 1, order: 402 },
      //     originY: { value: defaults.originY, min: 0, max: 1, order: 403 },
      //     offsetX: { value: defaults.offsetX, min: -2, max: 2, order: 404 },
      //     offsetY: { value: defaults.offsetY, min: -2, max: 2, order: 405 },
      //   },
      //   {
      //     order: 3,
      //     collapsed: true,
      //   }
      // ),
      Presets: folder(presets, { order: 10 }),
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
      <MeshGradient className="fixed size-full" {...params} />
    </>
  );
};

export default MeshGradientWithControls;

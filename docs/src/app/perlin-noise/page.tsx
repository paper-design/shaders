'use client';

import { PerlinNoise, type PerlinNoiseParams, perlinNoisePresets, SmokeRing } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use PerlinNoise in your app
 */
const PerlinNoiseExample = () => {
  return (
    <PerlinNoise
      scale={1}
      speed={0.5}
      seed={0}
      color1="#262626"
      color2="#bde6ff"
      proportion={0.34}
      contour={0.9}
      octaveCount={2}
      persistence={1}
      lacunarity={1.5}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = perlinNoisePresets[0].params;

const PerlinNoiseWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: PerlinNoiseParams = Object.fromEntries(
      perlinNoisePresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );

    return {
      Parameters: folder({
        color1: { value: defaults.color1 },
        color2: { value: defaults.color2 },
        scale: { value: defaults.scale, min: 0, max: 2 },
        proportion: { value: defaults.contour, min: 0, max: 1 },
        contour: { value: defaults.contour, min: 0, max: 1 },
        speed: { value: defaults.speed, min: 0, max: 0.5 },
        seed: { value: defaults.seed, min: 0, max: 9999 },
        octaveCount: { value: defaults.octaveCount, min: 1, max: 8, step: 1 },
        persistence: { value: defaults.persistence, min: 0.3, max: 1 },
        lacunarity: { value: defaults.lacunarity, min: 1.5, max: 10 },
      }),
      Presets: folder(presets),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(perlinNoisePresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <PerlinNoise {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default PerlinNoiseWithControls;

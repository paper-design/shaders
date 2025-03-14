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
      color1="#262626"
      color2="#bde6ff"
      scale={1}
      proportion={0.34}
      softness={0.1}
      octaveCount={2}
      persistence={1}
      lacunarity={1.5}
      speed={0.5}
      seed={0}
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
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 100 },
          color2: { value: defaults.color2, order: 101 },
          scale: { value: defaults.scale, min: 0, max: 2, order: 200 },
          proportion: { value: defaults.softness, min: 0, max: 1, order: 300 },
          softness: { value: defaults.softness, min: 0, max: 1, order: 301 },
          octaveCount: { value: defaults.octaveCount, min: 1, max: 8, step: 1, order: 302 },
          persistence: { value: defaults.persistence, min: 0.3, max: 1, order: 303 },
          lacunarity: { value: defaults.lacunarity, min: 1.5, max: 10, order: 304 },
          speed: { value: defaults.speed, min: 0, max: 0.5, order: 400 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
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

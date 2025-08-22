'use client';

import { PerlinNoise, type PerlinNoiseParams, perlinNoisePresets, SmokeRing } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderContainer } from '@/components/shader-container';
import { ShaderDetails } from '@/components/shader-details';
/**
 * You can copy/paste this example to use PerlinNoise in your app
 */
const PerlinNoiseExample = () => {
  return <PerlinNoise style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = perlinNoisePresets[0].params;

const PerlinNoiseWithControls = () => {
  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorFront: { value: toHsla(defaults.colorFront), order: 101 },
      proportion: { value: defaults.proportion, min: 0, max: 1, order: 200 },
      softness: { value: defaults.softness, min: 0, max: 1, order: 201 },
      octaveCount: { value: defaults.octaveCount, min: 1, max: 8, step: 1, order: 202 },
      persistence: { value: defaults.persistence, min: 0.3, max: 1, order: 203 },
      lacunarity: { value: defaults.lacunarity, min: 1.5, max: 10, order: 204 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 300 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 301 },
      speed: { value: defaults.speed, min: 0, max: 0.5, order: 400 },
    };
  });

  useControls(() => {
    const presets = Object.fromEntries(
      perlinNoisePresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a colorFront param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(perlinNoisePresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer>
        <PerlinNoise {...params} />
      </ShaderContainer>
      <ShaderDetails
        name="Perlin Noise"
        currentParams={params}
        description="3D Perlin noise."
        props={{
          'colorBack, colorFront': 'Colors used for the effect.',
          'proportion': 'Blend point between 2 colors (0.5 = equal distribution).',
          'softness': 'Color transition sharpness (0 = hard edge, 1 = smooth fade).',
          'octaveCount': 'More octaves give more detailed patterns.',
          'persistence': 'Roughness, falloff between octaves.',
          'lacunarity': 'Frequency step, typically around 2. Defines how compressed the pattern is.',
          'scale': 'overall pattern zoom',
          'rotation': 'overall pattern rotation angle',
          'speed': 'animation speed',
        }}
      />
    </>
  );
};

export default PerlinNoiseWithControls;

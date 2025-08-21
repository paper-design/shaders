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
      Parameters: folder(
        {
          colorBack: { value: toHsla(defaults.colorBack), order: 100 },
          colorFront: { value: toHsla(defaults.colorFront), order: 101 },
          proportion: { value: defaults.proportion, min: 0, max: 1, order: 300 },
          softness: { value: defaults.softness, min: 0, max: 1, order: 301 },
          octaveCount: { value: defaults.octaveCount, min: 1, max: 8, step: 1, order: 302 },
          persistence: { value: defaults.persistence, min: 0.3, max: 1, order: 303 },
          lacunarity: { value: defaults.lacunarity, min: 1.5, max: 10, order: 304 },
          speed: { value: defaults.speed, min: 0, max: 0.5, order: 400 },
        },
        { order: 1 }
      ),
      Transform: folder(
        {
          scale: { value: defaults.scale, min: 0.01, max: 4, order: 400 },
          rotation: { value: defaults.rotation, min: 0, max: 360, order: 401 },
          offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 402 },
          offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 403 },
        },
        {
          order: 2,
          collapsed: false,
        }
      ),
      Fit: folder(
        {
          fit: { value: defaults.fit, options: Object.keys(ShaderFitOptions) as ShaderFit[], order: 404 },
          worldWidth: { value: 1000, min: 0, max: 5120, order: 405 },
          worldHeight: { value: 500, min: 0, max: 5120, order: 406 },
          originX: { value: defaults.originX, min: 0, max: 1, order: 407 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 408 },
        },
        {
          order: 3,
          collapsed: true,
        }
      ),
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
        }}
      />
    </>
  );
};

export default PerlinNoiseWithControls;

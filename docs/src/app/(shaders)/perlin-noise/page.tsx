'use client';

import { PerlinNoise, perlinNoisePresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderPageContent } from '@/components/shader-page-content';
import { perlinNoiseDef } from '@/shader-defs/perlin-noise-def';
import { Header } from '@/components/header';

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
    <div className="page-container">
      <Header title={perlinNoiseDef.name} />
      <PerlinNoise className="page-shader my-12" {...params} />
      <ShaderPageContent shaderDef={perlinNoiseDef} currentParams={params} />
    </div>
  );
};

export default PerlinNoiseWithControls;

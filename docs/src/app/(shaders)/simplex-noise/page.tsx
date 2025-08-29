'use client';

import { SimplexNoise, simplexNoisePresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { simplexNoiseMeta } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { ShaderContainer } from '@/components/shader-container';
import { ShaderDetails } from '@/components/shader-details';
import { simplexNoiseDef } from '@/shader-defs/simplex-noise-def';

/**
 * You can copy/paste this example to use SimplexNoise in your app
 */
const SimplexNoiseExample = () => {
  return <SimplexNoise style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = simplexNoisePresets[0].params;

const SimplexNoiseWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: simplexNoiseMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      stepsPerColor: { value: defaults.stepsPerColor, min: 1, max: 10, step: 1, order: 300 },
      softness: { value: defaults.softness, min: 0, max: 1, order: 301 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 400 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 401 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      simplexNoisePresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => {
          const { colors, ...presetParams } = preset;
          setColors(colors);
          setParamsSafe(params, setParams, presetParams);
        }),
      ])
    );
    return {
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(simplexNoisePresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer>
        <SimplexNoise {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails shaderDef={simplexNoiseDef} currentParams={{ ...params, colors }} />
    </>
  );
};

export default SimplexNoiseWithControls;

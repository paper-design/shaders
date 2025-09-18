'use client';

import { SimplexNoise, simplexNoisePresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { simplexNoiseMeta } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { ShaderDetails } from '@/components/shader-details';
import { simplexNoiseDef } from '@/shader-defs/simplex-noise-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

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
      speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 401 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 402 },
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
  useUrlParams(params, setParams, simplexNoiseDef, setColors);
  usePresetHighlight(simplexNoisePresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={simplexNoiseDef} currentParams={{ colors, ...params }}>
        <SimplexNoise {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails shaderDef={simplexNoiseDef} currentParams={{ colors, ...params }} />
    </>
  );
};

export default SimplexNoiseWithControls;

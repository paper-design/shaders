'use client';

import { GrainGradient, grainGradientPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { grainGradientMeta, GrainGradientShape, GrainGradientShapes } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { grainGradientDef } from '@/shader-defs/grain-gradient-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = grainGradientPresets[0].params;

const GrainGradientWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: grainGradientMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      softness: { value: defaults.softness, min: 0, max: 1, order: 200 },
      intensity: { value: defaults.intensity, min: 0, max: 1, order: 201 },
      noise: { value: defaults.noise, min: 0, max: 1, order: 202 },
      shape: {
        value: defaults.shape,
        options: Object.keys(GrainGradientShapes) as GrainGradientShape[],
        order: 203,
      },
      speed: { value: defaults.speed, min: 0, max: 2, order: 300 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 301 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 303 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 304 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      grainGradientPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  useUrlParams(params, setParams, grainGradientDef, setColors);
  usePresetHighlight(grainGradientPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={grainGradientDef} currentParams={{ colors, ...params }}>
        <GrainGradient {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails shaderDef={grainGradientDef} currentParams={{ colors, ...params }} />
    </>
  );
};

export default GrainGradientWithControls;

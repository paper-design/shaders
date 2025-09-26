'use client';

import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { dotOrbitMeta } from '@paper-design/shaders';
import { DotOrbit, dotOrbitPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { dotOrbitDef } from '@/shader-defs/dot-orbit-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = dotOrbitPresets[0].params;

const DotOrbitWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: dotOrbitMeta.maxColorCount,
  });
  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      dotOrbitPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );

    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      stepsPerColor: { value: defaults.stepsPerColor, min: 1, max: 4, step: 1, order: 200 },
      size: { value: defaults.size, min: 0, max: 1, order: 201 },
      sizeRange: { value: defaults.sizeRange, min: 0, max: 1, order: 202 },
      spreading: { value: defaults.spreading, min: 0, max: 1, order: 203 },
      speed: { value: defaults.speed, min: 0, max: 20, order: 300 },
      scale: { value: defaults.scale, min: 0.01, max: 5, order: 301 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      dotOrbitPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  useUrlParams(params, setParams, dotOrbitDef, setColors);
  usePresetHighlight(dotOrbitPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={dotOrbitDef} currentParams={{ colors, ...params }}>
        <DotOrbit {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails shaderDef={dotOrbitDef} currentParams={{ colors, ...params }} />
    </>
  );
};

export default DotOrbitWithControls;

'use client';

import { Metaballs, metaballsPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { metaballsMeta } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { metaballsDef } from '@/shader-defs/metaballs-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = metaballsPresets[0].params;

const MetaballsWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: metaballsMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      count: { value: defaults.count, min: 1, max: metaballsMeta.maxBallsCount, order: 200 },
      size: { value: defaults.size, min: 0, max: 1, order: 201 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 300 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 301 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 302 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 303 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      metaballsPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  useUrlParams(params, setParams, metaballsDef, setColors);
  usePresetHighlight(metaballsPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer>
        <Metaballs {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails shaderDef={metaballsDef} currentParams={{ ...params, colors }} />
    </>
  );
};

export default MetaballsWithControls;

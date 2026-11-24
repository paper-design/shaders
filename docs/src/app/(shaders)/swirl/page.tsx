'use client';

import { Swirl, swirlPresets, swirlMeta } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { swirlDef } from '@/shader-defs/swirl-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = swirlPresets[0].params;

const SwirlWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: swirlMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      bandCount: { value: defaults.bandCount, min: 0, max: 15, step: 1, order: 200 },
      twist: { value: defaults.twist, min: 0, max: 1, order: 201 },
      center: { value: defaults.center, min: 0, max: 1, order: 202 },
      proportion: { value: defaults.proportion, min: 0, max: 1, order: 203 },
      softness: { value: defaults.softness, min: 0, max: 1, order: 204 },
      noise: { value: defaults.noise, min: 0, max: 1, order: 205 },
      noiseFrequency: { value: defaults.noiseFrequency, min: 0, max: 1, order: 206 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 300 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 301 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 303 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 304 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      swirlPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  // shaders when navigating (if two shaders have a colorBack param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, swirlDef, setColors);
  usePresetHighlight(swirlPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={swirlDef} currentParams={{ colors, ...params }}>
        <Swirl {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails shaderDef={swirlDef} currentParams={{ colors, ...params }} />
    </>
  );
};

export default SwirlWithControls;

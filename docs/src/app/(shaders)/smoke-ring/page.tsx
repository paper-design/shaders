'use client';

import { SmokeRing, smokeRingPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { smokeRingMeta } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { smokeRingDef } from '@/shader-defs/smoke-ring-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = smokeRingPresets[0].params;

const SmokeRingWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: smokeRingMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      noiseScale: { value: defaults.noiseScale, min: 0.01, max: 5, order: 200 },
      noiseIterations: {
        value: defaults.noiseIterations,
        min: 1,
        max: smokeRingMeta.maxNoiseIterations,
        step: 1,
        order: 201,
      },
      radius: { value: defaults.radius, min: 0, max: 1, order: 202 },
      thickness: { value: defaults.thickness, min: 0.01, max: 1, order: 203 },
      innerShape: { value: defaults.innerShape, min: 0, max: 4, order: 204 },
      speed: { value: defaults.speed, min: 0, max: 4, order: 300 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 301 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 303 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 304 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      smokeRingPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  // shaders when navigating (if two shaders have a colorInner param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, smokeRingDef, setColors);
  usePresetHighlight(smokeRingPresets, params);
  cleanUpLevaParams(params);

  // const { reverse, ...shaderParams } = { ...params, speed: params.speed * (params.reverse ? -1 : 1) };

  return (
    <>
      <ShaderContainer shaderDef={smokeRingDef} currentParams={{ colors, ...params }}>
        <SmokeRing {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails shaderDef={smokeRingDef} currentParams={{ colors, ...params }} />
    </>
  );
};

export default SmokeRingWithControls;

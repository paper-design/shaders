'use client';

import { StaticRadialGradient, staticRadialGradientPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { staticRadialGradientMeta } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { staticRadialGradientDef } from '@/shader-defs/static-radial-gradient-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = staticRadialGradientPresets[0].params;

const StaticRadialGradientWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: staticRadialGradientMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      radius: { value: defaults.radius, min: 0, max: 3, order: 200 },
      focalDistance: { value: defaults.focalDistance, min: 0, max: 3, order: 201 },
      focalAngle: { value: defaults.focalAngle, min: 0, max: 360, order: 202 },
      falloff: { value: defaults.falloff, min: -1, max: 1, order: 201 },
      mixing: { value: defaults.mixing, min: 0, max: 1, order: 204 },
      distortion: { value: defaults.distortion, min: 0, max: 1, order: 205 },
      distortionShift: { value: defaults.distortionShift, min: -1, max: 1, order: 206 },
      distortionFreq: { value: defaults.distortionFreq, min: 0, max: 20, step: 1, order: 207 },
      grainMixer: { value: defaults.grainMixer, min: 0, max: 1, order: 208 },
      grainOverlay: { value: defaults.grainOverlay, min: 0, max: 1, order: 209 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 300 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 301 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      staticRadialGradientPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  useUrlParams(params, setParams, staticRadialGradientDef, setColors);
  usePresetHighlight(staticRadialGradientPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={staticRadialGradientDef} currentParams={{ colors, ...params }}>
        <StaticRadialGradient {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails shaderDef={staticRadialGradientDef} currentParams={{ colors, ...params }} />
    </>
  );
};

export default StaticRadialGradientWithControls;

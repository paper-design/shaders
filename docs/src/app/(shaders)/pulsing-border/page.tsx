'use client';

import { PulsingBorder, pulsingBorderPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { pulsingBorderMeta } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderPageContent } from '@/components/shader-page-content';
import { pulsingBorderDef } from '@/shader-defs/pulsing-border-def';
import { Header } from '@/components/header';

const { worldWidth, worldHeight, ...defaults } = pulsingBorderPresets[0].params;

const PulsingBorderWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: pulsingBorderMeta.maxColorCount,
  });
  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      roundness: { value: defaults.roundness, min: 0, max: 1, order: 200 },
      thickness: { value: defaults.thickness, min: 0, max: 1, order: 200 },
      softness: { value: defaults.softness, min: 0, max: 1, order: 202 },
      intensity: { value: defaults.intensity, min: 0, max: 1, order: 203 },
      bloom: { value: defaults.bloom, min: 0, max: 1, order: 204 },
      spots: {
        value: defaults.spots,
        min: 1,
        max: pulsingBorderMeta.maxSpots,
        step: 1,
        order: 205,
      },
      spotSize: { value: defaults.spotSize, min: 0, max: 1, order: 206 },
      pulse: { value: defaults.pulse, min: 0, max: 1, order: 207 },
      smoke: { value: defaults.smoke, min: 0, max: 1, order: 208 },
      smokeSize: { value: defaults.smokeSize, min: 0, max: 1, order: 209 },
      scale: { value: defaults.scale, min: 0.01, max: 1, order: 300 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 301 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 302 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 303 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      pulsingBorderPresets.map(({ name, params: preset }) => [
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
  usePresetHighlight(pulsingBorderPresets, params);
  cleanUpLevaParams(params);

  return (
    <div className="page-container">
      <Header title={pulsingBorderDef.name} />
      <PulsingBorder className="my-12 page-shader" {...params} colors={colors} />
      <ShaderPageContent shaderDef={pulsingBorderDef} currentParams={{ ...params, colors }} />
    </div>
  );
};

export default PulsingBorderWithControls;

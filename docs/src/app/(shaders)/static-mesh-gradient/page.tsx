'use client';

import { StaticMeshGradient, staticMeshGradientPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { staticMeshGradientMeta } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { ShaderPageContent } from '@/components/shader-page-content';
import { staticMeshGradientDef } from '@/shader-defs/static-mesh-gradient-def';
import { Header } from '@/components/header';
import { ShaderContainer } from '@/components/shader-container';

const { worldWidth, worldHeight, ...defaults } = staticMeshGradientPresets[0].params;

const StaticMeshGradientWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: staticMeshGradientMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      positions: { value: defaults.positions, min: 0, max: 100, order: 200 },
      waveX: { value: defaults.waveX, min: 0, max: 1, order: 201 },
      waveXShift: { value: defaults.waveXShift, min: 0, max: 1, order: 202 },
      waveY: { value: defaults.waveY, min: 0, max: 1, order: 203 },
      waveYShift: { value: defaults.waveYShift, min: 0, max: 1, order: 204 },
      mixing: { value: defaults.mixing, min: 0, max: 1, order: 205 },
      grainMixer: { value: defaults.grainMixer, min: 0, max: 1, order: 206 },
      grainOverlay: { value: defaults.grainOverlay, min: 0, max: 1, order: 207 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 300 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 301 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 302 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 303 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      staticMeshGradientPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  usePresetHighlight(staticMeshGradientPresets, params);
  cleanUpLevaParams(params);

  return (
    <div className="page-container">
      <Header title={staticMeshGradientDef.name} />
      <ShaderContainer>
        <StaticMeshGradient {...params} colors={colors} />
      </ShaderContainer>
      <ShaderPageContent shaderDef={staticMeshGradientDef} currentParams={{ ...params, colors }} />
    </div>
  );
};

export default StaticMeshGradientWithControls;

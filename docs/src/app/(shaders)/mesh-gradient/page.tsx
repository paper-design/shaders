'use client';

import { MeshGradient, meshGradientPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { meshGradientMeta } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { ShaderDetails } from '@/components/shader-details';
import { meshGradientDef } from '@/shader-defs/mesh-gradient-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = meshGradientPresets[0].params;

const MeshGradientWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: meshGradientMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      distortion: { value: defaults.distortion, min: 0, max: 1, order: 200 },
      swirl: { value: defaults.swirl, min: 0, max: 1, order: 201 },
      grainMixer: { value: defaults.grainMixer, min: 0, max: 1, order: 202 },
      grainOverlay: { value: defaults.grainOverlay, min: 0, max: 1, order: 203 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 300 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 301 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 303 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 304 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      meshGradientPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  useUrlParams(params, setParams, meshGradientDef, setColors);
  usePresetHighlight(meshGradientPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={meshGradientDef} currentParams={{ colors, ...params }}>
        <MeshGradient {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails shaderDef={meshGradientDef} currentParams={{ colors, ...params }} />
    </>
  );
};

export default MeshGradientWithControls;

'use client';

import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { GodRays, godRaysPresets } from '@paper-design/shaders-react';
import { godRaysMeta } from '@paper-design/shaders';
import { useControls, button, folder } from 'leva';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderPageContent } from '@/components/shader-page-content';
import { godRaysDef } from '@/shader-defs/god-rays-def';
import { Header } from '@/components/header';
import { ShaderContainer } from '@/components/shader-container';

const { worldWidth, worldHeight, ...defaults } = godRaysPresets[0].params;

const GodRaysWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: godRaysMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorBloom: { value: toHsla(defaults.colorBloom), order: 101 },
      bloom: { value: defaults.bloom, min: 0, max: 1, order: 200 },
      intensity: { value: defaults.intensity, min: 0, max: 1, order: 201 },
      density: { value: defaults.density, min: 0, max: 1, order: 204 },
      spotty: { value: defaults.spotty, min: 0, max: 1, order: 205 },
      midSize: { value: defaults.midSize, min: 0, max: 1, order: 206 },
      midIntensity: { value: defaults.midIntensity, min: 0, max: 1, order: 207 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 300 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 301 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 302 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 303 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
    };
  });

  useControls(() => {
    const presets = Object.fromEntries(
      godRaysPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  usePresetHighlight(godRaysPresets, params);
  cleanUpLevaParams(params);

  return (
    <div className="page-container">
      <Header title={godRaysDef.name} />

      <ShaderContainer>
        <GodRays {...params} colors={colors} />
      </ShaderContainer>

      <div className="page-contents">
        <ShaderPageContent shaderDef={godRaysDef} currentParams={{ ...params, colors }} />
      </div>
    </div>
  );
};

export default GodRaysWithControls;

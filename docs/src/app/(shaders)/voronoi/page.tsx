'use client';

import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { Voronoi, voronoiPresets } from '@paper-design/shaders-react';
import { voronoiMeta } from '@paper-design/shaders';
import { useControls, button, folder } from 'leva';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { voronoiDef } from '@/shader-defs/voronoi-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = voronoiPresets[0].params;

const VoronoiWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: voronoiMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorGlow: { value: toHsla(defaults.colorGlow), order: 100 },
      colorGap: { value: toHsla(defaults.colorGap), order: 101 },
      stepsPerColor: { value: defaults.stepsPerColor, min: 1, max: 3, step: 1, order: 200 },
      distortion: { value: defaults.distortion, min: 0, max: 0.5, order: 201 },
      gap: { value: defaults.gap, min: 0, max: 0.1, order: 202 },
      glow: { value: defaults.glow, min: 0, max: 1, order: 203 },
      speed: { value: defaults.speed, min: 0, max: 1, order: 300 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 301 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      voronoiPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  useUrlParams(params, setParams, voronoiDef, setColors);
  usePresetHighlight(voronoiPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={voronoiDef} currentParams={{ colors, ...params }}>
        <Voronoi {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails
        shaderDef={voronoiDef}
        currentParams={{ colors, ...params }}
        notes={
          <>
            Thanks to{' '}
            <a href="https://x.com/iquilezles" target="_blank" rel="noopener">
              Inigo Quilez
            </a>{' '}
            for the amazing{' '}
            <a href="https://iquilezles.org/articles/voronoilines/" target="_blank" rel="noopener">
              solution on Voronoi cell boundaries
            </a>
            .
          </>
        }
      />
    </>
  );
};

export default VoronoiWithControls;

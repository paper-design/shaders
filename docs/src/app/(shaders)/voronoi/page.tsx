'use client';

import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { Voronoi, voronoiPresets } from '@paper-design/shaders-react';
import { voronoiMeta } from '@paper-design/shaders';
import { useControls, button, folder } from 'leva';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderContainer } from '@/components/shader-container';
import { ShaderPageContent } from '@/components/shader-page-content';
import { voronoiDef } from '@/shader-defs/voronoi-def';

/**
 * You can copy/paste this example to use Voronoi in your app
 */
const VoronoiExample = () => {
  return <Voronoi style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

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
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 302 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 303 },
      speed: { value: defaults.speed, min: 0, max: 1, order: 400 },
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
  usePresetHighlight(voronoiPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer>
        <Voronoi {...params} colors={colors} />
      </ShaderContainer>
      <ShaderPageContent shaderDef={voronoiDef} currentParams={{ ...params, colors }} />
    </>
  );
};

export default VoronoiWithControls;

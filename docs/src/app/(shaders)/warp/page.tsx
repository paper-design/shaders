'use client';

import { Warp, WarpPattern, warpPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { warpMeta, WarpPatterns } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { ShaderDetails } from '@/components/shader-details';
import { warpDef } from '@/shader-defs/warp-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = warpPresets[0].params;

const WarpWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: warpMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      proportion: { value: defaults.proportion, min: 0, max: 1, order: 100 },
      softness: { value: defaults.softness, min: 0, max: 1, order: 101 },
      distortion: { value: defaults.distortion, min: 0, max: 1, order: 102 },
      swirl: { value: defaults.swirl, min: 0, max: 1, order: 103 },
      swirlIterations: { value: defaults.swirlIterations, min: 0, max: 20, order: 104 },
      shape: { value: defaults.shape, options: Object.keys(WarpPatterns) as WarpPattern[], order: 105 },
      shapeScale: { value: defaults.shapeScale, min: 0, max: 1, order: 106 },
      speed: { value: defaults.speed, min: 0, max: 20, order: 300 },
      scale: { value: defaults.scale, min: 0.01, max: 5, order: 301 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      warpPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  useUrlParams(params, setParams, warpDef, setColors);
  usePresetHighlight(warpPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={warpDef} currentParams={{ colors, ...params }}>
        <Warp {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails shaderDef={warpDef} currentParams={{ colors, ...params }} />
    </>
  );
};

export default WarpWithControls;

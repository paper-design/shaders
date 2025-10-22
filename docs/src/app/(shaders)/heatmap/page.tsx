'use client';

import { Heatmap, heatmapMeta, heatmapPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { Suspense, useState } from 'react';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { heatmapDef } from '@/shader-defs/heatmap-def';
import { useColors } from '@/helpers/use-colors';
import { levaImageButton } from '@/helpers/leva-image-button';

const { worldWidth, worldHeight, ...defaults } = heatmapPresets[0].params;

const HeatmapWithControls = () => {
  const [image, setImage] = useState<HTMLImageElement | string>('/images/logos/diamond.svg');

  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: heatmapMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 102 },
      contour: { value: defaults.contour, min: 0, max: 1, order: 103 },
      angle: { value: defaults.angle, min: 0, max: 360, order: 104 },
      noise: { value: defaults.noise, min: 0, max: 1, order: 105 },
      innerGlow: { value: defaults.innerGlow, min: 0, max: 1, order: 106 },
      outerGlow: { value: defaults.outerGlow, min: 0, max: 1, order: 107 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 300 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 301 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 303 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 304 },
      Image: folder(
        {
          'Upload image': levaImageButton((img?: HTMLImageElement) => setImage(img ?? '')),
        },
        { order: -1 }
      ),
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      heatmapPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => {
          const { colors, ...presetParams } = preset;
          setColors(colors);
          setParamsSafe(params, setParams, presetParams);
        }),
      ])
    );
    return {
      Presets: folder(presets, { order: -2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, heatmapDef, setColors);
  usePresetHighlight(heatmapPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={heatmapDef} currentParams={{ colors, ...params }}>
        <Suspense fallback={null}>
          <Heatmap {...params} colors={colors} image={image} suspendWhenProcessingImage />
        </Suspense>
      </ShaderContainer>
      <ShaderDetails shaderDef={heatmapDef} currentParams={{ colors, ...params }} codeSampleImageName="images/logos/diamond.svg" />
    </>
  );
};

export default HeatmapWithControls;

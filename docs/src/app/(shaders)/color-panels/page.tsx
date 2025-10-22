'use client';

import { ColorPanels, colorPanelsPresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { colorPanelsMeta } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { colorPanelsDef } from '@/shader-defs/color-panels-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = colorPanelsPresets[0].params;

const ColorPanelsWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: colorPanelsMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      density: { value: defaults.density, min: 0.25, max: 7, order: 200 },
      angle1: { value: defaults.angle1, min: -1, max: 1, order: 201 },
      angle2: { value: defaults.angle2, min: -1, max: 1, order: 202 },
      length: { value: defaults.length, min: 0, max: 3, order: 203 },
      edges: { value: defaults.edges, order: 204 },
      blur: { value: defaults.blur, min: 0, max: 0.5, order: 205 },
      fadeIn: { value: defaults.fadeIn, min: 0, max: 1, order: 205 },
      fadeOut: { value: defaults.fadeOut, min: 0, max: 1, order: 207 },
      gradient: { value: defaults.gradient, min: 0, max: 1, order: 208 },
      speed: { value: defaults.speed, min: 0, max: 4, order: 300 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 301 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 303 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 304 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      colorPanelsPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  useUrlParams(params, setParams, colorPanelsDef, setColors);
  usePresetHighlight(colorPanelsPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={colorPanelsDef} currentParams={{ colors, ...params }}>
        <ColorPanels {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails shaderDef={colorPanelsDef} currentParams={{ colors, ...params }} />
    </>
  );
};

export default ColorPanelsWithControls;

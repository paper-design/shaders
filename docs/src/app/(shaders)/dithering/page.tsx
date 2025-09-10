'use client';

import { Dithering, ditheringPresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { DitheringShape, DitheringShapes, DitheringType, DitheringTypes } from '@paper-design/shaders';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { ditheringDef } from '@/shader-defs/dithering-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = ditheringPresets[0].params;

const DitheringWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      ditheringPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorFront: { value: toHsla(defaults.colorFront), order: 101 },
      shape: { value: defaults.shape, options: Object.keys(DitheringShapes) as DitheringShape[], order: 200 },
      type: { value: defaults.type, options: Object.keys(DitheringTypes) as DitheringType[], order: 201 },
      pxSize: { value: defaults.pxSize, min: 1, max: 20, order: 202 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 300 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 301 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 302 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 303 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a colorBack param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, ditheringDef);
  usePresetHighlight(ditheringPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={ditheringDef} currentParams={params}>
        <Dithering {...params} />
      </ShaderContainer>
      <ShaderDetails shaderDef={ditheringDef} currentParams={params} />
    </>
  );
};

export default DitheringWithControls;

'use client';

import { Spiral, spiralPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { spiralDef } from '@/shader-defs/spiral-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const firstPresetParams = spiralPresets[0].params;
const { worldWidth, worldHeight, ...defaults } = {
  ...firstPresetParams,
  speed: Math.abs(firstPresetParams.speed),
  reverse: firstPresetParams.speed < 0,
  style: { background: 'hsla(0, 0%, 0%, 0)' },
};

const SpiralWithControls = () => {
  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorFront: { value: toHsla(defaults.colorFront), order: 101 },
      density: { value: defaults.density, min: 0, max: 1, order: 200 },
      distortion: { value: defaults.distortion, min: 0, max: 1, order: 201 },
      strokeWidth: { value: defaults.strokeWidth, min: 0, max: 1, order: 202 },
      strokeTaper: { value: defaults.strokeTaper, min: 0, max: 1, order: 203 },
      strokeCap: { value: defaults.strokeCap, min: 0, max: 1, order: 204 },
      noise: { value: defaults.noise, min: 0, max: 1, order: 205 },
      noiseFrequency: { value: defaults.noiseFrequency, min: 0, max: 1, order: 206 },
      softness: { value: defaults.softness, min: 0, max: 1, order: 207 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 300 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 301 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 303 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 304 },
    };
  });

  useControls(() => {
    const presets = Object.fromEntries(
      spiralPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a colorBack param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, spiralDef);
  usePresetHighlight(spiralPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={spiralDef} currentParams={params}>
        <Spiral {...params} />
      </ShaderContainer>
      <ShaderDetails shaderDef={spiralDef} currentParams={params} />
    </>
  );
};

export default SpiralWithControls;

'use client';

import { Waves, type WavesParams, wavesPresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { wavesDef } from '@/shader-defs/waves-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = wavesPresets[0].params;

const WavesWithControls = () => {
  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorFront: { value: toHsla(defaults.colorFront), order: 101 },
      frequency: { value: defaults.frequency, min: 0, max: 2, order: 300 },
      amplitude: { value: defaults.amplitude, min: 0, max: 1, order: 301 },
      spacing: { value: defaults.spacing, min: 0, max: 2, order: 302 },
      proportion: { value: defaults.proportion, min: 0, max: 1, order: 303 },
      softness: { value: defaults.softness, min: 0, max: 1, order: 304 },
      shape: { value: defaults.shape, min: 0, max: 3, order: 350 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 400 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 401 },
    };
  });

  useControls(() => {
    const presets = Object.fromEntries(
      wavesPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a colorFront param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, wavesDef);
  usePresetHighlight(wavesPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={wavesDef} currentParams={params}>
        <Waves {...params} />
      </ShaderContainer>
      <ShaderDetails shaderDef={wavesDef} currentParams={params} />
    </>
  );
};

export default WavesWithControls;

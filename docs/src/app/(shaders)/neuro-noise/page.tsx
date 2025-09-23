'use client';

import { NeuroNoise, neuroNoisePresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { neuroNoiseDef } from '@/shader-defs/neuro-noise-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = neuroNoisePresets[0].params;

const NeuroNoiseWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      neuroNoisePresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );

    return {
      colorFront: { value: toHsla(defaults.colorFront), order: 100 },
      colorMid: { value: toHsla(defaults.colorMid), order: 101 },
      colorBack: { value: toHsla(defaults.colorBack), order: 102 },
      brightness: { value: defaults.brightness, min: 0, max: 1, order: 200 },
      contrast: { value: defaults.contrast, min: 0, max: 1, order: 201 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 300 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 301 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, neuroNoiseDef);
  usePresetHighlight(neuroNoisePresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={neuroNoiseDef} currentParams={params}>
        <NeuroNoise {...params} />
      </ShaderContainer>
      <ShaderDetails
        shaderDef={neuroNoiseDef}
        currentParams={params}
        notes={
          <>
            Thanks to{' '}
            <a href="https://x.com/zozuar" target="_blank" rel="noopener">
              zozuar
            </a>{' '}
            for the amazing{' '}
            <a href="https://twigl.app/?ol=true&ss=-NOAlYulOVLklxMdxBDx" target="_blank" rel="noopener">
              recursive fractal noise algorithm
            </a>
            .
          </>
        }
      />
    </>
  );
};

export default NeuroNoiseWithControls;

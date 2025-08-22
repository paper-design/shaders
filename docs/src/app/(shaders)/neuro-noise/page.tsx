'use client';

import { NeuroNoise, neuroNoisePresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderContainer } from '@/components/shader-container';
import { ShaderDetails } from '@/components/shader-details';

/**
 * You can copy/paste this example to use NeuroNoise in your app
 */
const NeuroNoiseExample = () => {
  return <NeuroNoise style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

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
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 300 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 301 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(neuroNoisePresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer>
        <NeuroNoise {...params} />
      </ShaderContainer>
      <ShaderDetails
        name="Neuro Noise"
        currentParams={params}
        description="Fractal-like structure made of several layers of sine arches."
        props={{
          'colorBack, colorMid, colorFront': 'Colors used for the effect.',
          'brightness': 'Brightness.',
          'contrast': 'Contrast.',
          'scale': 'Overall pattern zoom.',
          'rotation': 'Overall pattern rotation angle.',
          'speed': 'Animation speed.',
        }}
      />
    </>
  );
};

export default NeuroNoiseWithControls;

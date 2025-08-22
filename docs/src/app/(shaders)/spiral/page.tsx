'use client';

import { Spiral, type SpiralParams, spiralPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderContainer } from '@/components/shader-container';
import { ShaderDetails } from '@/components/shader-details';

/**
 * You can copy/paste this example to use Spiral in your app
 */
const SpiralExample = () => {
  return <Spiral style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

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
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 300 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 301 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 302 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 303 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
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
  usePresetHighlight(spiralPresets, params);
  cleanUpLevaParams(params);

  const { reverse, ...shaderParams } = { ...params, speed: params.speed * (params.reverse ? -1 : 1) };

  return (
    <>
      <ShaderContainer>
        <Spiral {...shaderParams} />
      </ShaderContainer>
      <ShaderDetails
        name="Spiral"
        currentParams={shaderParams}
        description="2-color spiral shape."
        props={{
          'colorBack, colorFront': 'Colors used for the effect.',
          'density': 'Spacing falloff to simulate radial perspective (0 = no perspective).',
          'strokeWidth': 'Thickness of stroke.',
          'strokeTaper': 'Stroke loosing width further from center (0 for full visibility).',
          'distortion': 'Per-arch shift.',
          'strokeCap': 'Extra width at the center (no effect on strokeWidth = 0.5).',
          'noiseFrequency, noise': 'Simplex noise distortion over the shape.',
          'softness': 'Color transition sharpness (0 = hard edge, 1 = smooth fade).',
          'offsetX, offsetY': 'position of the center',
          'scale': 'overall pattern zoom',
          'rotation': 'overall pattern rotation angle',
          'speed': 'animation speed',
        }}
      />
    </>
  );
};

export default SpiralWithControls;

'use client';

import { LiquidMetal, liquidMetalPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { LiquidMetalShapes, LiquidMetalShape } from '@paper-design/shaders';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderContainer } from '@/components/shader-container';
import { ShaderDetails } from '@/components/shader-details';
import { liquidMetalDef } from '@/shader-defs/liquid-metal-def';

/**
 * You can copy/paste this example to use LiquidMetal in your app
 */
const LiquidMetalExample = () => {
  return <LiquidMetal style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = liquidMetalPresets[0].params;

const LiquidMetalWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      liquidMetalPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorTint: { value: toHsla(defaults.colorTint), order: 101 },
      repetition: { value: defaults.repetition, min: 1, max: 10, order: 200 },
      softness: { value: defaults.softness, min: 0, max: 1, order: 201 },
      shiftRed: { value: defaults.shiftRed, min: -1, max: 1, order: 202 },
      shiftBlue: { value: defaults.shiftBlue, min: -1, max: 1, order: 203 },
      distortion: { value: defaults.distortion, min: 0, max: 1, order: 204 },
      contour: { value: defaults.contour, min: 0, max: 1, order: 205 },
      shape: { value: defaults.shape, options: Object.keys(LiquidMetalShapes) as LiquidMetalShape[], order: 206 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 300 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 301 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 302 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 303 },
      speed: { value: defaults.speed, min: 0, max: 4, order: 400 },
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(liquidMetalPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer>
        <LiquidMetal {...params} />
      </ShaderContainer>
      <ShaderDetails shaderDef={liquidMetalDef} currentParams={params} />
    </>
  );
};

export default LiquidMetalWithControls;

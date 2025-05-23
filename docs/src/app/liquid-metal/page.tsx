'use client';

import { LiquidMetal, type LiquidMetalParams, liquidMetalPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { LiquidMetalShapes, LiquidMetalShape, ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { toHsla } from '@/helpers/to-hsla';

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
      Parameters: folder(
        {
          colorTint: { value: toHsla(defaults.colorTint), order: 100 },
          repetition: { value: defaults.repetition, min: 1, max: 10, order: 300 },
          softness: { value: defaults.softness, min: 0, max: 1, order: 301 },
          rDispersion: { value: defaults.rDispersion, min: -1, max: 1, order: 302 },
          bDispersion: { value: defaults.bDispersion, min: -1, max: 1, order: 302 },
          distortion: { value: defaults.distortion, min: 0, max: 1, order: 303 },
          contour: { value: defaults.contour, min: 0, max: 1, order: 304 },
          shape: { value: defaults.shape, options: Object.keys(LiquidMetalShapes) as LiquidMetalShape[], order: 350 },
          speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
        },
        { order: 1 }
      ),
      Transform: folder(
        {
          scale: { value: defaults.scale, min: 0.01, max: 4, order: 400 },
          rotation: { value: defaults.rotation, min: 0, max: 360, order: 401 },
          offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 402 },
          offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 403 },
        },
        {
          order: 2,
          collapsed: false,
        }
      ),
      Fit: folder(
        {
          fit: { value: defaults.fit, options: Object.keys(ShaderFitOptions) as ShaderFit[], order: 404 },
          worldWidth: { value: 0, min: 0, max: 5120, order: 405 },
          worldHeight: { value: 0, min: 0, max: 5120, order: 406 },
          originX: { value: defaults.originX, min: 0, max: 1, order: 407 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 408 },
        },
        {
          order: 3,
          collapsed: false,
        }
      ),
      Presets: folder(presets, { order: 10 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(liquidMetalPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <LiquidMetal {...params} className="fixed size-full" />
    </>
  );
};

export default LiquidMetalWithControls;

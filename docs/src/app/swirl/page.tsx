'use client';

import { Swirl, type SwirlParams, swirlPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, ShaderFitOptions } from '@paper-design/shaders';

/**
 * You can copy/paste this example to use Swirl in your app
 */
const SwirlExample = () => {
  return <Swirl color1="#90e32b" color2="#2c8618" style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const firstPresetParams = swirlPresets[0].params;
const { worldWidth, worldHeight, ...defaults } = {
  ...firstPresetParams,
  speed: Math.abs(firstPresetParams.speed),
  reverse: firstPresetParams.speed < 0,
  style: { background: 'hsla(0, 0%, 0%, 0)' },
};

const SwirlWithControls = () => {
  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 100 },
          color2: { value: defaults.color2, order: 101 },
          color3: { value: defaults.color3, order: 102 },
          bandCount: { value: defaults.bandCount, min: 0, max: 10, order: 201 },
          twist: { value: defaults.twist, min: 0, max: 1, order: 202 },
          speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
          reverse: { value: defaults.reverse, order: 401 },
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
          worldWidth: { value: 1000, min: 1, max: 5120, order: 405 },
          worldHeight: { value: 500, min: 1, max: 5120, order: 406 },
          originX: { value: defaults.originX, min: 0, max: 1, order: 407 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 408 },
        },
        {
          order: 3,
          collapsed: true,
        }
      ),
    };
  });

  useControls(() => {
    const presets = Object.fromEntries(
      swirlPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Presets: folder(presets, { order: 10 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a colorBack param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(swirlPresets, params);
  cleanUpLevaParams(params);

  const { reverse, ...shaderParams } = { ...params, speed: params.speed * (params.reverse ? -1 : 1) };

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Swirl className="fixed size-full" {...shaderParams} />
    </>
  );
};

export default SwirlWithControls;

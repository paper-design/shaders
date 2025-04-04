'use client';

import { Metaballs, type MetaballsParams, metaballsPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit } from '@paper-design/shaders';
import { ShaderFitOptions } from '@paper-design/shaders';

/**
 * You can copy/paste this example to use Metaballs in your app
 */
const MetaballsExample = () => {
  return (
    <Metaballs
      color1="#f42547"
      color2="#eb4763"
      color3="#f49d71"
      scale={1}
      ballSize={1}
      visibilityRange={0.4}
      speed={1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = {
  ...metaballsPresets[0].params,
  style: { background: 'hsla(0, 0%, 0%, 0)' },
};

const MetaballsWithControls = () => {
  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 100 },
          color2: { value: defaults.color2, order: 101 },
          color3: { value: defaults.color3, order: 102 },
          ballSize: { value: defaults.ballSize, min: 0, max: 2, order: 300 },
          visibilityRange: { value: defaults.visibilityRange, min: 0.05, max: 1, order: 301 },
          speed: { value: defaults.speed, min: 0, max: 1, order: 400 },
        },
        { order: 1 }
      ),
      Size: folder(
        {
          fit: { value: defaults.fit, options: Object.keys(ShaderFitOptions) as ShaderFit[], order: 400 },
          scale: { value: defaults.scale, min: 0.01, max: 4, order: 401 },
          rotation: { value: defaults.rotation, min: 0, max: 360, order: 402 },
          worldWidth: { value: 1000, min: 1, max: 5120, order: 406 },
          worldHeight: { value: 500, min: 1, max: 5120, order: 407 },
        },
        {
          order: 2,
          collapsed: false,
        }
      ),
      Position: folder(
        {
          originX: { value: defaults.originX, min: 0, max: 1, order: 402 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 403 },
          offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 404 },
          offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 405 },
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
      metaballsPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Presets: folder(presets, { order: 10 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(metaballsPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Metaballs className="fixed size-full" {...params} />
    </>
  );
};

export default MetaballsWithControls;
